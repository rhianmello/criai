/* CRIAÍ — checkout redirect; never expose provider tokens or paid PDF URLs. */
(() => {
  "use strict";
  const button = document.querySelector("[data-ebook-purchase]");
  const email = document.querySelector("[data-ebook-buyer-email]");
  const status = document.querySelector("[data-ebook-checkout-message]");
  const locale = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "pt";
  if (!button || !email) return;
  const base = "https://ztqtcbzjesrkuaijmylm.supabase.co/functions/v1/criai-ebook-gateway";
  const labels = {
    pt: { loading: "Abrindo pagamento seguro…", unavailable: "O pagamento online ainda está sendo configurado. Nenhuma cobrança será feita até a ativação.", ready: "Pagamento seguro disponível. O PDF será liberado somente após a confirmação do pagamento.", failed: "Não foi possível iniciar a compra. Nenhuma cobrança foi realizada.", invalid: "Digite um e-mail válido antes de comprar.", store: "Seu navegador bloqueou o armazenamento necessário para recuperar o pedido. Habilite o armazenamento da sessão." },
    en: { loading: "Opening secure payment…", unavailable: "Online checkout is still being configured. No charge can be made before activation.", ready: "Secure checkout is available. The PDF is delivered only after verified payment.", failed: "Checkout could not be started. No charge was made.", invalid: "Enter a valid email before purchasing.", store: "Your browser blocked session storage required for purchase recovery. Enable session storage." }
  }[locale];
  let busy = false;
  let configured = false;
  const setMessage = (message) => { if (status) status.textContent = message; };
  const edition = () => document.querySelector('input[name="ebook-language"]:checked')?.value || locale;
  async function readiness() {
    try {
      const response = await fetch(base + "/health", { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error("not_ready");
      const r = await response.json();
      configured = Boolean(r.configured);
      const readyPdf = edition() === "en" ? r.english_pdf : r.portuguese_pdf;
      setMessage(configured && readyPdf ? labels.ready : labels.unavailable);
    } catch (_) { configured = false; setMessage(labels.unavailable); }
  }
  document.querySelectorAll('input[name="ebook-language"]').forEach(r => r.addEventListener("change", readiness));
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!email.checkValidity()) { setMessage(labels.invalid); email.reportValidity(); email.focus(); return; }
    const chosenEdition = edition();
    busy = true;
    button.setAttribute("aria-busy", "true");
    setMessage(labels.loading);
    try {
      const response = await fetch(base + "/checkout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, edition: chosenEdition, email: email.value.trim() })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || labels.failed);
      if (!data.order_id || !data.access_token || !/^https:\/\//.test(data.checkout_url || "")) throw new Error(labels.failed);
      try {
        sessionStorage.setItem("criai_paid_ebook_" + data.order_id, data.access_token);
      } catch (_) { throw new Error(labels.store); }
      window.location.assign(data.checkout_url);
    } catch (error) {
      const message = String(error?.message || labels.failed);
      setMessage(message);
      busy = false;
      button.removeAttribute("aria-busy");
    }
  });
  readiness();
})();
