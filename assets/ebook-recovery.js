/* CRIAÍ — secure self-service ebook recovery. Never trust an email alone. */
(() => {
  "use strict";
  const query = new URLSearchParams(location.search);
  const en = query.get("lang") === "en";
  const locale = en ? "en" : "pt";
  const api = "https://ztqtcbzjesrkuaijmylm.supabase.co/functions/v1/criai-ebook-gateway";
  const sessionKey = "criai_ebook_recovery_session";
  const labels = {
    pt: {
      kicker: "ACESSO À MINHA COMPRA", title: "Baixe sua apostila novamente",
      intro: "Informe o mesmo e-mail utilizado na compra. Enviaremos um código de verificação para liberar o download, sem cobrar novamente.",
      emailLabel: "E-mail utilizado na compra", send: "Enviar código de acesso",
      codeLabel: "Código de 6 dígitos recebido no e-mail", codeHint: "O código vale por 10 minutos. Confira também a caixa de spam.",
      verify: "Confirmar código", changeEmail: "Usar outro e-mail", newCode: "Pedir um novo código",
      approved: "E-mail confirmado. Escolha a versão que deseja baixar. Você pode solicitar outro código sempre que precisar.",
      downloadPt: "Baixar em português", downloadEn: "Baixar em inglês",
      security: "Por segurança, o download só é liberado para compras aprovadas. Cada link gerado vale 2 minutos, mas você poderá gerar novos links após verificar seu e-mail.",
      help: "Precisa de ajuda?", footer: "CRIAÍ — seus dados são utilizados apenas para verificar a compra e proteger seu acesso.",
      placeholder: "seuemail@exemplo.com", ready: "Informe o e-mail da compra para recuperar sua apostila.",
      unavailable: "O envio automático de códigos ainda não está disponível. Solicite ajuda pelo e-mail de suporte.",
      sent: "Se existir uma compra aprovada nesse e-mail, o código chegará em instantes. Confira também o spam.",
      verifying: "Conferindo o código…", waiting: "Solicitando código…", invalid: "Código inválido, expirado ou limite de tentativas atingido. Tente novamente.",
      authorized: "E-mail verificado. Agora você pode baixar a apostila.", preparing: "Gerando novo link de download…",
      error: "Não foi possível concluir a solicitação. Tente novamente ou entre em contato.",
      expired: "O acesso expirou. Peça um novo código para continuar.", notApproved: "Não há compra aprovada disponível ou o pagamento não pôde ser confirmado."
    },
    en: {
      kicker: "MY PURCHASE ACCESS", title: "Download your guide again",
      intro: "Enter the email address used at checkout. We will send a verification code so you can download your guide again, at no extra cost.",
      emailLabel: "Email used at checkout", send: "Send verification code",
      codeLabel: "Six-digit code sent to your email", codeHint: "The code is valid for 10 minutes. Check your spam folder too.",
      verify: "Verify code", changeEmail: "Use another email", newCode: "Request a new code",
      approved: "Email verified. Choose either full edition below. You can request another code whenever you need to download again.",
      downloadPt: "Download in Portuguese", downloadEn: "Download in English",
      security: "For your protection, downloads require an approved payment. Each generated link lasts 2 minutes, but you can request new links after verifying your email.",
      help: "Need help?", footer: "CRIAÍ — your information is used only to verify your purchase and secure your access.",
      placeholder: "you@example.com", ready: "Enter your purchase email address to recover the guide.",
      unavailable: "Automatic verification emails are not available yet. Contact support to recover your guide.",
      sent: "If an approved purchase matches this email, a code will arrive shortly. Check spam too.",
      verifying: "Checking your code…", waiting: "Requesting your code…", invalid: "Invalid or expired code, or too many attempts. Please try again.",
      authorized: "Email verified. You can download your PDF now.", preparing: "Creating a fresh download link…",
      error: "Your request could not be completed. Please retry or contact support.",
      expired: "Your access expired. Request a new code to continue.",
      notApproved: "No approved purchase is available, or your payment could not be verified."
    }
  }[locale];
  document.documentElement.lang = en ? "en" : "pt-BR";
  document.title = labels.title + " | CRIAÍ";
  document.querySelector("[data-lang-pt]").toggleAttribute("aria-current", !en);
  document.querySelector("[data-lang-en]").toggleAttribute("aria-current", en);
  document.querySelector(".logo").href = en ? "/en/apostilas.html" : "/apostilas.html";
  document.querySelectorAll("[data-text]").forEach(el => {
    const key = el.getAttribute("data-text");
    if (Object.prototype.hasOwnProperty.call(labels, key)) el.textContent = labels[key];
  });

  const emailForm = document.querySelector("[data-recovery-request]");
  const verifyForm = document.querySelector("[data-recovery-verify]");
  const downloadPane = document.querySelector("[data-recovery-download]");
  const emailInput = document.querySelector("#purchase-email");
  const codeInput = document.querySelector("#recovery-code");
  const status = document.querySelector("[data-recovery-status]");
  const sendButton = emailForm.querySelector('button[type="submit"]');
  const verifyButton = verifyForm.querySelector('button[type="submit"]');
  emailInput.placeholder = labels.placeholder;
  let challengeId = "";
  let accessToken = "";
  let requesting = false;

  function message(value) { status.textContent = value; }
  function view(which) {
    emailForm.hidden = which !== "email";
    verifyForm.hidden = which !== "verify";
    downloadPane.hidden = which !== "download";
  }
  async function post(route, payload) {
    const response = await fetch(api + "/" + route, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.error || labels.error);
      error.status = response.status;
      throw error;
    }
    return data;
  }
  function reset() {
    challengeId = "";
    accessToken = "";
    try { sessionStorage.removeItem(sessionKey); } catch (_) {}
    view("email");
    message(labels.ready);
    emailInput.focus();
  }
  document.querySelectorAll("[data-back]").forEach(btn => btn.addEventListener("click", reset));

  emailForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (requesting) return;
    if (!emailInput.checkValidity()) {
      emailInput.reportValidity();
      return;
    }
    requesting = true;
    sendButton.disabled = true;
    message(labels.waiting);
    try {
      const result = await post("recovery/request", { email: emailInput.value.trim(), locale });
      if (!/^[a-f0-9-]{36}$/i.test(result.challenge_id || "")) throw new Error(labels.error);
      challengeId = result.challenge_id;
      codeInput.value = "";
      view("verify");
      message(labels.sent);
      codeInput.focus();
    } catch (error) {
      message(error.status === 503 ? labels.unavailable : labels.error);
    } finally {
      requesting = false;
      sendButton.disabled = false;
    }
  });
  verifyForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (!codeInput.checkValidity() || !challengeId) {
      codeInput.reportValidity();
      return;
    }
    verifyButton.disabled = true;
    message(labels.verifying);
    try {
      const result = await post("recovery/verify", { challenge_id: challengeId, code: codeInput.value.trim() });
      if (!/^[a-zA-Z0-9_-]{40,80}$/.test(result.access_token || "")) throw new Error(labels.error);
      accessToken = result.access_token;
      try { sessionStorage.setItem(sessionKey, accessToken); } catch (_) {}
      view("download");
      message(labels.authorized);
    } catch (error) {
      message(error.status === 401 ? labels.invalid : labels.error);
    } finally {
      verifyButton.disabled = false;
    }
  });
  document.querySelectorAll("[data-recover-edition]").forEach(btn => btn.addEventListener("click", async () => {
    if (!accessToken) return reset();
    btn.disabled = true;
    message(labels.preparing);
    const edition = btn.dataset.recoverEdition;
    try {
      const result = await post("recovery/download", { access_token: accessToken, edition });
      if (result.edition !== edition || !result.download_url) throw new Error(labels.error);
      const url = new URL(result.download_url);
      if (url.protocol !== "https:" || !url.hostname.endsWith(".supabase.co")) throw new Error(labels.error);
      message(labels.authorized);
      window.location.assign(url.href);
    } catch (error) {
      if (error.status === 401) {
        reset();
        message(labels.expired);
      } else {
        message(error.status === 403 || error.status === 503 ? labels.notApproved : labels.error);
      }
    } finally {
      btn.disabled = false;
    }
  }));
  // Never block the send button behind a separate health request.
  // Only recovery/request determines whether sending is available.
  try { accessToken = sessionStorage.getItem(sessionKey) || ""; } catch (_) {}
  if (accessToken && /^[a-zA-Z0-9_-]{40,80}$/.test(accessToken)) {
    view("download");
    message(labels.authorized);
  } else {
    view("email");
    message(labels.ready);
  }
})();