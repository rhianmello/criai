#!/usr/bin/env python3
"""Checagens estáticas do painel CRIAÍ, sem dados reais e sem internet."""
from pathlib import Path
from html.parser import HTMLParser
import sys

ROOT = Path(__file__).resolve().parents[1]
files = {
    "html": ROOT / "admin" / "index.html",
    "css": ROOT / "admin" / "painel.css",
    "js": ROOT / "admin" / "painel.js",
}
for f in files.values():
    assert f.is_file() and f.stat().st_size > 1000, "arquivo ausente/vazio: " + str(f)
html, css, js = [p.read_text(encoding="utf-8") for p in files.values()]
assert '<meta name="robots" content="noindex,nofollow,noarchive">' in html
assert 'Content-Security-Policy' in html and "default-src 'none'" in html
assert 'name="viewport"' in html
assert 'id="sidebar"' in html and 'id="accessScreen"' in html
assert 'id="accessPassword"' in html and 'type="password"' in html
assert 'name="description"' in html
for section in ("overview","transactions","invoices","reports","expenses","compliance","settings"):
    assert f'id="view-{section}"' in html
    assert f'data-route="{section}"' in html
assert "https://www.nfse.gov.br/EmissorNacional/Login" in html
assert "https://www.leadlovers.com/politicas-sobre-parcerias" in html
assert "contabilidade@leadlovers.com.br" in html
assert 'href="../index.html"' in html
for term in ("AES-GCM","PBKDF2","600000","window.isSecureContext","crypto.getRandomValues",
             "localStorage.setItem","crypto.subtle.decrypt","escapeHTML","update(","downloadCsv",
             "parseCsv","reportRows","expectedDeadline","inactivity","lock()"):
    assert term.lower() in js.lower(), "módulo essencial ausente: " + term
assert "service_role" not in js.lower()
assert "supabase.co" not in js.lower()
assert "fetch(" not in js
assert "mailto:" in js
assert "data:text/html" not in js.lower()
assert ".view" in css and ".sidebar" in css
assert "@media(max-width:820px)" in css
assert "@media print" in css
assert "admin/" not in (ROOT / "sitemap.xml").read_text(encoding="utf-8")

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.errors = []
    def handle_starttag(self,tag, attrs):
        props=dict(attrs)
        v=props.get("id")
        if v:
            if v in self.ids:self.errors.append("id duplicado: "+v)
            self.ids.add(v)
p=Parser()
p.feed(html)
assert not p.errors, p.errors

print("CRIAÍ admin static checks PASS: HTML, CSP, Crypto, navegação, fiscal, CSS, nenhum segredo ou backend falso.")
