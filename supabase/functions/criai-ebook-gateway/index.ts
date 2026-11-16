// CRIAÍ — gated digital guide checkout and paid-delivery gateway.
// Configure CRIAI_MP_ACCESS_TOKEN and CRIAI_MP_WEBHOOK_SECRET as Supabase secrets.
// Never publish the paid PDFs in the public GitHub Pages repository.
import postgres from "npm:postgres@3.4.5";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SITE = "https://criai.xrmovi.com.br";
const API = "https://api.mercadopago.com";
const BUCKET = "criai-paid-ebooks";
const FILES = { pt: "criai-ia-pt-2026.pdf", en: "criai-ia-en-2026.pdf" } as const;
const PRICES = { pt: { amount: 49.90, currency: "BRL" }, en: { amount: 9.00, currency: "USD" } } as const;
const envToken = () => Deno.env.get("CRIAI_MP_ACCESS_TOKEN") || "";
const envWebhookSecret = () => Deno.env.get("CRIAI_MP_WEBHOOK_SECRET") || "";
const databaseUrl = Deno.env.get("SUPABASE_DB_URL") || "";
const sql = databaseUrl ? postgres(databaseUrl, { max: 1, prepare: false, idle_timeout: 10 }) : null;
const adminKey = (() => { try {
  return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
} catch { return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""; } })();
const storage = adminKey ? createClient(Deno.env.get("SUPABASE_URL") || "", adminKey) : null;
const cors = { "Access-Control-Allow-Origin": SITE, "Access-Control-Allow-Methods": "GET, POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Vary": "Origin" };
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...cors, "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" } });
}
function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}
async function digest(s: string) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(bytes)).map(x => x.toString(16).padStart(2, "0")).join("");
}
async function bodyJson(req: Request) {
  const raw = await req.text();
  if (raw.length > 4096) throw new Error("invalid_request");
  return JSON.parse(raw);
}
function safeId(s: unknown) { return typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(s) ? s : null; }
function safeToken(s: unknown) { return typeof s === "string" && /^[a-zA-Z0-9_-]{40,80}$/.test(s) ? s : null; }
function validEmail(s: unknown) { return typeof s === "string" && s.length <= 254 && /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(s); }
function sellerReady() { return Boolean(envToken() && envWebhookSecret() && sql && storage); }
async function fileReady(edition: "pt" | "en") {
  if (!sql) return false;
  const rows = await sql`select exists(select 1 from storage.objects where bucket_id = ${BUCKET} and name = ${FILES[edition]}) as ready`;
  return Boolean(rows[0]?.ready);
}
async function providerPayment(id: string) {
  if (!/^[0-9]{4,32}$/.test(id) || !envToken()) return null;
  const response = await fetch(`${API}/v1/payments/${id}`, {
    headers: { Authorization: `Bearer ${envToken()}`, Accept: "application/json" },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return null;
  return await response.json();
}
function classifyPayment(payment: any) {
  if (payment.status === "approved") return "paid";
  if (payment.status === "refunded") return "refunded";
  if (payment.status === "charged_back") return "chargeback";
  if (payment.status === "cancelled") return "cancelled";
  if (payment.status === "rejected") return "failed";
  return "pending";
}
async function syncPayment(paymentId: string) {
  if (!sql) return null;
  const payment = await providerPayment(paymentId);
  if (!payment) return null;
  const external = String(payment.external_reference || "");
  if (!/^criai_[0-9a-f-]{36}$/i.test(external)) return null;
  const id = external.slice(6);
  const orders = await sql`select id, amount, currency, mp_payment_id from criai_private.ebook_orders where id = ${id}::uuid limit 1`;
  if (!orders.length) return null;
  const order = orders[0];
  const validAmount = Math.round(Number(payment.transaction_amount) * 100) === Math.round(Number(order.amount) * 100);
  if (!validAmount || String(payment.currency_id) !== order.currency) return null;
  if (order.mp_payment_id && order.mp_payment_id !== String(payment.id)) return null;
  const state = classifyPayment(payment);
  const rows = await sql`
    update criai_private.ebook_orders
       set payment_state = ${state}, mp_payment_id = ${String(payment.id)},
           updated_at = now(), last_checked_at = now(),
           paid_at = case when ${state} = 'paid' then coalesce(paid_at, now()) else paid_at end
     where id = ${id}::uuid
       and (mp_payment_id is null or mp_payment_id = ${String(payment.id)})
     returning id, payment_state`;
  return rows[0] || null;
}
async function getOrder(input: any) {
  if (!sql) return null;
  const id = safeId(input?.order_id), token = safeToken(input?.access_token);
  if (!id || !token) return null;
  const hash = await digest(token);
  const rows = await sql`select id,ebook_edition,site_locale,payment_state,mp_payment_id
    from criai_private.ebook_orders where id=${id}::uuid and access_token_sha256=${hash} limit 1`;
  return rows[0] || null;
}
async function verifiedOrder(req: Request) {
  let input;
  try { input = await bodyJson(req); } catch { return { error: "Invalid request.", code: 400 }; }
  let order = await getOrder(input);
  if (!order) return { error: "Purchase link not found.", code: 404 };
  const paymentHint = typeof input?.payment_id === "string" && /^[0-9]{4,32}$/.test(input.payment_id) ? input.payment_id : "";
  if (paymentHint && !order.mp_payment_id) {
    await syncPayment(paymentHint);
    order = await getOrder(input);
  }
  if (order?.mp_payment_id) {
    const synced = await syncPayment(order.mp_payment_id);
    if (!synced) return { error: "Unable to validate payment with the provider.", code: 503 };
    order = await getOrder(input);
  }
  return { order };
}
async function hmacHex(secret: string, data: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig)).map(x => x.toString(16).padStart(2, "0")).join("");
}
function fixedTimeHexEqual(a: string, b: string) {
  if (!/^[a-f0-9]{64}$/i.test(a) || !/^[a-f0-9]{64}$/i.test(b)) return false;
  let d = 0; for (let i=0;i<64;i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}
Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const route = url.pathname.split("/").filter(Boolean).at(-1) || "";
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const origin = req.headers.get("origin");
  if (route !== "webhook" && origin && origin !== SITE) return json({ error: "Forbidden origin" }, 403);
  try {
    if (route === "health" && req.method === "GET") {
      return json({ configured: sellerReady(), portuguese_pdf: await fileReady("pt"), english_pdf: await fileReady("en"),
        currencies: { pt: "BRL", en: "USD" } });
    }
    if (route === "checkout" && req.method === "POST") {
      if (!sellerReady()) return json({ error: "Checkout is not configured yet. Contact support." }, 503);
      const input = await bodyJson(req);
      const locale = input?.locale === "en" ? "en" : input?.locale === "pt" ? "pt" : null;
      const edition = input?.edition === "en" ? "en" : input?.edition === "pt" ? "pt" : null;
      if (!locale || !edition || !validEmail(input?.email)) return json({ error: "Choose a PDF edition and enter a valid email." }, 400);
      if (!await fileReady(edition)) return json({ error: "Selected PDF edition is not ready for secure delivery." }, 503);
      const price = PRICES[locale];
      const id = crypto.randomUUID(), accessToken = randomToken();
      const hash = await digest(accessToken);
      await sql!`insert into criai_private.ebook_orders
          (id,access_token_sha256,site_locale,ebook_edition,buyer_email,amount,currency,payment_state)
          values (${id}::uuid,${hash},${locale},${edition},${input.email.trim().toLowerCase()},${price.amount},${price.currency},'created')`;
      const returnUrl = `${SITE}/compra.html?order=${encodeURIComponent(id)}&lang=${locale}`;
      const preference = {
        items: [{ id: edition === "en" ? "CRIAI-EBOOK-IA-01-EN" : "CRIAI-EBOOK-IA-01-PT",
          title: edition === "en" ? "CRIAI - Build Your Digital Business with AI" : "CRIAI - Crie Seu Negocio Digital com IA",
          quantity: 1, unit_price: price.amount, currency_id: price.currency }],
        payer: { email: input.email.trim().toLowerCase() },
        external_reference: "criai_" + id,
        back_urls: { success: returnUrl, pending: returnUrl, failure: returnUrl },
        auto_return: "approved",
        notification_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/criai-ebook-gateway/webhook`,
      };
      const mp = await fetch(`${API}/checkout/preferences`, {
        method: "POST", headers: { Authorization: `Bearer ${envToken()}`,
          "Content-Type": "application/json", "X-Idempotency-Key": id },
        body: JSON.stringify(preference), signal: AbortSignal.timeout(12000) });
      const response = await mp.json().catch(() => ({}));
      if (!mp.ok || typeof response.init_point !== "string") {
        await sql!`update criai_private.ebook_orders set payment_state='failed', updated_at=now() where id=${id}::uuid`;
        return json({ error: locale === "en"
          ? "Payment method or USD currency is not available for this merchant account. No charge was made."
          : "Não foi possível abrir o checkout. Nenhuma cobrança foi feita." }, 503);
      }
      const checkout = new URL(response.init_point);
      if (!/^https:$/.test(checkout.protocol) || !/(^|\\.)mercadopago\\.com(\\.br)?$/.test(checkout.hostname)) {
        return json({ error: "Unexpected payment provider response." }, 502);
      }
      await sql!`update criai_private.ebook_orders
                  set mp_preference_id=${String(response.id)},payment_state='pending',updated_at=now()
                  where id=${id}::uuid`;
      return json({ checkout_url: checkout.toString(), order_id: id, access_token: accessToken });
    }
    if (route === "status" && req.method === "POST") {
      const check = await verifiedOrder(req);
      if ("error" in check) return json({ error: check.error }, check.code);
      const order = check.order;
      return json({ status: order?.payment_state === "paid" ? "approved" : order?.payment_state,
        edition: order?.ebook_edition, ready: order?.payment_state === "paid" });
    }
    if (route === "download" && req.method === "POST") {
      const check = await verifiedOrder(req);
      if ("error" in check) return json({ error: check.error }, check.code);
      const order = check.order;
      if (!order || order.payment_state !== "paid" || !order.mp_payment_id) return json({ error: "Payment has not been approved." }, 403);
      if (!storage) return json({ error: "Secure file service is unavailable." }, 503);
      const edition = order.ebook_edition as "pt" | "en";
      const { data, error } = await storage.storage.from(BUCKET).createSignedUrl(FILES[edition], 120, { download: FILES[edition] });
      if (error || !data?.signedUrl) return json({ error: "Download is temporarily unavailable. Contact support." }, 503);
      return json({ download_url: data.signedUrl, expires_in: 120, edition });
    }
    if (route === "webhook" && req.method === "POST") {
      if (!envWebhookSecret()) return json({ error: "Webhook is not configured." }, 503);
      const signature = req.headers.get("x-signature") || "";
      const requestId = req.headers.get("x-request-id") || "";
      const dataId = url.searchParams.get("data.id") || "";
      const parts = Object.fromEntries(signature.split(",").map(x => x.trim().split("=")));
      const ts = Number(parts.ts);
      if (!dataId || !requestId || !Number.isFinite(ts) || Math.abs(Date.now() - ts) > 10 * 60 * 1000)
        return json({ error: "Invalid webhook." }, 401);
      const expected = await hmacHex(envWebhookSecret(), `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`);
      if (!fixedTimeHexEqual(expected, parts.v1 || "")) return json({ error: "Invalid webhook signature." }, 401);
      if (!/^[0-9]{4,32}$/.test(dataId)) return json({ ok: true });
      await syncPayment(dataId);
      return json({ ok: true });
    }
    return json({ error: "Not found." }, 404);
  } catch (error) {
    console.error("CRIAI ebook gateway error:", String(error));
    return json({ error: "Service temporarily unavailable." }, 503);
  }
});
