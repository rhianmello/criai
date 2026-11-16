#!/usr/bin/env python3
"""Smoke checks for the static CRIAÍ site. No network access required."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = ["index.html", "leadlovers.html", "sobre.html", "privacidade.html", "apostilas.html"]
DOMAIN = "https://criai.xrmovi.com.br"
errors = []

class AuditParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []
        self.ids = set()
        self.title = ""
        self.in_title = False
        self.canonical = []
        self.meta_desc = []
        self.affiliate_links = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        if tag == "title":
            self.in_title = True
        if tag == "a":
            self.links.append(a.get("href", ""))
            if a.get("data-affiliate"):
                self.affiliate_links.append(a)
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical.append(a.get("href"))
        if tag == "meta" and a.get("name") == "description":
            self.meta_desc.append(a.get("content", ""))
        if tag in ("script", "link") and a.get("src", "").startswith("assets/"):
            self.links.append(a["src"])
        if tag == "link" and a.get("href", "").startswith("assets/"):
            self.links.append(a["href"])

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data

def fail(message):
    errors.append(message)

pages = {}
for name in PAGES:
    path = ROOT / name
    if not path.is_file():
        fail(f"missing page: {name}")
        continue
    html = path.read_text(encoding="utf8")
    p = AuditParser()
    p.feed(html)
    pages[name] = p
    target = DOMAIN + ("/" if name == "index.html" else "/" + name)
    if p.canonical != [target]:
        fail(f"{name}: incorrect canonical {p.canonical!r}")
    if not p.title.strip() or not any(s.strip() for s in p.meta_desc):
        fail(f"{name}: missing title/description")
    if "criar.xrmovi.com.br" in html:
        fail(f"{name}: old domain reference")
    if 'assets/app.js' not in html or 'assets/config.js' not in html or 'assets/style.css' not in html:
        fail(f"{name}: missing static assets")

for name, p in pages.items():
    for href in p.links:
        if not href or href.startswith(("http://", "https://", "mailto:", "tel:", "javascript:")):
            continue
        parsed = urlparse(href)
        if parsed.scheme or parsed.netloc:
            continue
        target_name = parsed.path or name
        target_path = ROOT / target_name
        if not target_path.is_file():
            fail(f"{name}: broken local link {href}")
            continue
        if parsed.fragment and target_name.endswith(".html"):
            target_page = pages.get(target_name)
            if target_page and parsed.fragment not in target_page.ids:
                fail(f"{name}: missing anchor {href}")
    for link in p.affiliate_links:
        href = link.get("href", "")
        if not re.fullmatch(r"https://go\.hotmart\.com/[A-Za-z0-9]+(?:\?.*)?", href):
            fail(f"{name}: invalid direct Hotmart link format")

for filename in ("robots.txt", "sitemap.xml", "assets/config.js", "assets/style.css", "assets/apostilas.css", "assets/guia-negocio-ia.svg", "assets/app.js", "assets/favicon.svg", "CNAME"):
    if not (ROOT / filename).is_file():
        fail(f"missing file: {filename}")
for filename in ("robots.txt", "sitemap.xml", "assets/config.js"):
    text = (ROOT / filename).read_text(encoding="utf8") if (ROOT / filename).exists() else ""
    if "criar.xrmovi.com.br" in text:
        fail(f"{filename}: old domain reference")
if (ROOT / "CNAME").read_text(encoding="utf8").strip() != "criai.xrmovi.com.br":
    fail("CNAME does not match canonical domain")
if "criai.xrmovi.com.br/sitemap.xml" not in (ROOT / "robots.txt").read_text(encoding="utf8"):
    fail("robots.txt sitemap wrong")
if "<loc>https://criai.xrmovi.com.br/" not in (ROOT / "sitemap.xml").read_text(encoding="utf8"):
    fail("sitemap.xml base wrong")

# A primeira dobra precisa apresentar planos reais, com escolha interna que não dependa
# da disponibilidade dos links externos de afiliado no navegador.
home_html = (ROOT / "index.html").read_text(encoding="utf8")
review_html = (ROOT / "leadlovers.html").read_text(encoding="utf8")
for page_name, page_html in (("home", home_html), ("review", review_html)):
    if 'class="owner-entry-link"' not in page_html or 'href="admin/index.html"' not in page_html:
        fail(f"{page_name}: header must display a direct owner dashboard link")

if 'id="planos"' not in home_html or home_html.find('id="planos"') > home_html.find('id="solucoes"'):
    fail("home: plans not shown before long-form editorial content")
if home_html.count('class="plan-select-button"') != 3:
    fail("home: missing one or more plan-selection controls")
for slug in ("starter", "essential", "plus"):
    if f'href="leadlovers.html#plano-{slug}"' not in home_html:
        fail(f"home: missing plan {slug} link")
    if f'id="plano-{slug}"' not in review_html:
        fail(f"review: missing plan {slug} destination")
    if f'PLANO {slug.upper()}' not in home_html:
        fail(f"home: missing plan {slug} label")
if 'plano anual' not in home_html or 'indicação remunerada' not in home_html.lower():
    fail("home: missing price and affiliate transparency")
if home_html.count('class="plan-offer-link"') != 3:
    fail("home: missing separate external purchase links")
# Valores oficiais divulgados por faixa de contatos e modalidade de cobrança.
for amount in ("R$ 65", "R$ 87", "R$ 149", "R$ 197", "R$ 222", "R$ 297", "R$ 780", "R$ 1.788", "R$ 2.664"):
    if amount not in home_html or amount not in review_html:
        fail(f"pricing: missing disclosed verified amount {amount}")
if "2.000 contatos" not in home_html or "5.000 contatos" not in home_html:
    fail("pricing: missing starter contact tiers")
if "equivalente no anual" not in home_html or "equivalente no anual" not in review_html:
    fail("pricing: annual equivalent is not clearly disclosed")
for vid in ("_3Pm1WGiCXw", "xkGU3UeJdQY", "RFRR7fgSteU", "F-P6ZyHhUNM"):
    if vid not in review_html:
        fail(f"videos: supplied video reference missing {vid}")
for banner_id in ("ne9KFgQ", "cfm0IBZ", "MIuzNC3", "pWh1HUh", "LBve6TQ"):
    if banner_id not in review_html:
        fail(f"banners: missing supplied creative {banner_id}")
if "MIuzNC3.png" not in home_html:
    fail("home: promotional image missing")
if review_html.count('data-video-id=') != 8:
    fail("review: expected eight demonstration cards")
if "plan-price-note" in review_html or "*Valores de referência" in home_html:
    fail("pricing: lengthy price disclaimer still visible")
privacy_html = (ROOT / "privacidade.html").read_text(encoding="utf8")
if "permanece desativado" in privacy_html or "G-RG57Q34VB0" not in privacy_html:
    fail("privacy: GA4 consent disclosure is stale or missing")

app = (ROOT / "assets/app.js").read_text(encoding="utf8")
if "analyticsReady" not in app or "consent !== 'analytics'" not in app or "affiliate_click" not in app:
    fail("app.js: consent-gated analytics tracking missing")
config = (ROOT / "assets/config.js").read_text(encoding="utf8")
if "ga4MeasurementId: ''" not in config:
    print("NOTE: GA4 Measurement ID configured; confirm consent in a real browser")

if errors:
    print("CRIAÍ site checks FAILED:")
    for e in errors: print(" -", e)
    sys.exit(1)
print(f"CRIAÍ static checks PASS: {len(PAGES)} pages, internal links, canonical, assets, affiliate format and consent markers.")

# Próprio produto editorial deve ser distinto das indicações e não expor PDF integral.
ebook = (ROOT / "apostilas.html").read_text(encoding="utf8")
if "R$ 49,90" not in ebook or 'id="amostra"' not in ebook:
    fail("apostilas: price or free sample section missing")
if "checkout automático ainda não está disponível" not in ebook:
    fail("apostilas: manual purchase limitation not disclosed")
if any(tag in ebook for tag in ('href="downloads/', 'href="ebooks/', 'href="apostila-completa.pdf"')):
    fail("apostilas: paid PDF is exposed by a public link")
if "https://criai.xrmovi.com.br/apostilas.html" not in (ROOT / "sitemap.xml").read_text(encoding="utf8"):
    fail("sitemap: editorial product not indexed")
