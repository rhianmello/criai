/* CRIAÍ — language edition selection for the paid digital guide.
   This code never unlocks the paid PDF; purchase verification and download links
   must be handled on a secure server after checkout confirmation. */
(() => {
  'use strict';
  const picker = document.querySelector('[data-ebook-language-picker]');
  if (!picker) return;
  const radios = [...picker.querySelectorAll('input[name="ebook-language"]')];
  const defaultLanguage = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'pt';
  const storageKey = 'criai_ebook_edition_choice';
  const editions = {
    pt: { code: 'pt-BR', title: 'Português', enTitle: 'Portuguese', sku: 'CRIAI-EBOOK-IA-01-PT' },
    en: { code: 'en', title: 'Inglês', enTitle: 'English', sku: 'CRIAI-EBOOK-IA-01-EN' }
  };

  try {
    const saved = sessionStorage.getItem(storageKey);
    if (saved === 'pt' || saved === 'en') {
      const matching = radios.find(radio => radio.value === saved);
      if (matching) matching.checked = true;
    }
  } catch (_) { /* The selection still works when storage is disabled. */ }

  const englishUI = defaultLanguage === 'en';
  function refresh() {
    const checked = radios.find(r => r.checked);
    const selected = editions[checked ? checked.value : defaultLanguage] || editions.pt;
    const isInternational = selected.code !== 'pt-BR';
    try { sessionStorage.setItem(storageKey, selected.code === 'en' ? 'en' : 'pt'); } catch (_) {}

    document.querySelectorAll('[data-selected-ebook-language]').forEach(el => {
      el.textContent = englishUI ? selected.enTitle : selected.title;
    });

    document.querySelectorAll('a[data-ebook-purchase]').forEach(link => {
      const abroad = link.hasAttribute('data-ebook-international');
      const subject = englishUI
        ? 'CRIAI guide purchase - ' + selected.enTitle + ' edition'
        : 'Compra da apostila CRIAI - edicao ' + selected.title;
      const body = englishUI
        ? 'Hello, I would like to buy the CRIAI digital business guide (BRL 49.90).\nSelected PDF edition: ' + selected.enTitle + '.\nSKU: ' + selected.sku +
          '\nMy country is: [COUNTRY]\nPlease confirm payment and delivery arrangements before charging.'
        : 'Olá, quero comprar a apostila CRIAÍ de negócios digitais com IA (R$ 49,90).\nIdioma escolhido: ' + selected.title +
          '.\nSKU: ' + selected.sku + '\n' + (abroad ? 'Meu país é: [PAÍS]\n' : '') +
          'Confirme como pagar e receber a edição escolhida antes da cobrança.';
      link.href = 'mailto:suporte@xrmovi.com.br?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
      link.setAttribute('data-selected-edition', selected.code);
      link.setAttribute('data-product-sku', selected.sku);
    });
  }
  radios.forEach(radio => radio.addEventListener('change', refresh));
  refresh();
})();
