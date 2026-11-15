/* CRIAÍ — interface e estatísticas opcionais (sem dados pessoais). */
(() => {
  'use strict';

  const settings = window.CRIAI_CONFIG || {};
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menuPrincipal');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const expanded = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(expanded));
      menuButton.setAttribute('aria-label', expanded ? 'Fechar menu' : 'Abrir menu');
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Abrir menu');
    }));
  }

  const rawId = typeof settings.ga4MeasurementId === 'string' ? settings.ga4MeasurementId.trim() : '';
  const validGa4 = /^G-[A-Z0-9]{6,}$/.test(rawId);
  const storageKey = 'criai_analytics_consent_v2';
  let consent = null;
  try { consent = localStorage.getItem(storageKey); } catch (_) {}
  let analyticsReady = false;

  function startAnalytics() {
    if (!validGa4 || consent !== 'analytics' || analyticsReady) return;
    analyticsReady = true;
    window.CRIAI_ANALYTICS_ACTIVE = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };

    // Modo de consentimento básico: não carregar tag antes da escolha.
    window.gtag('consent', 'default', {
      analytics_storage: 'denied', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('consent', 'update', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('config', rawId, { anonymize_ip: true });

    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(rawId);
    document.head.appendChild(tag);

    if (window.location.pathname.endsWith('/leadlovers.html')) {
      window.gtag('event', 'view_item', {
        currency: 'BRL', items: [{ item_id: 'hotmart_42903', item_name: 'Leadlovers', item_category: 'Ferramenta digital' }]
      });
    }
  }

  function track(name, fields) {
    if (analyticsReady && typeof window.gtag === 'function') {
      window.gtag('event', name, fields || {});
    }
  }

  // Links permanecem diretos: a atribuição é responsabilidade da Hotmart.
  const hotlink = settings.affiliateLinks && settings.affiliateLinks.leadlovers;
  document.querySelectorAll('a[data-affiliate="leadlovers"]').forEach(link => {
    if (typeof hotlink === 'string' && /^https:\/\/go\.hotmart\.com\/[A-Za-z0-9]+(?:\?.*)?$/.test(hotlink)) {
      link.href = hotlink;
    }
    link.addEventListener('click', () => track('affiliate_click', {
      product_id: 'hotmart_42903',
      product_name: 'leadlovers',
      destination: 'hotmart_hotlink',
      outbound: true,
      transport_type: 'beacon'
    }));
  });
  document.querySelectorAll('a[href="leadlovers.html"]').forEach(link => {
    link.addEventListener('click', () => track('select_content', {
      content_type: 'product_review', item_id: 'hotmart_42903'
    }));
  });

  let panel = document.getElementById('privacyConsent');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'consent';
    panel.id = 'privacyConsent';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Preferências de estatísticas');
    panel.setAttribute('aria-modal', 'false');
    panel.innerHTML = '<div><strong>Suas escolhas de privacidade</strong><p>Estatísticas opcionais só funcionam com sua autorização. O site permanece utilizável sem elas.</p></div><div class="consent-actions"><button class="btn btn-outline" type="button" data-consent="necessary">Somente essenciais</button><button class="btn btn-primary" type="button" data-consent="analytics">Aceitar estatísticas</button></div>';
    document.body.appendChild(panel);
  }

  if (validGa4 && consent === 'analytics') startAnalytics();
  if (validGa4 && consent !== 'analytics' && consent !== 'necessary') panel.classList.add('show');

  panel.querySelectorAll('[data-consent]').forEach(button => button.addEventListener('click', () => {
    const prior = consent;
    consent = button.dataset.consent === 'analytics' ? 'analytics' : 'necessary';
    try { localStorage.setItem(storageKey, consent); } catch (_) {}
    panel.classList.remove('show');
    if (consent === 'analytics') startAnalytics();
    else if (prior === 'analytics' && analyticsReady) window.location.reload();
  }));

  document.querySelectorAll('[data-open-privacy]').forEach(button => button.addEventListener('click', () => {
    panel.classList.add('show');
    const firstAction = panel.querySelector('[data-consent]');
    if (firstAction) firstAction.focus();
  }));
})();
