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
                if route in ("/", "/leadlovers.html"):
                    links=page.locator('a[data-affiliate="leadlovers"]')
                    test(f"Direct Hotlink buttons {width} {route}",links.count()>=4 and all(links.nth(i).get_attribute("href")==HOTLINK and "sponsored" in (links.nth(i).get_attribute("rel") or "") for i in range(links.count())))
                    hero=page.locator('.hero-actions a[data-affiliate="leadlovers"]')
                    test(f"Above-fold CTA {width} {route}",hero.count()==1 and hero.first.is_visible())
                    final_cta=page.locator('.conversion-actions a[data-affiliate="leadlovers"]')
                    state_cta=final_cta.evaluate("""el => {
                        const s = getComputedStyle(el),r=el.getBoundingClientRect();
                        const p = getComputedStyle(el.parentElement);
                        return {width:r.width,height:r.height,display:s.display,visibility:s.visibility,
                          opacity:s.opacity,color:s.color,background:s.backgroundColor,parentDisplay:p.display}
                    }""") if final_cta.count()==1 else {}
                    print("FINAL CTA INSPECTION",width,route,state_cta,flush=True)
                    test(f"Final CTA visible {width} {route}",
                         final_cta.count()==1 and final_cta.is_visible() and
                         state_cta.get("width",0)>=140 and state_cta.get("height",0)>=35,
                         str(state_cta))
                    backup=page.locator('.conversion-actions a.btn-outline')
                    test(f"Secondary CTA accessible {width} {route}",
                         backup.count()==1 and backup.is_visible() and
                         backup.get_attribute('href') in ('leadlovers.html#avaliacao','#videos'))

                    mobile_bar=page.locator(".mobile-offer-bar")
                    test(f"Responsive CTA bar {width} {route}",mobile_bar.is_visible()==(width<=750))
                if route=="/leadlovers.html":
                    demos=page.locator('button[data-video-id]')
                    test(f"Producer videos {width}",demos.count()==5)
                    test(f"No video embeds without click {width}",page.locator('.demo-iframe').count()==0)
                    if width in (390,1440):
                        context.route("**/www.youtube-nocookie.com/**",lambda route:route.abort())
                        demos.first.click()
                        test(f"Video embed only after click {width}",page.locator('iframe.demo-iframe[src^="https://www.youtube-nocookie.com/embed/"]').count()==1)
                    links=page.locator('a[data-affiliate="leadlovers"]')
                    test(f"Hotlinks {width}",links.count()>=2 and all(links.nth(i).get_attribute("href")==HOTLINK and "sponsored" in (links.nth(i).get_attribute("rel") or "") for i in range(links.count())))
                    monthly=page.locator("#mensalidade")
                    test(f"Calculator visible {width}",monthly.count()==1)
                    if monthly.count()==1:
                        monthly.fill("100")
                        page.locator("#meses").select_option("12")
                        page.locator("#custosExtras").fill("50")
                        test(f"Calculator math {width}","1.250,00" in page.locator("#custoTotal").inner_text(),page.locator("#custoTotal").inner_text())
                if width==390 and route=="/":
                    toggle=page.locator(".menu-toggle");nav=page.locator("#menuPrincipal")
                    toggle.click();opened=nav.evaluate("el=>el.classList.contains('open')")
                    nav.locator("a").first.click();closed=not nav.evaluate("el=>el.classList.contains('open')")
                    test("Mobile menu",opened and closed)
                if width in [390,1440] and route in ["/","/leadlovers.html"]:
                    filename="home" if route=="/" else "offer"
                    page.screenshot(path=str(OUT/f"{filename}-{width}.png"),full_page=True)
            except Exception as exc:test(f"Browser {width} {route}",False,repr(exc))
        test(f"JavaScript errors {width}",len(js_errors)==0,str(js_errors[:3]))
        context.close()
    # Clicking the real CTA must open the correct Hotlink. Intercept navigation;
    # no purchase or third-party visit is performed by this test.
    context=browser.new_context(viewport={"width":390,"height":844},locale="pt-BR")
    context.route("**/go.hotmart.com/**",lambda route:route.fulfill(status=200,content_type="text/html",body="<title>Teste local de destino</title>"))
    page=context.new_page()
    for route in ["/","/leadlovers.html"]:
        try:
            page.goto(BASE+route,wait_until="domcontentloaded",timeout=35000)
            with page.expect_popup(timeout=12000) as opened:
                page.locator('.hero-actions a[data-affiliate="leadlovers"]').click()
            popup=opened.value
            popup.wait_for_load_state("domcontentloaded",timeout=12000)
            test(f"Direct CTA navigation {route}",popup.url==HOTLINK,popup.url)
            popup.close()
        except Exception as exc:test(f"Direct CTA navigation {route}",False,repr(exc))
    context.close()

    # Test consent with a fictitious GA4 ID intercepted only in this test browser.
    # Abort analytics network: no production GA4 data is ever sent.
    context=browser.new_context(viewport={"width":390,"height":844},locale="pt-BR")
    mock='window.CRIAI_CONFIG={ga4MeasurementId:"G-TEST123456",affiliateLinks:{leadlovers:"'+HOTLINK+'"}};'
    context.route("**/assets/config.js",lambda route:route.fulfill(status=200,content_type="application/javascript",body=mock))
    context.route("**/www.googletagmanager.com/**",lambda route:route.abort())
    page=context.new_page()
    try:
        page.goto(BASE+"/",wait_until="domcontentloaded",timeout=35000)
        test("Consent prompt",page.locator("#privacyConsent.show").count()==1)
        test("No GA4 before consent",page.locator('script[src*="googletagmanager.com"]').count()==0)
        page.locator('[data-consent="necessary"]').click()
        test("No GA4 after reject",page.locator('script[src*="googletagmanager.com"]').count()==0)
        page.locator('[data-open-privacy]').first.click()
        test("Preferences reopen",page.locator("#privacyConsent.show").count()==1)
        page.locator('[data-consent="analytics"]').click()
        test("GA4 loaded after accept",page.locator('script[src*="googletagmanager.com"]').count()==1)
        # Intercept the Hotmart popup: verify event after consent without real visit/purchase.
        context.route("**/go.hotmart.com/**",lambda route:route.fulfill(status=200,content_type="text/html",body="<title>QA stub</title>"))
        with page.expect_popup(timeout=12000) as popped:
            page.locator('.hero-actions a[data-affiliate="leadlovers"]').first.click()
        popped.value.close()
        detail=page.evaluate("""() => (window.dataLayer || [])
            .filter(args=>args && args[0]==='event' && args[1]==='affiliate_click')
            .map(args=>args[2])""")
        test("Consent-only CTA placement event",any(x.get("cta_placement")=="hero" and x.get("product_id")=="hotmart_42903" for x in detail),str(detail))
        settings=page.evaluate("""() => (window.dataLayer || []).filter(args=>args && args[0]==='config').map(args=>args[2])""")
        test("GA4 cookies restricted to CRIAI",any(x.get('cookie_domain')=='none' and x.get('cookie_prefix')=='criai' for x in settings),str(settings))
        page.locator('[data-open-privacy]').first.click()
        with page.expect_navigation(wait_until="domcontentloaded",timeout=20000):
            page.locator('[data-consent="necessary"]').click()
        test("Consent withdrawal persisted",page.evaluate("localStorage.getItem('criai_analytics_consent_v2')")=="necessary")
        test("No GA4 loaded after withdrawal",page.locator('script[src*="googletagmanager.com"]').count()==0)

    except Exception as exc:test("Consent simulation",False,repr(exc))
    context.close()
    browser.close()

(OUT/"remote-report.json").write_text(json.dumps({"timestamp_utc":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),"checks":checks,"hotlink_network_only":affiliate,"errors":errors},ensure_ascii=False,indent=2),encoding="utf8")
print("CHECKS",len(checks),"FAILURES",len(errors),flush=True)
sys.exit(bool(errors))
