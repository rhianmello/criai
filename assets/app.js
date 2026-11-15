/* CRIAÍ — recursos mínimos, sem bibliotecas de terceiros. */
(() => {
  'use strict';
  const config = window.CRIAI_CONFIG || {};
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menuPrincipal');
  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const isOpen = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
    }));
  }

  // O Hotlink é sempre utilizado integralmente. Sem encurtar ou redirecionar.
  const affiliateLink = config.affiliateLinks && config.affiliateLinks.leadlovers;
  document.querySelectorAll('a[data-affiliate="leadlovers"]').forEach(anchor => {
    if (typeof affiliateLink === 'string' && /^https:\/\/go\.hotmart\.com\/[A-Za-z0-9]+(?:\?.*)?$/.test(affiliateLink)) {
      anchor.href = affiliateLink;
    }
    anchor.addEventListener('click', () => {
      if (window.CRIAI_ANALYTICS_ACTIVE && typeof window.gtag === 'function') {
        window.gtag('event', 'affiliate_click', {product: 'leadlovers', outbound: true});
      }
    });
  });

  const consentKey = 'criai_privacy_choice_v1';
  const dialog = document.getElementById('privacyConsent');
  const ga4Id = typeof config.ga4MeasurementId === 'string' ? config.ga4MeasurementId.trim() : '';
  const validGa4 = /^G-[A-Z0-9]{6,}$/.test(ga4Id);
  let choice = null;
  try { choice = localStorage.getItem(consentKey); } catch (_) { /* armazenamento indisponível */ }

  function startAnalytics() {
    if (!validGa4 || window.CRIAI_ANALYTICS_ACTIVE) return;
    window.CRIAI_ANALYTICS_ACTIVE = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga4Id, {anonymize_ip: true});
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`;
    document.head.appendChild(s);
  }

  if (choice === 'analytics') startAnalytics();
  if (validGa4 && choice === null && dialog) dialog.classList.add('show');
  document.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    choice = button.dataset.consent === 'analytics' ? 'analytics' : 'necessary';
    try { localStorage.setItem(consentKey, choice); } catch (_) { /* sem persistência */ }
    if (choice === 'analytics') startAnalytics();
    if (dialog) dialog.classList.remove('show');
    if (choice === 'necessary' && window.CRIAI_ANALYTICS_ACTIVE) window.location.reload();
  }));
  document.querySelectorAll('[data-open-privacy]').forEach(button => button.addEventListener('click', () => {
    if (!dialog) {
      window.location.href = 'privacidade.html';
      return;
    }
    dialog.classList.add('show');
  }));
})();
