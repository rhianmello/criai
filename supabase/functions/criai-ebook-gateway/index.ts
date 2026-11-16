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
function validEmail(s: unknown) { return typeof s === "string" && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
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
  return { order, input };
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

/* Passwordless recovery for existing paid CRIAI purchasers.
   Email alone is never proof of ownership. Codes are hashed, one-use,
   short-lived and rate-limited. Only an approved, rechecked payment can download. */
// Prefer dedicated CRIAÍ credentials, but safely reuse the already configured
// Resend sender in this Supabase project when dedicated secrets are absent.
const recoveryMailKey = () => Deno.env.get("CRIAI_RESEND_API_KEY") || Deno.env.get("XRMOVI_RESEND_API_KEY") || "";
const recoveryFrom = () => {
  const dedicated = (Deno.env.get("CRIAI_RECOVERY_FROM") || "").trim();
  if (dedicated) return dedicated;
  const shared = (Deno.env.get("XRMOVI_SUPPORT_MAIL_FROM") || "").trim();
  const match = shared.match(/<([^<>\\s]+@[^<>\\s]+)>\\s*$/) || shared.match(/^([^<>\\s]+@[^<>\\s]+)$/);
  return match ? `CRIAÍ <${match[1]}>` : "";
};
function recoveryReady() {
  return Boolean(sql && storage && adminKey && recoveryMailKey().startsWith("re_") && recoveryFrom().includes("@"));
}
async function recoveryDb(query: string, args: unknown[] = []) {
  if (!sql) throw new Error("Recovery storage unavailable");
  return await sql.unsafe(query, args);
}
async function recoveryFingerprint(kind: string, value: string) {
  return digest("criai-recovery-" + kind + ":" + value + ":" + adminKey);
}
function recoveryCode() {
  const r = new Uint32Array(1);
  crypto.getRandomValues(r);
  return String(r[0] % 1000000).padStart(6, "0");
}
async function sendRecoveryCode(id: string, email: string, code: string, locale: "pt" | "en") {
  const en = locale === "en";
  const body = {
    from: recoveryFrom(), to: [email],
    subject: en ? "CRIAI: your guide download verification code" : "CRIAÍ: código para recuperar sua apostila",
    text: en
      ? "Your CRIAI verification code: " + code + "\nValid for 10 minutes. Enter it at https://criai.xrmovi.com.br/recuperar-apostila.html?lang=en\nIf you did not request it, ignore this message."
      : "Seu código de verificação CRIAÍ: " + code + "\nVálido por 10 minutos. Digite-o em https://criai.xrmovi.com.br/recuperar-apostila.html\nSe você não pediu este código, ignore esta mensagem."
  };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + recoveryMailKey(),
        "Content-Type": "application/json",
        "Idempotency-Key": "criai-ebook-recovery-" + id
      },
      body: JSON.stringify(body), signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) {
      console.warn("CRIAI recovery mail provider HTTP " + response.status);
      return;
    }
    await recoveryDb(
      "update criai_private.ebook_recovery_challenges set sent_at=now() where id=$1::uuid",
      [id]
    );
  } catch (err) {
    console.warn("CRIAI recovery email could not be sent");
  }
}
async function requestRecovery(req: Request) {
  if (!recoveryReady()) return json({ error: "Email recovery is not available yet. Contact support." }, 503);
  let input: any;
  try { input = await bodyJson(req); } catch { return json({ error: "Invalid request." }, 400); }
  if (!validEmail(input?.email)) return json({ error: "Enter a valid email address." }, 400);
  const email = String(input.email).trim().toLowerCase();
  const locale: "pt" | "en" = input?.locale === "en" ? "en" : "pt";
  const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
  const emailKey = await recoveryFingerprint("email", email);
  const ipKey = await recoveryFingerprint("ip", ip);
  // Retain only recent recovery attempts/sessions, not a permanent email-verification history.
  await recoveryDb("delete from criai_private.ebook_recovery_challenges where created_at < now() - interval '2 days'");
  await recoveryDb("delete from criai_private.ebook_recovery_sessions where expires_at < now() - interval '2 days'");
  const rate = (await recoveryDb(
    "select (select count(*)::int from criai_private.ebook_recovery_challenges where email_key=$1 and created_at>now()-interval '1 hour') as by_email, " +
    "(select count(*)::int from criai_private.ebook_recovery_challenges where requester_key=$2 and created_at>now()-interval '1 hour') as by_ip, " +
    "(select count(*)::int from criai_private.ebook_recovery_challenges where email_key=$1 and created_at>now()-interval '60 seconds') as cooldown",
    [emailKey, ipKey]
  ))[0];
  const id = crypto.randomUUID();
  const publicAnswer = { ok: true, challenge_id: id, expires_in: 600,
    message: locale === "en"
      ? "If a paid order matches this email, a verification code will arrive shortly."
      : "Se existir uma compra aprovada neste e-mail, você receberá um código de verificação." };
  if (Number(rate?.by_email) >= 3 || Number(rate?.by_ip) >= 15 || Number(rate?.cooldown) >= 1)
    return json(publicAnswer); // Do not reveal whether an email belongs to a purchaser.
  const eligible = Boolean((await recoveryDb(
    "select exists(select 1 from criai_private.ebook_orders " +
    "where buyer_email=$1 and payment_state='paid' and mp_payment_id is not null) as eligible",
    [email]
  ))[0]?.eligible);
  const code = recoveryCode();
  const hash = await recoveryFingerprint("otp", id + ":" + code);
  await recoveryDb(
    "insert into criai_private.ebook_recovery_challenges " +
    "(id,email_key,buyer_email,requester_key,code_digest,eligible) " +
    "values ($1::uuid,$2,$3,$4,$5,$6)",
    [id, emailKey, eligible ? email : null, ipKey, hash, eligible]
  );
  if (eligible) {
    // Send outside the response path to reduce purchaser-email enumeration by timing.
    EdgeRuntime.waitUntil(sendRecoveryCode(id, email, code, locale));
  }
  return json(publicAnswer);
}
async function verifyRecovery(req: Request) {
  if (!recoveryReady()) return json({ error: "Email recovery unavailable." }, 503);
  let input: any;
  try { input = await bodyJson(req); } catch { return json({ error: "Invalid request." }, 400); }
  const id = safeId(input?.challenge_id);
  const code = input?.code;
  if (!id || typeof code !== "string" || !/^[0-9]{6}$/.test(code))
    return json({ error: "Invalid or expired code." }, 401);
  // Atomic attempt count: at most 5 guesses; no reuse of a consumed challenge.
  const rows = await recoveryDb(
    "update criai_private.ebook_recovery_challenges set attempts=attempts+1 " +
    "where id=$1::uuid and attempts<5 and eligible=true and sent_at is not null " +
    "and verified_at is null and expires_at>now() returning buyer_email,code_digest",
    [id]
  );
  const expected = await recoveryFingerprint("otp", id + ":" + code);
  if (!rows.length || !fixedTimeHexEqual(String(rows[0].code_digest), expected))
    return json({ error: "Invalid or expired code." }, 401);
  const consumed = await recoveryDb(
    "update criai_private.ebook_recovery_challenges set verified_at=now() " +
    "where id=$1::uuid and verified_at is null and expires_at>now() returning buyer_email",
    [id]
  );
  if (!consumed.length) return json({ error: "Invalid or expired code." }, 401);
  const accessToken = randomToken();
  const tokenHash = await recoveryFingerprint("session", accessToken);
  await recoveryDb(
    "insert into criai_private.ebook_recovery_sessions (buyer_email,token_digest) values ($1,$2)",
    [consumed[0].buyer_email, tokenHash]
  );
  return json({ access_token: accessToken, expires_in: 3600 });
}
async function recoveryDownload(req: Request) {
  if (!sql || !storage || !adminKey) return json({ error: "Secure download unavailable." }, 503);
  let input: any;
  try { input = await bodyJson(req); } catch { return json({ error: "Invalid request." }, 400); }
  const token = safeToken(input?.access_token);
  const edition: "pt" | "en" | null = input?.edition === "pt" ? "pt" : input?.edition === "en" ? "en" : null;
  if (!token || !edition) return json({ error: "Invalid recovery access." }, 401);
  const tokenHash = await recoveryFingerprint("session", token);
  const sessions = await recoveryDb(
    "select buyer_email from criai_private.ebook_recovery_sessions where token_digest=$1 " +
    "and expires_at>now() and revoked_at is null limit 1",
    [tokenHash]
  );
  if (!sessions.length) return json({ error: "Your access has expired. Request another email code." }, 401);
  const orders = await recoveryDb(
    "select mp_payment_id from criai_private.ebook_orders where buyer_email=$1 and " +
    "payment_state='paid' and mp_payment_id is not null order by paid_at desc nulls last limit 10",
    [sessions[0].buyer_email]
  );
  if (!orders.length) return json({ error: "No approved purchase was found." }, 403);
  let validPaid = false, providerUnavailable = false;
  for (const order of orders) {
    // Never trust a stored status alone. This rechecks refunds and chargebacks.
    const state = await syncPayment(String(order.mp_payment_id));
    if (state?.payment_state === "paid") { validPaid = true; break; }
    if (!state) providerUnavailable = true;
  }
  if (!validPaid) return json({
    error: providerUnavailable ? "Payment verification is temporarily unavailable." : "Purchase is not approved."
  }, providerUnavailable ? 503 : 403);
  if (!await fileReady(edition)) return json({ error: "This PDF edition is not available yet." }, 503);
  const { data, error } = await storage.storage.from(BUCKET)
    .createSignedUrl(FILES[edition], 120, { download: FILES[edition] });
  if (error || !data?.signedUrl) return json({ error: "Secure download temporarily unavailable." }, 503);
  return json({ download_url: data.signedUrl, edition, expires_in: 120 });
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const last = pathParts.at(-1) || "";
  const route = pathParts.at(-2) === "recovery" ? "recovery/" + last : last;
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  const origin = req.headers.get("origin");
  if (route !== "webhook" && origin && origin !== SITE) return json({ error: "Forbidden origin" }, 403);
  try {
    if (route === "health" && req.method === "GET") {
      return json({ configured: sellerReady(), recovery_ready: recoveryReady(), portuguese_pdf: await fileReady("pt"), english_pdf: await fileReady("en"),
        currencies: { pt: "BRL", en: "USD" } });
    }
    if (route === "recovery/request" && req.method === "POST") return await requestRecovery(req);
    if (route === "recovery/verify" && req.method === "POST") return await verifyRecovery(req);
    if (route === "recovery/download" && req.method === "POST") return await recoveryDownload(req);
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
      if (!/^https:$/.test(checkout.protocol) || !/(^|\.)mercadopago\.com(\.br)?$/.test(checkout.hostname)) {
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
      // A paid order authorizes either language edition of this same guide.
      // The order token and provider-approved payment are checked above on every request.
      const requested = check.input?.edition;
      if (requested !== undefined && requested !== "pt" && requested !== "en") return json({ error: "Invalid PDF edition." }, 400);
      const edition: "pt" | "en" = requested === "pt" || requested === "en" ? requested : order.ebook_edition;
      if (!await fileReady(edition)) return json({ error: "Requested PDF edition is not available yet." }, 503);
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
      const timestampMs = ts < 1e11 ? ts * 1000 : ts;
      if (!dataId || !requestId || !Number.isFinite(ts) || Math.abs(Date.now() - timestampMs) > 10 * 60 * 1000)
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
