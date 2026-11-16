/* CRIAÍ — preference-based language selector; no IP lookup or user tracking. */
(() => {
  'use strict';
  const STORAGE = 'criai_language_v1';
  const supported = new Set([
    'index.html', 'apostilas.html', 'leadlovers.html', 'sobre.html',
    'privacidade.html', 'automacao-whatsapp-empresas.html',
    'email-marketing-pequenas-empresas.html'
  ]);
  const path = location.pathname || '/';
  const isEnglish = /^\/en(?:\/|$)/.test(path);
  const filename = (isEnglish ? path.replace(/^\/en\/?/, '') : path.replace(/^\//, '')) || 'index.html';
  const known = supported.has(filename);
  const englishPath = filename === 'index.html' ? '/en/' : '/en/' + filename;
  const portuguesePath = filename === 'index.html' ? '/' : '/' + filename;

  function storedLanguage() {
    try {
      const lang = localStorage.getItem(STORAGE);
      if (lang === 'en' || lang === 'pt') return lang;
    } catch (_) { /* Storage is optional. */ }
    return null;
  }
  function preferredLanguage() {
    const langs = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'pt-BR']);
    const first = String(langs[0] || 'pt-BR').toLowerCase();
    return /^en(?:-|$)/.test(first) ? 'en' : 'pt';
  }
  // On a direct English URL, never redirect to another language. The URL is authoritative.
  // For public Portuguese pages only, use the browser's language as a first-visit default.
  if (!isEnglish && known && (storedLanguage() || preferredLanguage()) === 'en') {
    location.replace(englishPath + location.search + location.hash);
    return;
  }

  document.querySelectorAll('a[data-criai-language]').forEach(link => {
    const lang = link.getAttribute('data-criai-language');
    if (lang !== 'pt' && lang !== 'en') return;
    if (known) {
      const pathname = lang === 'en' ? englishPath : portuguesePath;
      link.setAttribute('href', pathname + location.search + location.hash);
    }
    link.addEventListener('click', () => {
      try { localStorage.setItem(STORAGE, lang); } catch (_) {}
    });
  });
})();
