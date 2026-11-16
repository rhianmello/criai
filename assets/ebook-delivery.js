/* CRIAÍ — buyer-only access to short-lived signed PDF links after provider verification. */
(() => {
  "use strict";
  const p = new URLSearchParams(location.search);
  const orderId = p.get("order") || "";
  const lang = p.get("lang") === "en" ? "en" : "pt";
  const en = lang === "en";
  document.documentElement.lang = en ? "en" : "pt-BR";
  const heading = document.querySelector("[data-heading]");
  const detail = document.querySelector("[data-detail]");
  const btn = document.querySelector("[data-download]");
  const retry = document.querySelector("[data-check]");
  const back = document.querySelector("[data-back]");
  const support = document.querySelector("[data-support]");
  const l = en ? {
    title: "Your purchase", missing: "We could not recover your purchase in this browser. Contact support using the email entered at checkout.",
    pending: "Waiting for confirmed payment. If you paid by Pix, approval may take a few moments.",
    approved: "Payment confirmed! Your PDF is ready for a secure download.",
    bad: "The payment has not been approved. Nothing is unlocked.",
    network: "Payment verification is temporarily unavailable. Try again or contact support.",
    loading: "Verifying payment with the provider…", download: "Download my PDF", downloading: "Preparing secure link…",
    check: "Check payment again", back: "Return to the guide", help: "Email support"
  } : {
    title: "Sua compra", missing: "Não foi possível recuperar a compra neste navegador. Contate o suporte pelo e-mail informado no pagamento.",
    pending: "Aguardando confirmação do pagamento. Em pagamentos por Pix, pode levar alguns instantes.",
    approved: "Pagamento confirmado! Sua apostila já pode ser baixada com segurança.",
    bad: "O pagamento não está aprovado. O arquivo continua protegido.",
    network: "Não foi possível confirmar o pagamento agora. Tente novamente ou contate o suporte.",
    loading: "Conferindo pagamento diretamente com o provedor…", download: "Baixar minha apostila",
    downloading: "Preparando link seguro…", check: "Verificar novamente", back: "Voltar à apostila", help: "Suporte por e-mail"
  };
  const base = "https://ztqtcbzjesrkuaijmylm.supabase.co/functions/v1/criai-ebook-gateway";
  heading.textContent = l.title; retry.textContent = l.check; back.textContent = l.back;
  back.href = en ? "/en/apostilas.html" : "/apostilas.html";
  support.textContent = l.help;
  btn.textContent = l.download;
  let token = "";
  let verified = false;
  let attempts = 0;
  try { token = sessionStorage.getItem("criai_paid_ebook_" + orderId) || ""; } catch (_) {}
  if (!/^[0-9a-f-]{36}$/i.test(orderId) || !token) {
    detail.textContent = l.missing;
    retry.hidden = true;
    return;
  }
  async function request(route, extra = {}) {
    const response = await fetch(base + "/" + route, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: orderId, access_token: token, ...extra })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || l.network);
    return data;
  }
  async function check() {
    retry.disabled = true; detail.textContent = l.loading;
    try {
      const hint = p.get("payment_id") || p.get("collection_id") || "";
      const data = await request("status", hint ? { payment_id: hint } : {});
      verified = data.status === "approved" && data.ready === true;
      btn.hidden = !verified;
      detail.textContent = verified ? l.approved : (["failed","cancelled","refunded","chargeback"].includes(data.status) ? l.bad : l.pending);
      if (!verified && ++attempts <= 12) setTimeout(check, 8000);
    } catch (error) { detail.textContent = String(error?.message || l.network); }
    finally { retry.disabled = false; }
  }
  btn.addEventListener("click", async (event) => {
    event.preventDefault();
    if (!verified) return;
    btn.setAttribute("aria-busy", "true"); btn.textContent = l.downloading;
    try {
      const data = await request("download");
      const url = new URL(data.download_url);
      if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) throw new Error(l.network);
      window.location.assign(data.download_url);
    } catch (error) { detail.textContent = String(error?.message || l.network); }
    finally { btn.removeAttribute("aria-busy"); btn.textContent = l.download; }
  });
  retry.addEventListener("click", check);
  check();
})();
