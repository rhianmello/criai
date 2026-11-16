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
    // Keep analytics cookies on CRIAÍ host only, not the sibling XRMOVI site.
    window.gtag('config', rawId, {
      anonymize_ip: true,
      cookie_domain: 'none',
      cookie_prefix: 'criai'
    });

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
    link.addEventListener('click', () => {
      // Placement explains WHICH CTA was used. No client ID is transmitted by us.
      const placement = link.closest('.mobile-offer-bar') ? 'mobile_sticky'
        : link.closest('.hero-actions') ? 'hero'
        : link.closest('.offer-cta-group') ? 'offer_card'
        : link.closest('.nav-actions') ? 'header'
        : link.closest('.video-cta') ? 'video_section'
        : link.closest('.conversion-actions') ? 'final_cta'
        : link.closest('.aside-card') ? 'review_sidebar'
        : 'content';
      track('affiliate_click', {
        product_id: 'hotmart_42903',
        product_name: 'leadlovers',
        cta_placement: placement,
        destination: 'hotmart_hotlink',
        outbound: true,
        transport_type: 'beacon'
      });
    });
  });
  document.querySelectorAll('a[href^="leadlovers.html"]').forEach(link => {
    link.addEventListener('click', () => track('select_content', {
      content_type: 'product_review', item_id: 'hotmart_42903'
    }));
  });

  // Imagens de divulgação externas: manter alternativa acessível se o host não responder.
  document.querySelectorAll('img[data-affiliate-banner]').forEach(img => {
    const markUnavailable = () => {
      const holder = img.closest('.affiliate-banner-item, .affiliate-home-banner-link');
      if (holder) holder.classList.add('banner-unavailable');
    };
    img.addEventListener('error', markUnavailable);
    if (img.complete && img.naturalWidth === 0) markUnavailable();
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
    else if (prior === 'analytics' && analyticsReady) {
      // Stop future collection immediately and unload the tag by reloading.
      window.gtag('consent', 'update', {
        analytics_storage: 'denied', ad_storage: 'denied',
        ad_user_data: 'denied', ad_personalization: 'denied'
      });
      window.location.reload();
    }
  }));

  document.querySelectorAll('[data-open-privacy]').forEach(button => button.addEventListener('click', () => {
    panel.classList.add('show');
    const firstAction = panel.querySelector('[data-consent]');
    if (firstAction) firstAction.focus();
  }));
  // Official producer demos: privacy-friendly facade; no YouTube load before click.
  document.querySelectorAll('button[data-video-id]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-video-id') || '';
      if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
      const frame = document.createElement('iframe');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
      frame.title = 'Demonstração da Leadlovers';
      frame.loading = 'eager';
      frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
      frame.allowFullscreen = true;
      frame.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.className = 'demo-iframe';
      const surface = button.closest('.demo-screen');
      if (!surface) return;
      surface.replaceChildren(frame);
      surface.classList.add('demo-active');
      track('video_start', { content_type: 'producer_demo', video_id: id, product_id: 'hotmart_42903' });
    });
  });

  // Independent on-page budgeting tool: no storage, cookies or transmission.
  const costForm = document.getElementById('simuladorCusto');
  if (costForm) {
    const price = costForm.querySelector('#mensalidade');
    const months = costForm.querySelector('#meses');
    const extras = costForm.querySelector('#custosExtras');
    const output = costForm.querySelector('#custoTotal');
    const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

    const recalculate = () => {
      if (!price.value.trim()) {
        output.textContent = 'Informe o preço mensal para calcular.';
        return;
      }
      const monthly = Number(price.value);
      const period = Number(months.value);
      const additional = extras.value.trim() ? Number(extras.value) : 0;
      if (!Number.isFinite(monthly) || !Number.isFinite(additional) ||
          monthly < 0 || additional < 0 || ![3, 6, 12].includes(period)) {
        output.textContent = 'Confira os valores informados.';
        return;
      }
      output.textContent = 'Gasto estimado em ' + period + ' meses: ' +
        currency.format(monthly * period + additional);
    };

    [price, months, extras].forEach(field => {
      field.addEventListener('input', recalculate);
      field.addEventListener('change', recalculate);
    });
    costForm.addEventListener('submit', event => event.preventDefault());
    recalculate();
  }

})();
