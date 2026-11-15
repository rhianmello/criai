#!/usr/bin/env python3
"""Checks the real public CRIAÍ pages without login, cookies, forms or purchases."""
import json, sys, ssl, time
from pathlib import Path
from urllib.request import Request, urlopen, build_opener, HTTPRedirectHandler
from urllib.error import HTTPError
from playwright.sync_api import sync_playwright

BASE="https://criai.xrmovi.com.br"
HOTLINK="https://go.hotmart.com/O108508884T"
PAGES=["/","/leadlovers.html","/sobre.html","/privacidade.html"]
FILES=["/assets/style.css","/assets/app.js","/assets/config.js","/robots.txt","/sitemap.xml"]
OUT=Path("test-results");OUT.mkdir(exist_ok=True)
checks=[];errors=[];affiliate={}
def test(name,ok,detail=""):
    checks.append({"check":name,"passed":bool(ok),"detail":str(detail)[:300]})
    if not ok: errors.append(f"{name}: {detail}")
    print(("PASS " if ok else "FAIL ")+name+" "+str(detail)[:180],flush=True)

for path in PAGES+FILES:
    try:
        r=urlopen(Request(BASE+path,headers={"User-Agent":"CRIAI-QA/1.0"}),timeout=25,context=ssl.create_default_context())
        with r:
            sample=r.read(100000)
            test("HTTP "+path,r.status==200 and r.url.startswith(BASE),str(r.status)+" "+r.url)
            if path=="/sitemap.xml":test("Sitemap canonical",b"criai.xrmovi.com.br" in sample)
    except Exception as exc:test("HTTP "+path,False,repr(exc))

# Network reachability alone does NOT establish the Hotmart owner, cookies or a valid commission.
class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl):return None
try:
    opener=build_opener(NoRedirect)
    try:
        with opener.open(Request(HOTLINK,headers={"User-Agent":"CRIAI-QA/1.0"}),timeout=20) as r:
            affiliate={"http_status":r.status,"location":str(r.headers.get("Location",""))[:180]}
    except HTTPError as ex:
        affiliate={"http_status":ex.code,"location":str(ex.headers.get("Location",""))[:180]}
except Exception as ex:affiliate={"error":repr(ex)}
print("HOTLINK (network only, not attribution):",affiliate,flush=True)

with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,args=["--no-sandbox"])
    for width,height in [(1440,900),(768,1024),(390,844),(320,700)]:
        context=browser.new_context(viewport={"width":width,"height":height},locale="pt-BR")
        page=context.new_page();js_errors=[]
        page.on("pageerror",lambda exc:js_errors.append(str(exc)))
        for route in PAGES:
            try:
                resp=page.goto(BASE+route,wait_until="domcontentloaded",timeout=35000)
                page.wait_for_timeout(600)
                state=page.evaluate("""() => ({
                    width:window.innerWidth,
                    overflow:document.documentElement.scrollWidth-window.innerWidth,
                    heading:!!document.querySelector("h1"),
                    analyticTag:!!document.querySelector('script[src*="googletagmanager.com"]')
                })""")
                test(f"Browser {width} {route}",resp is not None and resp.status==200 and state["heading"] and state["overflow"]<=3 and not state["analyticTag"],str(state))
                if route=="/leadlovers.html":
                    links=page.locator('a[data-affiliate="leadlovers"]')
                    test(f"Hotlinks {width}",links.count()>=2 and all(links.nth(i).get_attribute("href")==HOTLINK and "sponsored" in (links.nth(i).get_attribute("rel") or "") for i in range(links.count())))
                if width==390 and route=="/":
                    toggle=page.locator(".menu-toggle");nav=page.locator("#menuPrincipal")
                    toggle.click();opened=nav.evaluate("el=>el.classList.contains('open')")
                    nav.locator("a").first.click();closed=not nav.evaluate("el=>el.classList.contains('open')")
                    test("Mobile menu",opened and closed)
                if width in [390,1440] and route=="/":page.screenshot(path=str(OUT/f"home-{width}.png"),full_page=True)
            except Exception as exc:test(f"Browser {width} {route}",False,repr(exc))
        test(f"JavaScript errors {width}",len(js_errors)==0,str(js_errors[:3]))
        context.close()
    browser.close()

(OUT/"remote-report.json").write_text(json.dumps({"timestamp_utc":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"checks":checks,"hotlink_network_only":affiliate,"errors":errors},ensure_ascii=False,indent=2),encoding="utf8")
print("CHECKS",len(checks),"FAILURES",len(errors),flush=True)
sys.exit(bool(errors))
