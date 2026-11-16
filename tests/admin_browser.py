#!/usr/bin/env python3
"""Aceitação de navegador do painel fiscal, executada LOCALMENTE. Nenhuma transação real."""
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from threading import Thread
from playwright.sync_api import sync_playwright
import sys

ROOT = Path(__file__).resolve().parents[1]
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
URL = 'http://127.0.0.1:' + str(server.server_port) + '/admin/'
checks,errors = [],[]
def check(name, ok, detail=''):
    checks.append(name)
    print(('PASS ' if ok else 'FAIL ')+name+' '+str(detail),flush=True)
    if not ok: errors.append(name+': '+str(detail))

try:
    with sync_playwright() as p:
        browser=p.chromium.launch(headless=True,args=['--no-sandbox'])
        context=browser.new_context(locale='pt-BR',viewport={'width':1440,'height':850},accept_downloads=True)
        page=context.new_page()
        errors_js=[]
        page.on('pageerror',lambda exc:errors_js.append(str(exc)))
        response=page.goto(URL,wait_until='domcontentloaded')
        check('Admin HTTP', response is not None and response.status==200)
        check('Primeiro acesso',page.locator('#accessTitle').inner_text()=='Ative seu cofre fiscal')
        check('Main hidden before login',page.locator('#appShell').is_hidden())
        assert page.locator('#confirmWrap').is_visible()
        email='teste-criai-admin@example.invalid'
        password='TesteCofreSeguro!2026'
        page.locator('#accessEmail').fill(email)
        page.locator('#accessPassword').fill(password)
        page.locator('#confirmPassword').fill(password)
        page.locator('#accessSubmit').click()
        page.wait_for_selector('#appShell:not([hidden])',timeout=20000)
        check('First-time vault created',page.locator('#view-overview').is_visible())
        vault=page.evaluate("localStorage.getItem('criai_fiscal_vault_v1')")
        check('Vault encrypted at rest',vault is not None and '"ciphertext"' in vault and email not in vault)
        check('No default financial data',page.locator('#kpiGrid').inner_text().count('R$ 0')>=2)

        page.locator('[data-open-dialog="transactionDialog"]').first.click()
        page.locator('#txnDate').fill('2026-11-16')
        page.locator('#txnOrder').fill('QA-HOTMART-001')
        page.locator('#txnProduct').fill('Leadlovers')
        page.locator('#txnCommission').fill('149.00')
        page.locator('#txnStatus').select_option('approved')
        page.locator('#transactionForm button[type=submit]').click()
        page.wait_for_timeout(800)
        check('Transaction persisted',page.locator('#recentTransactions').inner_text().find('QA-HOTMART-001')>=0)
        vault=page.evaluate("localStorage.getItem('criai_fiscal_vault_v1')")
        check('Transaction remains encrypted', 'QA-HOTMART-001' not in vault)

        page.locator('[data-route="invoices"]').first.click()
        page.locator('[data-open-dialog="invoiceDialog"]').click()
        page.locator('#nfNumber').fill('QA-NF-001')
        page.locator('#nfDate').fill('2026-11-16')
        page.locator('#nfAmount').fill('149.00')
        page.locator('#nfVerify').fill('DEMO-CODIGO-NAO-REAL')
        page.locator('#invoiceForm button[type=submit]').click()
        page.wait_for_timeout(800)
        check('Fiscal record persisted',page.locator('#invoicesBody').inner_text().find('QA-NF-001')>=0)

        page.locator('[data-route="transactions"]').first.click()
        page.locator('#transactionsBody [data-edit="transaction"]').first.click()
        page.locator('#txnInvoice').select_option(index=1)
        page.locator('#transactionForm button[type=submit]').click()
        page.wait_for_timeout(750)
        check('Transaction invoice mapped', 'QA-NF-001' in page.locator('#transactionsBody').inner_text())

        page.locator('[data-route="reports"]').first.click()
        check('Monthly report transaction', 'QA-HOTMART-001' in page.locator('#reportBody').inner_text())
        check('Monthly report invoice', 'QA-NF-001' in page.locator('#reportBody').inner_text())
        with page.expect_download(timeout=10000) as dl:
            page.locator('#btnReportCsv').click()
        data=dl.value.path().read_bytes()
        check('CSV report exported',b'QA-HOTMART-001' in data and b'QA-NF-001' in data)
        page.once('dialog',lambda d:d.accept())
        page.locator('#btnMarkSent').click()
        page.wait_for_timeout(700)
        check('Manual sent recorded', 'registrado em' in page.locator('#reportSubmission').inner_text().lower())

        page.locator('[data-route="expenses"]').first.click()
        page.locator('[data-open-dialog="expenseDialog"]').click()
        page.locator('#expDate').fill('2026-11-16')
        page.locator('#expCategory').select_option('Google Ads')
        page.locator('#expDescription').fill('<img src=x onerror=alert(1)>')
        page.locator('#expAmount').fill('20.00')
        page.locator('#expenseForm button[type=submit]').click()
        page.wait_for_timeout(700)
        check('XSS text escaped',page.locator('#expensesBody img').count()==0 and '<img src=x onerror=alert(1)>' in page.locator('#expensesBody').inner_text())

        page.locator('[data-route="settings"]').first.click()
        with page.expect_download(timeout=10000) as dl:
            page.locator('#btnExportBackup').click()
        backup=dl.value.path().read_text(encoding='utf8')
        check('Backup is ciphertext only', '"ciphertext"' in backup and 'QA-HOTMART-001' not in backup and email not in backup)
        page.locator('#btnLockSettings').click()
        check('Lock closes dashboard',page.locator('#appShell').is_hidden())
        page.locator('#accessEmail').fill(email)
        page.locator('#accessPassword').fill('SenhaIncorreta2026!')
        page.locator('#accessSubmit').click()
        page.wait_for_timeout(900)
        check('Wrong password rejected',page.locator('#appShell').is_hidden() and page.locator('#accessError').is_visible())
        page.locator('#accessPassword').fill(password)
        page.locator('#accessSubmit').click()
        page.wait_for_selector('#appShell:not([hidden])',timeout=20000)
        check('Re-login decrypts records','QA-HOTMART-001' in page.locator('#recentTransactions').inner_text())

        page.set_viewport_size({'width':390,'height':844})
        page.wait_for_timeout(250)
        check('Mobile nav initially hidden',not page.locator('#sidebar').evaluate('(el)=>el.classList.contains("open")'))
        page.locator('#menuToggle').click()
        check('Mobile nav opens',page.locator('#sidebar').evaluate('(el)=>el.classList.contains("open")'))
        page.locator('#sidebar [data-route="reports"]').click()
        check('Mobile nav closes after selection',not page.locator('#sidebar').evaluate('(el)=>el.classList.contains("open")'))
        overflow=page.evaluate('document.documentElement.scrollWidth-window.innerWidth')
        check('No horizontal overflow',overflow <= 3,overflow)
        check('No browser JS errors',not errors_js,errors_js[:4])
        browser.close()
finally:
    server.shutdown()
print('CHECKS',len(checks),'FAILURES',len(errors))
if errors:
    print('\n'.join(errors))
    sys.exit(1)
