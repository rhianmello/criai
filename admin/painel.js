'use strict';
/* CRIAÍ Gestão — cofre local criptografado. Sem credenciais no código nem integrações remotas. */
(function () {
  const STORAGE_KEY = 'criai_fiscal_vault_v1';
  const FORMAT = 'criai-fiscal-encrypted-v1';
  const ITERATIONS = 600000;
  const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
  const INACTIVITY_MS = 15 * 60 * 1000;
  const RECIPIENT = 'contabilidade@leadlovers.com.br';
  const STATUS = Object.freeze({
    pending: 'Pendente', approved: 'Aprovada', available: 'Disponível',
    received: 'Recebida', refunded: 'Estornada/cancelada',
    issued: 'Emitida', sent: 'Enviada'
  });
  const ROUTE_TITLE = {
    overview: 'Visão geral', transactions: 'Transações', invoices: 'Notas fiscais',
    reports: 'Relatórios', expenses: 'Despesas', compliance: 'Prazos e regras',
    settings: 'Configurações'
  };
  const $ = (id) => document.getElementById(id);
  const escapeHTML = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, function (char) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
  });
  const money = (n) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(n) || 0);
  const toNum = (n) => Number.isFinite(Number(n)) ? Number(n) : 0;
  const fmtDate = (iso) => /^\d{4}-\d{2}-\d{2}$/.test(String(iso)) ? String(iso).split('-').reverse().join('/') : '—';
  const label = (status) => STATUS[status] || 'A verificar';
  const pill = (status) => '<span class="pill ' + escapeHTML(status) + '">' + escapeHTML(label(status)) + '</span>';
  const safeHttps = (s) => { try { const u = new URL(s); return u.protocol === 'https:' ? u.href : ''; } catch (_) { return ''; } };
  const parseMoney = (value) => {
    let t = String(value == null ? '' : value).replace(/[R$\s\u00a0]/g, '').replace(/[^\d.,-]/g, '');
    if (t.includes(',') && t.includes('.')) t = t.lastIndexOf(',') > t.lastIndexOf('.') ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
    else if (t.includes(',')) t = t.replace(',', '.');
    const v = Number(t);
    return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : NaN;
  };
  const newId = () => crypto.randomUUID();
  const today = () => {
    const now = new Date();
    return String(now.getFullYear()) + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  };
  const currentMonth = () => today().slice(0, 7);
  const bytesToB64 = (bytes) => {
    let binary = '';
    for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode.apply(null, bytes.subarray(i, i + 8192));
    return btoa(binary);
  };
  const b64ToBytes = (b64) => Uint8Array.from(atob(b64), ch => ch.charCodeAt(0));
  const encode = (obj) => new TextEncoder().encode(JSON.stringify(obj));
  const decode = (buf) => JSON.parse(new TextDecoder().decode(buf));

  let db = null, cryptoKey = null, saltBytes = null, lastActive = Date.now(), currentRoute = 'overview';
  let failedLogins = 0, lockUntil = 0, saving = false;
  function toast(message) {
    const el = $('toast'); el.textContent = message; el.hidden = false;
    clearTimeout(toast.timer); toast.timer = setTimeout(() => { el.hidden = true; }, 3600);
  }
  function errorMessage(message) { const el = $('accessError'); el.textContent = message; el.hidden = false; }
  function clearError() { $('accessError').hidden = true; $('accessError').textContent = ''; }
  function record() {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; }
    catch (_) { return null; }
  }
  function isValidRecord(item) {
    return !!item && item.format === FORMAT && item.kdf === 'PBKDF2-SHA256' &&
      Number.isInteger(item.iterations) && item.iterations === ITERATIONS &&
      typeof item.salt === 'string' && item.salt.length <= 100 &&
      typeof item.iv === 'string' && item.iv.length <= 100 &&
      typeof item.ciphertext === 'string' && item.ciphertext.length > 10 &&
      item.ciphertext.length <= 10 * 1024 * 1024;
  }
  async function deriveKey(password, salt, iterations) {
    const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), {name:'PBKDF2'}, false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial,
      { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  }
  async function persist() {
    if (!db || !cryptoKey || !saltBytes || saving) throw Error('Cofre indisponível');
    saving = true;
    try {
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const ciphertext = await crypto.subtle.encrypt({ name:'AES-GCM', iv }, cryptoKey, encode(db));
      const container = {
        format:FORMAT, kdf:'PBKDF2-SHA256', iterations:ITERATIONS,
        salt:bytesToB64(saltBytes), iv:bytesToB64(iv),
        ciphertext:bytesToB64(new Uint8Array(ciphertext))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(container));
      lastActive = Date.now();
    } finally { saving = false; }
  }
  async function update(mutator, message) {
    const snapshot = structuredClone(db);
    try {
      mutator(db);
      await persist();
      renderAll();
      if (message) toast(message);
    } catch (e) {
      db = snapshot;
      toast('Não foi possível salvar. Faça backup ou libere espaço no navegador.');
      console.error('CRIAÍ: falha de gravação', e && e.name);
    }
  }
  function firstSetupUI() {
    const fresh = !record();
    $('accessTitle').textContent = fresh ? 'Ative seu cofre fiscal' : 'Acesse seu painel';
    $('accessDescription').textContent = fresh
      ? 'Primeiro acesso neste navegador: escolha seu e-mail e uma senha nova com pelo menos 12 caracteres.'
      : 'Informe o e-mail e a senha que você definiu neste navegador. Seus dados não são enviados a servidores.';
    $('confirmWrap').hidden = !fresh;
    $('confirmPassword').required = fresh;
    $('accessPassword').setAttribute('autocomplete', fresh ? 'new-password' : 'current-password');
    $('accessSubmit').textContent = fresh ? 'Criar cofre local' : 'Abrir painel';
  }
  function checkRecordData(value) {
    if (!value || typeof value !== 'object' || typeof value.ownerEmail !== 'string' ||
        !Array.isArray(value.transactions) || !Array.isArray(value.invoices) ||
        !Array.isArray(value.expenses) || !value.settings ||
        typeof value.submissions !== 'object') throw Error('Formato inválido');
    if (value.transactions.length > 20000 || value.invoices.length > 20000 || value.expenses.length > 20000) throw Error('Limite de registros');
  }
  function showApp() {
    $('accessScreen').hidden = true; $('appShell').hidden = false;
    $('userChip').textContent = db.ownerEmail;
    $('monthPicker').value = currentMonth();
    route('overview'); renderAll(); lastActive = Date.now();
  }
  function lock() {
    cryptoKey = null; db = null; saltBytes = null;
    $('appShell').hidden = true; $('accessScreen').hidden = false;
    $('accessPassword').value = ''; $('confirmPassword').value = '';
    closeSidebar(); firstSetupUI();
    clearError(); toast('Cofre bloqueado');
  }
  $('accessForm').addEventListener('submit', async (event) => {
    event.preventDefault(); clearError();
    if (!window.crypto || !crypto.subtle || !window.isSecureContext) { errorMessage('A criptografia requer uma conexão segura HTTPS.'); return; }
    if (Date.now() < lockUntil) { errorMessage('Muitas tentativas. Tente novamente em alguns segundos.'); return; }
    const email = $('accessEmail').value.trim().toLowerCase();
    const password = $('accessPassword').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errorMessage('Informe um e-mail válido.'); return; }
    const existing = record();
    if (!existing && (password.length < 12 || password !== $('confirmPassword').value)) {
      errorMessage('Use uma senha nova com pelo menos 12 caracteres e confirme-a corretamente.'); return;
    }
    $('accessSubmit').disabled = true; $('accessSubmit').textContent = 'Abrindo cofre...';
    try {
      if (existing) {
        if (!isValidRecord(existing)) throw Error('Backup inválido ou corrompido');
        const salt = b64ToBytes(existing.salt);
        const key = await deriveKey(password, salt, existing.iterations);
        const decrypted = await crypto.subtle.decrypt(
          {name:'AES-GCM',iv:b64ToBytes(existing.iv)}, key, b64ToBytes(existing.ciphertext)
        );
        const result = decode(decrypted);
        checkRecordData(result);
        if (result.ownerEmail.toLowerCase() !== email) throw Error('Acesso não autorizado');
        db = result; cryptoKey = key; saltBytes = salt;
      } else {
        db = {
          version:1, ownerEmail:email, createdAt:new Date().toISOString(),
          transactions:[], invoices:[], expenses:[], submissions:{},
          settings:{issuerName:'',issuerTax:'',municipality:'',recipientName:'',recipientTax:''}
        };
        saltBytes = crypto.getRandomValues(new Uint8Array(16));
        cryptoKey = await deriveKey(password, saltBytes, ITERATIONS);
        await persist();
      }
      failedLogins = 0; $('accessPassword').value = ''; $('confirmPassword').value = ''; showApp();
    } catch (e) {
      db = null; cryptoKey = null; saltBytes = null;
      failedLogins += 1;
      if (failedLogins >= 5) { failedLogins = 0; lockUntil = Date.now() + 30000; }
      errorMessage('Não foi possível abrir o cofre. Verifique e-mail, senha ou arquivo restaurado.');
      console.warn('CRIAÍ: falha no desbloqueio');
    } finally {
      $('accessSubmit').disabled = false; firstSetupUI();
    }
  });

  function monthRows(rows) { return rows.filter(item => String(item.date || '').slice(0, 7) === $('monthPicker').value); }
  function eligible(rows) { return rows.filter(x => ['approved','available','received'].includes(x.status)); }
  function eligibleNoInvoice(rows) { return eligible(rows).filter(x => !x.invoiceId || !db.invoices.some(n => n.id === x.invoiceId)); }
  function invoiceFor(row) { return db.invoices.find(n => n.id === row.invoiceId) || null; }
  function sum(rows, property) { return rows.reduce((total,x) => total + toNum(x[property]), 0); }
  function reportRows() { return monthRows(db.transactions).slice().sort((a,b) => a.date.localeCompare(b.date) || a.order.localeCompare(b.order)); }
  function empty(columns, text) { return '<tr><td colspan="' + columns + '" class="empty-cell">' + escapeHTML(text) + '</td></tr>'; }
  function shortMonth(ym) {
    if (!/^\d{4}-\d{2}$/.test(String(ym))) return 'Competência inválida';
    const d = new Date(ym + '-01T12:00:00');
    return d.toLocaleDateString('pt-BR', {month:'long',year:'numeric'});
  }
  function reportMoney(n) { return toNum(n).toFixed(2).replace('.', ','); }
  function btnEdit(type,id) {
    return '<div class="cell-actions"><button type="button" data-edit="' + type + '" data-id="' + escapeHTML(id) + '">Editar</button><button type="button" class="delete" data-delete="' + type + '" data-id="' + escapeHTML(id) + '">Excluir</button></div>';
  }
  function formatStatus(status) { return pill(status); }
  function renderOverview() {
    const rows = monthRows(db.transactions), expenses = monthRows(db.expenses);
    const estimated = sum(eligible(rows),'commission'), received = sum(rows.filter(x=>x.status === 'received'),'commission');
    const costs = sum(expenses,'amount'), missing = eligibleNoInvoice(rows).length;
    const cards = [
      ['Comissões aprovadas*', money(estimated), 'Aprovadas, disponíveis e recebidas', 'neutral'],
      ['Comissões recebidas', money(received), 'Conforme lançamentos reais', 'positive'],
      ['Despesas registradas', money(costs), 'Lançamento manual', ''],
      ['Resultado efetivo parcial', money(received - costs), 'Recebido menos custos registrados', '']
    ];
    $('kpiGrid').innerHTML = cards.map(x => '<article class="kpi-card ' + x[3] + '"><span>' + escapeHTML(x[0]) + '</span><strong>' + x[1] + '</strong><small>' + escapeHTML(x[2]) + '</small></article>').join('');
    const max = Math.max(1, ...Object.keys(STATUS).slice(0,5).map(s=>rows.filter(x=>x.status===s).length));
    const bars = [['received','Recebidas'],['available','Disponíveis'],['approved','Aprovadas'],['pending','Pendentes'],['refunded','Estornadas']];
    $('statusBars').innerHTML = bars.map(pair => {
      const n = rows.filter(x=>x.status===pair[0]).length;
      const kind = pair[0] === 'pending' ? 'warning-bar' : pair[0] === 'refunded' ? 'muted-bar' : '';
      return '<div class="bar-item"><div class="bar-head"><span>' + pair[1] + '</span><strong>' + n + '</strong></div><div class="bar-track"><div class="bar-fill ' + kind + ' pct-' + Math.round(10*n/max)*10 + '"></div></div></div>';
    }).join('');
    const current = $('monthPicker').value;
    const submission = db.submissions[current];
    const items = [
      [missing === 0, missing === 0 ? 'Notas vinculadas' : missing + ' comissão(ões) sem NFS-e', missing ? 'Vincule notas emitidas às transações aprovadas.' : 'Sem pendências documentais identificadas nos lançamentos.'],
      [eligible(rows).length === 0 || !!submission, submission ? 'Envio mensal registrado' : 'Verificar envio à Leadlovers', submission ? 'Registrado em ' + fmtDate(String(submission.sentAt).slice(0,10)) : 'Prepare o relatório e envie com as NFS-e.'],
      [true, 'Backup criptografado', 'Baixe regularmente em Configurações; os dados não sincronizam.']
    ];
    $('overviewActions').innerHTML = items.map(x => '<div class="task-item ' + (x[0] ? '' : 'attention') + '"><span class="task-icon">' + (x[0] ? '✓' : '!') + '</span><div><strong>' + escapeHTML(x[1]) + '</strong><p>' + escapeHTML(x[2]) + '</p></div></div>').join('');
    const latest = db.transactions.slice().sort((a,b) => b.date.localeCompare(a.date)).slice(0,5);
    $('recentTransactions').innerHTML = latest.length ? latest.map(x => '<tr><td>' + fmtDate(x.date) + '</td><td>' + escapeHTML(x.order) + '</td><td>' + money(x.commission) + '</td><td>' + formatStatus(x.status) + '</td><td>' + escapeHTML((invoiceFor(x)||{}).number || 'Pendente') + '</td></tr>').join('') : empty(5,'Ainda não existem transações cadastradas.');
    $('kpiGrid').setAttribute('aria-label',missing+' comissões elegíveis sem nota vinculada');
  }
  function renderTransactions() {
    const q = $('transactionSearch').value.toLowerCase().trim();
    const list = db.transactions.filter(x => !q || (x.order+' '+x.product).toLowerCase().includes(q)).sort((a,b)=>b.date.localeCompare(a.date));
    $('transactionsBody').innerHTML = list.length ? list.map(x => '<tr><td>' + fmtDate(x.date) + '</td><td><strong>' + escapeHTML(x.order) + '</strong></td><td>' + escapeHTML(x.product) + '</td><td>' + money(x.commission) + '</td><td>' + formatStatus(x.status) + '</td><td>' + escapeHTML((invoiceFor(x)||{}).number || 'Não vinculada') + '</td><td>' + btnEdit('transaction',x.id) + '</td></tr>').join('') : empty(7,'Sem transações para mostrar.');
  }
  function renderInvoices() {
    const list = db.invoices.slice().sort((a,b)=>b.date.localeCompare(a.date));
    $('invoicesBody').innerHTML = list.length ? list.map(x => {
      const n = db.transactions.filter(t=>t.invoiceId===x.id).length;
      const url = safeHttps(x.url);
      return '<tr><td>' + fmtDate(x.date) + '</td><td><strong>' + escapeHTML(x.number) + '</strong></td><td>' + money(x.amount) + '</td><td>' + n + '</td><td>' + formatStatus(x.status) + '</td><td>' + (url ? '<a href="' + escapeHTML(url) + '" target="_blank" rel="noopener noreferrer">Consultar ↗</a>' : '—') + '</td><td>' + btnEdit('invoice',x.id) + '</td></tr>';
    }).join('') : empty(7,'Nenhuma NFS-e cadastrada. Emita no portal oficial antes de registrá-la aqui.');
  }
  function renderExpenses() {
    const list = db.expenses.slice().sort((a,b)=>b.date.localeCompare(a.date));
    $('expensesBody').innerHTML = list.length ? list.map(x => '<tr><td>' + fmtDate(x.date) + '</td><td>' + escapeHTML(x.category) + '</td><td>' + escapeHTML(x.description) + '</td><td>' + money(x.amount) + '</td><td>' + btnEdit('expense',x.id) + '</td></tr>').join('') : empty(5,'Nenhuma despesa cadastrada.');
  }
  function invoiceState(t) {
    if (t.status === 'refunded') return 'Estornada';
    if (t.status === 'pending') return 'Aguardando aprovação';
    return invoiceFor(t) ? 'NFS-e vinculada' : 'Pendente de NFS-e';
  }
  function renderReports() {
    const rows = reportRows(), month = $('monthPicker').value;
    $('reportMonthLabel').textContent = shortMonth(month);
    $('reportGenerated').textContent = 'Gerado em ' + new Date().toLocaleString('pt-BR');
    const valid = eligible(rows);
    $('reportSummary').innerHTML = '<div class="report-stats"><div>Transações no período<strong>' + rows.length + '</strong></div><div>Comissões aprovadas*<strong>' + money(sum(valid,'commission')) + '</strong></div><div>NFS-e vinculadas<strong>' + valid.filter(x=>!!invoiceFor(x)).length + ' / ' + valid.length + '</strong></div></div><p class="fineprint">* Inclui aprovadas, disponíveis e recebidas, sem considerar estornos nem transações pendentes. Não equivale a valor sacado.</p>';
    $('reportBody').innerHTML = rows.length ? rows.map(x => {
      const nf = invoiceFor(x);
      return '<tr><td>' + escapeHTML(x.order) + '</td><td>' + fmtDate(x.date) + '</td><td>' + reportMoney(x.commission) + '</td><td>' + escapeHTML(label(x.status)) + '</td><td>' + escapeHTML(nf ? nf.number : '—') + '</td><td>' + (nf ? fmtDate(nf.date) : '—') + '</td><td>' + escapeHTML(invoiceState(x)) + '</td></tr>';
    }).join('') : empty(7,'Nenhuma transação para a competência selecionada.');
    const submission = db.submissions[month];
    $('reportSubmission').textContent = submission ? 'Envio registrado em ' + new Date(submission.sentAt).toLocaleString('pt-BR') + ' (registro manual).' : 'Envio desta competência ainda não registrado.';
    $('btnMarkSent').textContent = submission ? 'Atualizar data do envio' : 'Registrar envio';
    const subject = 'CRIAÍ — NFS-e e relatório de comissões — ' + shortMonth(month);
    const body = 'Prezados,\n\nEncaminho, em anexo, as NFS-e e o relatório que relaciona as transações comissionadas às respectivas notas fiscais, referentes à competência ' + shortMonth(month) + '.\n\nAtenciosamente,\n' + (db.settings.issuerName || 'Afiliado CRIAÍ') + '\n\n[ANEXAR O RELATÓRIO E TODAS AS NFS-e ANTES DE ENVIAR]';
    $('btnPrepareEmail').href = 'mailto:' + RECIPIENT + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }
  const NATIONAL_HOLIDAYS = ['01-01','04-21','05-01','09-07','10-12','11-02','11-15','11-20','12-25'];
  function expectedDeadline(ym) {
    const date = new Date(ym + '-01T12:00:00');
    if (isNaN(date)) return '';
    let nextYear = date.getFullYear(), nextMonth = date.getMonth()+1;
    if (nextMonth >= 12) { nextMonth = 0; nextYear++; }
    let count=0, result='';
    for (let i=1;i<=17;i++) {
      const d=new Date(nextYear,nextMonth,i,12);
      const md=String(nextMonth+1).padStart(2,'0')+'-'+String(i).padStart(2,'0');
      if (d.getDay()!==0 && d.getDay()!==6 && !NATIONAL_HOLIDAYS.includes(md)) count++;
      if (count===5) { result=String(nextYear)+'-'+String(nextMonth+1).padStart(2,'0')+'-'+String(i).padStart(2,'0'); break; }
    }
    return result;
  }
  function complianceData() {
    const month=$('monthPicker').value, rows=reportRows(), valid=eligible(rows);
    const unlinked=eligibleNoInvoice(rows);
    const submissions=db.submissions[month];
    return {month,rows,valid,unlinked,submissions};
  }
  function renderCompliance() {
    const c=complianceData(), deadline=expectedDeadline(c.month);
    $('deadlineLabel').textContent = deadline ? fmtDate(deadline) : '—';
    $('deadlineNote').textContent = 'Estimativa para envio da competência ' + shortMonth(c.month) + '. Exclui fins de semana e feriados nacionais fixos; verifique feriados locais, móveis e orientação da contabilidade.';
    const groups = [
      [c.rows.length>0, 'Conciliar os registros da Hotmart', c.rows.length+' transação(ões) cadastrada(s) na competência.'],
      [c.unlinked.length===0, 'Vincular NFS-e às comissões elegíveis', c.unlinked.length ? c.unlinked.length+' transação(ões) exigem conferência de nota fiscal.' : 'Sem falta de vínculo entre as transações aprovadas registradas.'],
      [!!c.submissions, 'Enviar NFS-e e relatório mensal', c.submissions ? 'Envio registrado manualmente.' : 'Prepare o CSV/PDF, junte as NFS-e e envie por e-mail.'],
      [!!db.settings.issuerName && !!db.settings.recipientTax, 'Conferir dados fiscais', 'Confira o tomador e os dados da emissão com a Leadlovers e o contador.'],
      [false, 'Guardar os arquivos originais', 'Guarde o PDF/XML emitido no portal oficial e seu comprovante de envio fora deste navegador.']
    ];
    $('complianceChecklist').innerHTML = groups.map(x => '<div class="check-item ' + (x[0] ? '' : 'todo') + '"><span class="check-mark">' + (x[0] ? '✓' : '!') + '</span><div><strong>' + escapeHTML(x[1]) + '</strong><p>' + escapeHTML(x[2]) + '</p></div></div>').join('');
  }
  function renderSettings() {
    const settings = db.settings;
    for (const k of ['issuerName','issuerTax','municipality','recipientName','recipientTax']) $(k).value = settings[k] || '';
  }
  function renderAll() {
    if (!db) return;
    renderOverview(); renderTransactions(); renderInvoices(); renderExpenses();
    renderReports(); renderCompliance(); renderSettings();
  }
  function closeSidebar() { $('sidebar').classList.remove('open'); $('sidebarBackdrop').hidden=true; }
  function route(name) {
    if (!(name in ROUTE_TITLE)) return;
    currentRoute=name;
    document.querySelectorAll('.view').forEach(view => { const active=view.id==='view-'+name; view.hidden=!active; view.classList.toggle('active',active); });
    document.querySelectorAll('.side-nav [data-route]').forEach(btn => {
      const active=btn.dataset.route===name; btn.classList.toggle('active',active);
      if(active) btn.setAttribute('aria-current','page'); else btn.removeAttribute('aria-current');
    });
    $('topTitle').textContent=ROUTE_TITLE[name];
    closeSidebar(); window.scrollTo({top:0,behavior:'auto'});
  }
  function fillInvoiceOptions(selected) {
    const options='<option value="">Sem nota vinculada</option>'+db.invoices.map(x=>'<option value="'+escapeHTML(x.id)+'">'+escapeHTML(x.number)+' — '+fmtDate(x.date)+'</option>').join('');
    $('txnInvoice').innerHTML=options; $('txnInvoice').value=selected || '';
  }
  function openDialog(name,id) {
    if (!db) return;
    const dialog=$(name), item=id || '';
    if (name==='transactionDialog') {
      const x=db.transactions.find(z=>z.id===item);
      $('transactionDialogTitle').textContent=x?'Editar comissão':'Registrar comissão';
      $('transactionId').value=x?x.id:'';
      $('txnDate').value=x?x.date:today(); $('txnOrder').value=x?x.order:'';
      $('txnProduct').value=x?x.product:'Leadlovers'; $('txnCommission').value=x?x.commission:'';
      $('txnStatus').value=x?x.status:'pending'; $('txnNotes').value=x?x.notes:'';
      fillInvoiceOptions(x?x.invoiceId:'');
    } else if (name==='invoiceDialog') {
      const x=db.invoices.find(z=>z.id===item);
      $('invoiceDialogTitle').textContent=x?'Editar NFS-e':'Registrar nota fiscal';
      $('invoiceId').value=x?x.id:''; $('nfNumber').value=x?x.number:'';
      $('nfDate').value=x?x.date:today(); $('nfAmount').value=x?x.amount:'';
      $('nfStatus').value=x?x.status:'issued'; $('nfVerify').value=x?x.verify:'';
      $('nfUrl').value=x?x.url:''; $('nfNotes').value=x?x.notes:'';
    } else if (name==='expenseDialog') {
      const x=db.expenses.find(z=>z.id===item);
      $('expenseDialogTitle').textContent=x?'Editar despesa':'Registrar despesa';
      $('expenseId').value=x?x.id:''; $('expDate').value=x?x.date:today();
      $('expCategory').value=x?x.category:'Google Ads'; $('expDescription').value=x?x.description:'';
      $('expAmount').value=x?x.amount:'';
    }
    dialog.showModal();
  }
  function closeDialog(name) { const d=$(name); if(d && d.open)d.close(); }
  $('transactionForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const id=$('transactionId').value || newId();
    const row={id,date:$('txnDate').value,order:$('txnOrder').value.trim(),product:$('txnProduct').value.trim()||'Leadlovers',commission:parseMoney($('txnCommission').value),status:$('txnStatus').value,invoiceId:$('txnInvoice').value||'',notes:$('txnNotes').value.trim()};
    if(!row.order||!row.date||!Number.isFinite(row.commission)){toast('Confira data, ID e valor da comissão.');return;}
    if(db.transactions.some(x=>x.order.toLowerCase()===row.order.toLowerCase()&&x.id!==id)){toast('Este ID Hotmart já está cadastrado.');return;}
    await update(d=>{const i=d.transactions.findIndex(x=>x.id===id);if(i>=0)d.transactions[i]=row;else d.transactions.push(row);},'Transação salva.');
    closeDialog('transactionDialog');
  });
  $('invoiceForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const id=$('invoiceId').value||newId(), rawUrl=$('nfUrl').value.trim();
    if(rawUrl&&!safeHttps(rawUrl)){toast('Informe somente uma URL HTTPS para consulta.');return;}
    const row={id,number:$('nfNumber').value.trim(),date:$('nfDate').value,amount:parseMoney($('nfAmount').value),status:$('nfStatus').value,verify:$('nfVerify').value.trim(),url:rawUrl,notes:$('nfNotes').value.trim()};
    if(!row.number||!row.date||!Number.isFinite(row.amount)){toast('Confira número, data e valor da nota.');return;}
    if(db.invoices.some(x=>x.number.toLowerCase()===row.number.toLowerCase()&&x.id!==id)){toast('Este número de NFS-e já foi cadastrado.');return;}
    await update(d=>{const i=d.invoices.findIndex(x=>x.id===id);if(i>=0)d.invoices[i]=row;else d.invoices.push(row);},'NFS-e registrada.');
    closeDialog('invoiceDialog');
  });
  $('expenseForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const id=$('expenseId').value||newId();
    const row={id,date:$('expDate').value,category:$('expCategory').value,description:$('expDescription').value.trim(),amount:parseMoney($('expAmount').value)};
    if(!row.date||!row.description||!Number.isFinite(row.amount)){toast('Confira os dados da despesa.');return;}
    await update(d=>{const i=d.expenses.findIndex(x=>x.id===id);if(i>=0)d.expenses[i]=row;else d.expenses.push(row);},'Despesa salva.');
    closeDialog('expenseDialog');
  });
  $('settingsForm').addEventListener('submit',async e=>{
    e.preventDefault();
    const settings={};
    for(const k of ['issuerName','issuerTax','municipality','recipientName','recipientTax'])settings[k]=$(k).value.trim();
    await update(d=>{d.settings=settings;},'Dados fiscais atualizados.');
  });
  document.addEventListener('click',async e=>{
    const routeBtn=e.target.closest('[data-route]');
    if(routeBtn && db) {route(routeBtn.dataset.route);return;}
    const open=e.target.closest('[data-open-dialog]');
    if(open && db) {openDialog(open.dataset.openDialog);return;}
    const close=e.target.closest('[data-close-dialog]');
    if(close){closeDialog(close.dataset.closeDialog);return;}
    const edit=e.target.closest('[data-edit]');
    if(edit && db){openDialog({transaction:'transactionDialog',invoice:'invoiceDialog',expense:'expenseDialog'}[edit.dataset.edit],edit.dataset.id);return;}
    const del=e.target.closest('[data-delete]');
    if(del && db){
      const type=del.dataset.delete,id=del.dataset.id;
      const found=type==='transaction'?db.transactions.find(x=>x.id===id):type==='invoice'?db.invoices.find(x=>x.id===id):db.expenses.find(x=>x.id===id);
      if(!found)return;
      const links=type==='invoice'?db.transactions.filter(x=>x.invoiceId===id).length:0;
      if(!confirm('Excluir este registro?'+(links?' A nota está vinculada a '+links+' transação(ões), que ficarão sem nota.':'')))return;
      await update(d=>{
        if(type==='transaction')d.transactions=d.transactions.filter(x=>x.id!==id);
        if(type==='invoice'){d.invoices=d.invoices.filter(x=>x.id!==id);d.transactions.forEach(x=>{if(x.invoiceId===id)x.invoiceId='';});}
        if(type==='expense')d.expenses=d.expenses.filter(x=>x.id!==id);
      },'Registro excluído.');
    }
  });
  $('monthPicker').addEventListener('change',()=>{if(db)renderAll();});
  $('transactionSearch').addEventListener('input',()=>{if(db)renderTransactions();});
  $('menuToggle').addEventListener('click',()=>{$('sidebar').classList.toggle('open');$('sidebarBackdrop').hidden=!$('sidebar').classList.contains('open');});
  $('sidebarBackdrop').addEventListener('click',closeSidebar);
  $('btnLock').addEventListener('click',lock);
  $('btnLockSettings').addEventListener('click',lock);
  $('btnReportPrint').addEventListener('click',()=>{if(db){route('reports');window.print();}});
  $('btnMarkSent').addEventListener('click',async()=>{
    if(!db)return;
    const month=$('monthPicker').value, c=complianceData();
    if(c.unlinked.length>0){
      const proceed=confirm('Há '+c.unlinked.length+' comissão(ões) elegível(is) sem NFS-e vinculada. Deseja mesmo registrar que enviou tudo?');
      if(!proceed)return;
    }
    if(!confirm('Confirme somente se você realmente enviou por e-mail o relatório mensal e todas as NFS-e aplicáveis. Este registro não envia e-mail.'))return;
    await update(d=>{d.submissions[month]={sentAt:new Date().toISOString()};},'Envio registrado manualmente.');
  });
  function csvEscape(value) {
    let s=String(value==null?'':value);
    if(/^[=+\-@\t\r]/.test(s.trimStart()))s="'"+s;
    return '"'+s.replace(/"/g,'""')+'"';
  }
  function download(name,blob) {
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  function downloadCsv(name,lines) {
    const csv='\ufeff'+lines.map(r=>r.map(csvEscape).join(';')).join('\r\n');
    download(name,new Blob([csv],{type:'text/csv;charset=utf-8'}));
  }
  const TRANSACTION_HEADERS=['Data da transação','ID da transação','Produto','Valor da comissão','Status','Número da NFS-e','Observações'];
  $('btnTemplateCsv').addEventListener('click',()=>downloadCsv('criai-modelo-hotmart.csv',[TRANSACTION_HEADERS]));
  $('btnExportTransactions').addEventListener('click',()=>{
    if(!db)return;
    const lines=[TRANSACTION_HEADERS,...db.transactions.map(x=>[fmtDate(x.date),x.order,x.product,reportMoney(x.commission),label(x.status),(invoiceFor(x)||{}).number||'',x.notes])];
    downloadCsv('criai-transacoes.csv',lines);
  });
  $('btnReportCsv').addEventListener('click',()=>{
    if(!db)return;
    const rows=reportRows(),header=['Competência','ID transação','Data transação','Produto','Comissão (R$)','Status Hotmart','NFS-e número','NFS-e emissão','Valor da NFS-e (R$)','Situação da vinculação'];
    const lines=[header,...rows.map(x=>{const n=invoiceFor(x);return [$('monthPicker').value,x.order,fmtDate(x.date),x.product,reportMoney(x.commission),label(x.status),n?n.number:'',n?fmtDate(n.date):'',n?reportMoney(n.amount):'',invoiceState(x)];})];
    downloadCsv('criai-relatorio-'+$('monthPicker').value+'.csv',lines);
  });
  $('btnExportBackup').addEventListener('click',()=>{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw){toast('Cofre sem dados.');return;}
    download('criai-backup-criptografado-'+today()+'.json',new Blob([raw],{type:'application/json'}));
    toast('Backup criptografado baixado. Guarde em local seguro.');
  });
  const importBackup = () => { $('backupFile').value='';$('backupFile').click(); };
  $('btnImportBackup').addEventListener('click',importBackup);
  $('importAccess').addEventListener('click',importBackup);
  $('backupFile').addEventListener('change',async e=>{
    const file=e.target.files[0];if(!file)return;
    if(file.size>MAX_IMPORT_BYTES){toast('Backup grande demais para restauração local.');return;}
    try {
      const item=JSON.parse(await file.text());
      if(!isValidRecord(item))throw Error('Formato inválido');
      if(localStorage.getItem(STORAGE_KEY) && !confirm('Restaurar este backup vai SUBSTITUIR os dados locais atuais. Você possui a senha do arquivo e uma cópia do cofre atual?'))return;
      localStorage.setItem(STORAGE_KEY,JSON.stringify(item));
      db=null;cryptoKey=null;saltBytes=null;
      $('appShell').hidden=true;$('accessScreen').hidden=false;firstSetupUI();
      toast('Backup importado. Entre com e-mail e senha originais do backup.');
    } catch (_) {toast('Arquivo inválido. Nenhum dado foi substituído.');}
  });
  function parseCsv(raw) {
    const lines=String(raw).replace(/^\ufeff/,'').replace(/^\s*sep=[;,]\r?\n/i,'');
    const firstLine=lines.split(/\r?\n/,1)[0];
    const separator=(firstLine.match(/;/g)||[]).length >= (firstLine.match(/,/g)||[]).length ? ';' : ',';
    const out=[]; let row=[],current='',quotes=false;
    for(let i=0;i<lines.length;i++){
      const ch=lines[i],next=lines[i+1];
      if(ch==='"'){
        if(quotes&&next==='"'){current+='"';i++;} else quotes=!quotes;
      } else if(ch===separator&&!quotes){row.push(current);current='';}
      else if((ch==='\n'||ch==='\r')&&!quotes){
        if(ch==='\r'&&next==='\n')i++;
        row.push(current);current='';if(row.some(x=>x.trim()))out.push(row);row=[];
      } else current+=ch;
    }
    if(quotes)throw Error('CSV com aspas abertas');
    row.push(current);if(row.some(x=>x.trim()))out.push(row);
    return out;
  }
  function normalized(s) {return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function keyIndex(header,alternatives) {
    const normalizedHeaders=header.map(normalized);
    for(const alt of alternatives){const found=normalizedHeaders.indexOf(normalized(alt));if(found>=0)return found;}
    return -1;
  }
  function csvDate(s) {
    const raw=String(s||'').trim();
    if(/^\d{4}-\d{2}-\d{2}/.test(raw))return raw.slice(0,10);
    const pt=raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
    if(pt)return pt[3]+'-'+pt[2]+'-'+pt[1];
    return '';
  }
  function mapStatus(s) {
    const v=normalized(s);
    if(/estorn|reembols|cancel|refund|chargeback/.test(v))return 'refunded';
    if(/receb|retirad|saqu|paid|withdraw/.test(v))return 'received';
    if(/dispon|available|liberad/.test(v))return 'available';
    if(/aprov|complet|confirm|approved/.test(v))return 'approved';
    return 'pending';
  }
  $('btnImportCsv').addEventListener('click',()=>{$('csvFile').value='';$('csvFile').click();});
  $('csvFile').addEventListener('change',async e=>{
    if(!db)return;
    const file=e.target.files[0];if(!file)return;
    if(file.size>MAX_IMPORT_BYTES){toast('Arquivo CSV acima de 5 MB. Divida a importação.');return;}
    try {
      const rows=parseCsv(await file.text()), header=rows.shift()||[];
      const indices={
        order:keyIndex(header,['ID da transação','Código da transação','Código da venda','Transaction ID','Código','ID Hotmart','ID','Transação']),
        date:keyIndex(header,['Data da transação','Data da compra','Data de compra','Data da venda','Data','Data da transação original']),
        commission:keyIndex(header,['Valor da comissão','Comissão do afiliado','Comissão líquida','Comissão','Valor comissão','Comissão (R$)','Comissionamento']),
        product:keyIndex(header,['Produto','Nome do produto','Título do produto']),
        status:keyIndex(header,['Status','Situação','Status da venda','Situação da transação']),
        notes:keyIndex(header,['Observações','Notas'])
      };
      if(indices.order<0||indices.date<0||indices.commission<0)throw Error('Cabeçalhos incompatíveis. Use o Modelo CSV e confira a exportação original.');
      const ready=[];let invalid=0;
      const seen=new Set(db.transactions.map(x=>x.order.toLowerCase()));
      for(const line of rows.slice(0,10000)){
        const order=String(line[indices.order]||'').trim();
        const date=csvDate(line[indices.date]);
        const commission=parseMoney(line[indices.commission]);
        if(!order||!date||!Number.isFinite(commission)||seen.has(order.toLowerCase())){invalid++;continue;}
        seen.add(order.toLowerCase());
        ready.push({id:newId(),order,date,commission,product:indices.product>=0?(line[indices.product]||'Leadlovers'):'Leadlovers',status:indices.status>=0?mapStatus(line[indices.status]):'pending',invoiceId:'',notes:indices.notes>=0?String(line[indices.notes]||'').slice(0,700):''});
      }
      if(!ready.length){toast('Nenhuma transação nova válida encontrada.');return;}
      if(!confirm('Importar '+ready.length+' transação(ões) do CSV? '+invalid+' linha(s) ignorada(s) por duplicação ou campos inválidos. Confira os status após a importação.'))return;
      await update(d=>{d.transactions.push(...ready);},ready.length+' transação(ões) importada(s).');
    } catch (err) {alert('Não foi possível importar este CSV: '+err.message);}
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&$('sidebar').classList.contains('open'))closeSidebar();
  });
  for(const type of ['pointerdown','keydown','input','scroll'])document.addEventListener(type,()=>{if(db)lastActive=Date.now();},{passive:true});
  setInterval(()=>{if(db && Date.now()-lastActive>INACTIVITY_MS)lock();},30000);
  window.addEventListener('storage',event=>{
    if(event.key===STORAGE_KEY && db) {
      lock(); toast('Dados alterados em outra aba. Entre novamente para evitar conflitos.');
    }
  });
  function init() {
    try {
      if(!window.crypto || !crypto.subtle || !window.isSecureContext)errorMessage('O painel exige HTTPS e Web Crypto.');
      firstSetupUI();
    } catch(_) {errorMessage('Este navegador não permite armazenar o cofre.');}
  }
  init();
})();