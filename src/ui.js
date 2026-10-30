/* ===== UI ===== */
const { esc, byId } = CORE;
const $ = s => document.querySelector(s);
const main = () => document.getElementById('main');
const eur = v => '€ ' + (Math.round((+v || 0) * 100) / 100).toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const today = () => new Date().toISOString().slice(0, 10);
const clone = o => JSON.parse(JSON.stringify(o));
const fmtDate = d => d ? new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
const STATUS = { draft: 'Draft', sent: 'Sent', accepted: 'Accepted', lost: 'Lost' };
const DEFAULT_SIZE = { 'W-F': [1000, 1200], 'W-DK': [1000, 1400], 'W-D': [1000, 1400], 'W-K': [1000, 600], 'W-2S': [1400, 1400], 'W-FDK': [1600, 1400], 'W-3P': [2400, 1400], 'W-TL': [1000, 2000], 'D-ENT': [1000, 2200], 'D-SL': [1500, 2200], 'D-TER': [900, 2200], 'D-FR': [1400, 2200], 'S-HS': [3000, 2300], 'S-PSK': [2000, 2200] };

const S = {
  view: 'quotes', quotes: [], pb: CORE.samplePricebook(), grids: null, q: null, cfg: null, editIdx: -1,
  search: '', pbTab: 'grids', pbSys: 'P70', pbType: 'W-DK', canEdit: true, mode: 'local', confirm: null, dl: null, cfgTab: 'type',
};
const fillPb = p => { const b = CORE.samplePricebook(); for (const k of Object.keys(b)) if (p[k] == null) p[k] = b[k]; return p; };
S.grids = CORE.sampleGrids(S.pb);

/* ---------- storage: shared db when the viewer serves it, browser storage otherwise ---------- */
const LS = {
  get(k, d) { try { const v = localStorage.getItem('wscpq.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('wscpq.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
};
const Store = {
  db: null,
  async boot() {
    const lq = LS.get('quotes', null); if (lq) S.quotes = lq;
    const lp = LS.get('pricebook', null); if (lp) { S.pb = fillPb(lp); S.grids = mergeGrids(LS.get('grids', {})); }
    render();
    let db = null;
    try { db = window.claude && window.claude.use ? await window.claude.use('db') : null; } catch (e) { db = null; }
    if (!db) { S.mode = 'local'; renderTop(); return; }
    this.db = db; S.mode = 'db';
    try { const u = await window.claude.use('user'); if (u) S.canEdit = await u.canEdit(); } catch (e) {}
    try {
      const pbs = await db.doc('settings/pricebook').get();
      if (pbs.exists) S.pb = fillPb(clone(pbs.data()));
      else { S.pb = CORE.samplePricebook(); }
      const g = {};
      for (const s of S.pb.systems) { const d = await db.doc('pricegrids/' + s.id).get(); if (d.exists) g[s.id] = clone(d.data()).grids || {}; }
      S.grids = mergeGrids(g);
    } catch (e) { toast('Could not load the price book. Showing sample prices.'); }
    db.collection('quotes').onSnapshot(snap => {
      S.quotes = snap.docs.map(d => clone(d.data()));
      if (['quotes'].includes(S.view)) render(); else renderTop();
    }, () => toast('Live updates stopped. Reload the page to reconnect.'));
    render();
  },
  async saveQuote(q) {
    q.updatedAt = new Date().toISOString();
    const i = S.quotes.findIndex(x => x.id === q.id);
    if (i >= 0) S.quotes[i] = clone(q); else S.quotes.push(clone(q));
    if (this.db) { try { await this.db.doc('quotes/' + q.id).set(clone(q)); } catch (e) { toast(e && e.code === 'quota_exceeded' ? 'Storage is full. Delete old offers first.' : 'Could not save the offer. Try again.'); return false; } }
    else LS.set('quotes', S.quotes);
    if (typeof syncSiblings === 'function') syncSiblings(q);
    return true;
  },
  async deleteQuote(id) {
    S.quotes = S.quotes.filter(q => q.id !== id);
    if (this.db) { try { await this.db.doc('quotes/' + id).delete(); } catch (e) { toast('Could not delete the offer.'); } }
    else LS.set('quotes', S.quotes);
  },
  async savePricebook(systemIds) {
    S.pb.updatedAt = new Date().toISOString();
    if (this.db) {
      try {
        await this.db.doc('settings/pricebook').set(clone(S.pb));
        for (const id of (systemIds || S.pb.systems.map(s => s.id))) await this.db.doc('pricegrids/' + id).set({ grids: clone(S.grids[id] || {}), updatedAt: S.pb.updatedAt });
        return true;
      } catch (e) { toast(e && e.code === 'invalid_argument' ? 'Only editors of this page can change the price book.' : 'Could not save the price book.'); return false; }
    }
    LS.set('pricebook', S.pb); LS.set('grids', S.grids); return true;
  },
};
function mergeGrids(stored) {
  const base = CORE.sampleGrids(S.pb);
  for (const [sid, types] of Object.entries(stored || {})) { base[sid] = base[sid] || {}; Object.assign(base[sid], types); }
  return base;
}

/* ---------- downloads ---------- */
async function download(filename, data) {
  let d = null;
  try { d = window.claude && window.claude.use ? await window.claude.use('downloads') : null; } catch (e) {}
  if (!d) { S.dl = { filename, data }; render(); toast('Downloads are not available here. Copy the content instead.'); return; }
  try { await d.save({ filename, data }); }
  catch (e) { if (e && e.code !== 'declined') toast(e.code === 'rate_limited' ? 'A download is already waiting for your answer.' : 'The file could not be saved.'); }
}

let toastT;
function toast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true; }, 3200);
}

/* ---------- quote helpers ---------- */
function newQuote() {
  const d = new Date(), n = `OF-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  return { id: uid(), number: n, status: 'draft', createdAt: d.toISOString(), updatedAt: d.toISOString(), date: today(), validityDays: S.pb.company.validityDays || 30,
    client: { name: '', company: '', email: '', phone: '', street: '', zip: '', city: '', vatNo: '' }, reference: '', site: '', vat: S.prefs ? +S.prefs.vat : 21, lang: S.prefs ? (S.prefs.offerLang || S.prefs.lang) : 'en', discount: 0, notes: '', lines: [], inst: { crew: null, hours: null, days: null, items: {} } };
}
function linePrice(cfg) { return CORE.price(S.pb, S.grids, cfg); }

/* ---------- top bar ---------- */
function renderTop() {
  const nav = document.getElementById('nav'); if (!nav) return;
  const inQuote = ['client', 'lines', 'config', 'offer'].includes(S.view);
  nav.innerHTML = `<button data-act="go" data-view="quotes" ${S.view === 'quotes' || inQuote ? 'aria-current="page"' : ''}>Offers</button>
    <button data-act="go" data-view="pricebook" ${S.view === 'pricebook' ? 'aria-current="page"' : ''}>Price book</button>
    <button data-act="go" data-view="settings" ${S.view === 'settings' ? 'aria-current="page"' : ''}>Settings</button>`;
  $('#store').textContent = S.mode === 'db' ? 'Shared · saved online' : 'This browser only';
  $('#store').title = S.mode === 'db' ? 'Offers and prices are stored with this page and shared with your team.' : 'Offers are kept in this browser. Open the page from claude.ai to share them with your team.';
}

function render() {
  renderTop();
  const v = S.view, m = main();
  if (v === 'quotes') m.innerHTML = viewQuotes();
  else if (v === 'client') m.innerHTML = qHead() + viewClient();
  else if (v === 'lines') m.innerHTML = qHead() + viewLines();
  else if (v === 'config') m.innerHTML = qHead() + viewConfig();
  else if (v === 'offer') m.innerHTML = qHead() + viewOffer();
  else if (v === 'pricebook') m.innerHTML = viewPricebook();
  else if (v === 'settings') m.innerHTML = viewSettings();
  if (S.dl) m.insertAdjacentHTML('afterbegin', dlFallback());
}

function dlFallback() {
  return `<div class="card panel" style="margin-bottom:16px"><div class="row-actions" style="justify-content:space-between"><h3>${esc(S.dl.filename)}</h3><div class="row-actions"><button class="btn small" data-act="dl-copy">Copy</button><button class="btn small ghost" data-act="dl-close">Close</button></div></div>
  <textarea class="inp" id="dl-text" readonly style="min-height:180px;font-family:var(--f-num);font-size:12px">${esc(S.dl.data)}</textarea></div>`;
}

/* ---------- views: offers list ---------- */
function viewQuotes() {
  const q = S.search.trim().toLowerCase();
  const list = S.quotes.slice().sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
    .filter(x => !q || [x.number, x.client && x.client.name, x.client && x.client.company, x.reference].join(' ').toLowerCase().includes(q));
  const rows = list.map(x => {
    const t = CORE.quoteTotals(x, S.pb);
    return `<button class="qrow" data-act="open-quote" data-id="${esc(x.id)}">
      <div style="min-width:0"><div class="t">${esc(x.client.name || 'No client name')}</div><div class="s">${esc([x.client.company, x.reference].filter(Boolean).join(' · ') || '—')}</div></div>
      <div class="c2" style="min-width:0"><div class="num s">${esc(x.number)}${x.variant ? ` <span class="mat-tag">${esc(x.variant)}</span>` : ''}</div><div class="s">${fmtDate(x.date)} · ${t.units} unit${t.units === 1 ? '' : 's'}</div></div>
      <span class="chip ${esc(x.status)}">${STATUS[x.status] || x.status}</span>
      <div class="amt num">${eur(t.total)}</div></button>`;
  }).join('');
  return `<section class="page-head"><div><p class="eyebrow">Configure · Price · Quote</p><h1>Offers</h1></div>
    <button class="btn primary" data-act="new-quote">+ New offer</button></section>
    ${S.pb.sample ? `<div class="notice" style="margin-bottom:14px"><span>Prices come from the sample price book. Upload your price grids under <b>Price book</b> to quote exact prices.</span></div>` : ''}
    <div class="toolbar"><input class="inp" id="q-search" type="search" placeholder="Search client, offer number or reference" value="${esc(S.search)}" aria-label="Search offers"></div>
    <div class="qlist">${rows || `<div class="card empty"><h2>No offers yet</h2><p class="muted">Start with the client’s name, then add windows and doors.</p><button class="btn primary" data-act="new-quote">+ New offer</button></div>`}</div>`;
}

/* ---------- quote header ---------- */

/* ---------- step 1: client ---------- */
function viewClient() {
  const c = S.q.client, f = (id, label, val, type = 'text', ph = '') => `<div class="field"><label for="${id}">${label}</label><input class="inp" id="${id}" data-q="${id}" type="${type}" value="${esc(val)}" placeholder="${esc(ph)}" autocomplete="off"></div>`;
  return `<div class="two"><div class="card panel">
      <div><h2>Client</h2><p class="muted">Who is the offer for? Only the name is required.</p></div>
      <div class="field"><label for="c.name">Client name *</label><input class="inp" id="c.name" data-q="c.name" value="${esc(c.name)}" placeholder="e.g. Jan Peeters" autocomplete="off" required></div>
      <div class="grid2">${f('c.company', 'Company', c.company)}${f('c.vatNo', 'VAT number', c.vatNo, 'text', 'BE0123.456.789')}</div>
      <div class="grid2">${f('c.email', 'Email', c.email, 'email')}${f('c.phone', 'Phone', c.phone, 'tel')}</div>
      <div class="grid3">${f('c.street', 'Street and number', c.street)}${f('c.zip', 'Postcode', c.zip)}${f('c.city', 'City', c.city)}</div>
      <h2 style="margin-top:6px">Project</h2>
      <div class="grid2">${f('reference', 'Reference', S.q.reference, 'text', 'e.g. Renovation ground floor')}${f('site', 'Site address (if different)', S.q.site)}</div>
      <div class="grid3">
        <div class="field"><label for="vat">VAT rate</label><select class="inp" id="vat" data-q="vat">${[[21, '21 % · standard'], [6, '6 % · renovation, home older than 10 years'], [0, '0 % · intra-EU / co-contractor']].map(([v, l]) => `<option value="${v}" ${+S.q.vat === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        ${f('date', 'Offer date', S.q.date, 'date')}
        ${f('validityDays', 'Valid for (days)', S.q.validityDays, 'number')}
      </div>
      <div class="row-actions" style="justify-content:flex-end"><button class="btn primary" data-act="client-next">Continue to products →</button></div>
    </div>
    <aside class="card panel sticky"><p class="eyebrow">How it works</p>
      <ol style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px" class="muted">
        <li><b style="color:var(--ink)">Client</b> — name and project details.</li>
        <li><b style="color:var(--ink)">Products</b> — configure each window or door: material, system, type, size, colours, glass, hardware and options. The price updates as you go.</li>
        <li><b style="color:var(--ink)">Offer</b> — check totals, discount and VAT, then download the offer.</li></ol></aside></div>`;
}

/* ---------- step 2: product lines ---------- */

function totalsBlock(q, t) {
  return `<div><p class="eyebrow">Offer total</p></div>
    <div class="grid2"><div class="field"><label for="discount">Offer discount</label><div class="unit-inp"><input class="inp num" id="discount" data-q="discount" type="number" min="0" max="100" step="0.5" value="${+q.discount || 0}"><span>%</span></div></div>
    <div class="field"><label for="vat2">VAT</label><select class="inp" id="vat2" data-q="vat">${[21, 6, 0].map(v => `<option value="${v}" ${+q.vat === v ? 'selected' : ''}>${v} %</option>`).join('')}</select></div></div>
    <div class="tot">
      <div class="r"><span>Products (${t.units} units)</span><span>${eur(t.products)}</span></div>
      ${t.labour ? `<div class="r"><span>Placement ${fmtH(t.sc.hours)}</span><span>${eur(t.labour)}</span></div>` : ''}
      ${t.siteCost ? `<div class="r"><span>Site costs</span><span>${eur(t.siteCost)}</span></div>` : ''}
      ${t.lineDisc ? `<div class="r"><span>Line discounts</span><span>−${eur(t.lineDisc)}</span></div>` : ''}
      ${t.qDisc ? `<div class="r"><span>Offer discount ${q.discount}%</span><span>−${eur(t.qDisc)}</span></div>` : ''}
      <div class="r"><span>Total excl. VAT</span><span>${eur(t.net)}</span></div>
      <div class="r"><span>VAT ${q.vat}%</span><span>${eur(t.vat)}</span></div>
      <div class="r big"><span>Total incl. VAT</span><span>${eur(t.total)}</span></div></div>`;
}

/* ---------- configurator ---------- */
const fmtH = h => `${String(Math.round((+h || 0) * 100) / 100).replace('.', ',')} h`;
const unitLbl = (u, n) => u === 'h' ? 'h' : u === 'day' ? (n === 1 ? 'day' : 'days') : 'pc';
const CFG_TABS = [['type', 'Type'], ['dims', 'Dimensions'], ['colour', 'Colour'], ['glass', 'Glass'], ['options', 'Options'], ['finish', 'Finish'], ['place', 'Placement']];

function viewConfig() {
  const c = S.cfg, pb = S.pb, t = CORE.typeById(c.type), sys = byId(pb.systems, c.system);
  const systems = pb.systems.filter(s => s.material === c.material && s.enabled !== false);
  const cols = pb.colours.filter(x => x.material === c.material);
  const nOpen = t.cols.filter(x => CORE.isOpening(x.s) && x.s !== 'DOOR').length;
  const entrance = CORE.isEntrance(t);
  const canMirror = t.cols.length > 1 || t.cols.some(x => x.h);
  const block = (title, body, hint) => `<div class="blk"><div class="blk-h"><h3>${title}</h3>${hint ? `<span class="muted">${hint}</span>` : ''}</div>${body}</div>`;
  const cards = (key, list, sub, valOf = x => x.id) => `<div class="seg">${list.map(x => `<button class="opt-card" data-act="cfg-set" data-k="${key}" data-v="${esc(String(valOf(x)))}" aria-pressed="${String(c[key]) === String(valOf(x))}"><b>${esc(x.name)}</b>${sub(x) ? `<span class="num">${sub(x)}</span>` : ''}</button>`).join('')}</div>`;
  const sel = (key, list, label, fmt) => `<div class="field"><label for="cfg-${key}">${label}</label><select class="inp" id="cfg-${key}" data-cfg="${key}">${list.map(x => `<option value="${x.id}" ${c[key] === x.id ? 'selected' : ''}>${esc(x.name)}${fmt(x)}</option>`).join('')}</select></div>`;
  const area = c.W * c.H / 1e6, reveal = (2 * c.H + c.W) / 1000;
  const co = byId(pb.colours, c.colOut), gl = byId(pb.glazing, c.glazing), fi = byId(pb.finishIn, c.finishIn), fo = byId(pb.finishOut, c.finishOut);
  const nOpts = Object.values(c.options).filter(Boolean).length;
  const summary = {
    type: `${c.material} · ${t.code}`, dims: `${c.W}×${c.H}`, colour: co ? CORE.colName(pb, c, 'out').replace(/\s*\(.*\)/, '') : '', glass: gl ? gl.name.split(',')[0] : '',
    options: nOpts ? `${nOpts} selected` : 'None', finish: [fi && fi.perM ? fi.name : '', fo && fo.perM ? 'outside' : ''].filter(Boolean).join(' + ') || 'None',
    place: c.place === false ? (c.breakout ? 'Breakout only' : 'Supply only') : fmtH(CORE.hoursFor(pb, c)),
  };
  const tab = S.cfgTab;
  let body = '';

  if (tab === 'type') {
    const typesHtml = `<div class="types">${Object.entries(CORE.CATS).map(([cat, label]) => {
      const ts = CORE.TYPES.filter(x => x.cat === cat && (!x.materials || x.materials.includes(c.material)) && S.grids[c.system] && S.grids[c.system][x.id]);
      if (!ts.length) return '';
      return `<div><p class="lbl" style="margin-bottom:6px">${label}</p><div class="grp">${ts.map(x => {
        const [w, h] = DEFAULT_SIZE[x.id];
        return `<button class="tile" data-act="cfg-type" data-v="${x.id}" aria-pressed="${c.type === x.id}">${CORE.draw(pb, { ...c, type: x.id, W: w, H: h, mirror: false, topH: h * 0.25 }, { noDims: true })}<b>${esc(x.name)}</b><small>${x.code}</small></button>`;
      }).join('')}</div></div>`;
    }).join('')}</div>`;
    body = block('Material', `<div class="seg">${CORE.MATS.map(m => `<button class="opt-card mat" data-act="cfg-set" data-k="material" data-v="${m}" aria-pressed="${c.material === m}"><b>${vLabel(m)}</b><span>${MAT_DESC[m]}</span></button>`).join('')}</div>`)
      + block('System', `<div class="seg">${systems.map(s => `<button class="opt-card" data-act="cfg-set" data-k="system" data-v="${s.id}" aria-pressed="${c.system === s.id}"><b>${esc(s.name)}</b><span class="num">${s.depth} mm · Uw from ${String(s.uw).replace('.', ',')} W/m²K</span></button>`).join('')}</div>`)
      + block('Product type', typesHtml, `${esc(t.name)} · ${t.code}`)
      + (canMirror ? block('Opening direction', `<div class="seg">${[[false, t.cols.length > 1 ? 'As drawn' : 'Hinges left'], [true, t.cols.length > 1 ? 'Mirrored' : 'Hinges right']].map(([v, l]) => `<button class="opt-card" data-act="cfg-set" data-k="mirror" data-v="${v}" aria-pressed="${!!c.mirror === v}"><b>${l}</b><span>Seen from inside</span></button>`).join('')}</div>`) : '');
  } else if (tab === 'dims') {
    const grid = S.grids[c.system] && S.grids[c.system][c.type];
    const lim = grid ? `Width ${grid.w[0]}–${grid.w[grid.w.length - 1]} mm · height ${grid.h[0]}–${grid.h[grid.h.length - 1]} mm` : '';
    const wMin = grid ? grid.w[0] : 300, wMax = grid ? grid.w[grid.w.length - 1] : 3000, hMin = grid ? grid.h[0] : 300, hMax = grid ? grid.h[grid.h.length - 1] : 3000;
    const dim = (k, label, min, max) => {
      const v = +c[k] || 0, out = v < min || v > max;
      return `<div class="field dim"><div class="dim-h"><label for="cfg-${k}">${label}</label>${out ? `<span class="err" style="font-size:12px">Outside ${min}–${max} mm</span>` : ''}</div>
        <div class="dimrow"><input type="range" id="cfg-${k}-r" data-cfg="${k}" min="${min}" max="${max}" step="10" value="${Math.min(max, Math.max(min, v))}" aria-label="${label} in millimetres">
        <div class="unit-inp"><input class="inp num" id="cfg-${k}" data-cfg="${k}" type="number" inputmode="numeric" min="${min}" max="${max}" step="10" value="${v}"><span>mm</span></div></div>
        <div class="dimscale num" aria-hidden="true"><span>${min}</span><span>${max}</span></div></div>`;
    };
    body = block('Outer frame size', `<div class="dims">
        ${dim('W', 'Width', wMin, wMax)}
        ${dim('H', 'Height', hMin, hMax)}
        ${t.top ? dim('topH', 'Top light height', 200, Math.max(210, (+c.H || hMin) - 400)) : ''}
      </div><p class="muted" style="font-size:12.5px">${lim}. Prices follow the next grid step up.</p>`)
      + block('Position and quantity', `<div class="grid3">
        <div class="field"><label for="cfg-label">Position / room</label><input class="inp" id="cfg-label" data-cfg="label" value="${esc(c.label)}" placeholder="e.g. Kitchen"></div>
        <div class="field"><label for="cfg-qty">Quantity</label><input class="inp num" id="cfg-qty" data-cfg="qty" type="number" min="1" step="1" value="${c.qty}"></div>
        <div class="field"><label for="cfg-discount">Line discount</label><div class="unit-inp"><input class="inp num" id="cfg-discount" data-cfg="discount" type="number" min="0" max="100" step="0.5" value="${c.discount}"><span>%</span></div></div></div>`);
  } else if (tab === 'colour') {
    body = block('Outside', colourSide('colOut', 'ralOut'))
      + block('Inside', `<label class="check"><input type="checkbox" id="cfg-same" data-cfgb="sameColour" ${c.sameColour ? 'checked' : ''}> Same colour as outside</label>${c.sameColour ? '' : colourSide('colIn', 'ralIn')}`,
        pb.bicolourPct[c.material] ? `Different colours inside and outside: +${pb.bicolourPct[c.material]}%` : '');
  } else if (tab === 'glass') {
    body = block('Glass', cards('glazing', pb.glazing, x => (x.perM2 ? `+${eur(x.perM2)}/m² · ${eur(x.perM2 * area)} here` : 'Included') + ` · Ug ${String(x.ug).replace('.', ',')}`), `${area.toFixed(2).replace('.', ',')} m²`);
  } else if (tab === 'options') {
    const opts = pb.options.filter(o => CORE.optionAllowed(o, t));
    const unitTxt = o => (o.unit === 'm' ? `${eur(o.price)}/m` : o.unit === 'm2' ? `${eur(o.price)}/m²` : `${eur(o.price)}/pc`) + (o.fixed ? ` + ${eur(o.fixed)}` : '') + (o.min ? ` · min. ${eur(o.min)}` : '');
    const optList = cat => opts.filter(o => o.cat === cat).map(o => {
      const on = !!c.options[o.id];
      return `<label class="optrow ${on ? 'on' : ''}"><span class="check"><input type="checkbox" data-opt="${o.id}" ${on ? 'checked' : ''}> ${esc(o.name)}</span>
        <span class="row-actions">${o.qty && on ? `<input class="inp qty num" type="number" min="1" data-optqty="${o.id}" value="${+c.options[o.id] || 1}" aria-label="Quantity for ${esc(o.name)}">` : ''}<span class="pp num">${unitTxt(o)}</span></span></label>`;
    }).join('');
    const cats = [...new Set(opts.map(o => o.cat))].sort((a, b) => (a === 'Sills' ? -1 : b === 'Sills' ? 1 : 0));
    const ps = x => x.perSash ? ` (+${eur(x.perSash)}/sash)` : '', pp = x => x.price ? ` (+${eur(x.price)})` : '';
    const hw = nOpen ? `<div class="grid3">${sel('handle', pb.handles, 'Handles', ps)}${t.cat !== 'slide' ? sel('hinges', pb.hinges, 'Hinges', ps) : ''}${sel('security', pb.security, 'Security', ps)}</div>` : '';
    const door = entrance ? `<div class="grid2">${sel('doorPanel', pb.doorPanels, 'Door panel', pp)}${sel('doorLock', pb.doorLocks, 'Lock', pp)}${sel('doorHandle', pb.doorHandles, 'Door handle', pp)}${sel('threshold', pb.thresholds, 'Threshold', pp)}</div>` : '';
    body = (cats.includes('Sills') ? block('Sills', `<div class="optgrp">${optList('Sills')}</div>`, `${(c.W / 1000).toFixed(2).replace('.', ',')} m`) : '')
      + (hw ? block('Hinges, handles and security', hw, `${nOpen} opening sash${nOpen > 1 ? 'es' : ''}`) : '')
      + (door ? block('Door hardware', door) : '')
      + cats.filter(x => x !== 'Sills').map(cat => block(esc(cat), `<div class="optgrp">${optList(cat)}</div>`)).join('');
  } else if (tab === 'finish') {
    const sub = x => x.perM ? `${eur(x.perM)}/m · ${eur(x.perM * reveal)} here` : 'Not included';
    body = `<p class="muted" style="font-size:13px">Finishing is priced per metre of reveal: 2 × height + width = <span class="num">${reveal.toFixed(2).replace('.', ',')} m</span>.</p>`
      + block('Inside finishing', cards('finishIn', pb.finishIn, sub)) + block('Outside finishing', cards('finishOut', pb.finishOut, sub));
  } else if (tab === 'place') {
    const auto = CORE.hoursFor(pb, { ...c, hours: null });
    body = block('Placement', `<div class="seg"><button class="opt-card" data-act="cfg-set" data-k="place" data-v="true" aria-pressed="${c.place !== false}"><b>Supply and placement</b><span>Our fitters place the element</span></button>
        <button class="opt-card" data-act="cfg-set" data-k="place" data-v="false" aria-pressed="${c.place === false}"><b>Supply only</b><span>Delivered, placed by others</span></button></div>`)
      + block('Breakout of the old frame', `<div class="seg"><button class="opt-card" data-act="cfg-set" data-k="breakout" data-v="false" aria-pressed="${!c.breakout}"><b>No breakout</b><span>New build or opening ready</span></button>
        <button class="opt-card" data-act="cfg-set" data-k="breakout" data-v="true" aria-pressed="${!!c.breakout}"><b>Break out old frame</b><span>Includes disposal ${eur(pb.labour.disposal || 0)}/unit</span></button></div>
        ${c.breakout ? `<p class="lbl">Old frame material</p>${cards('oldFrame', pb.oldFrames, x => x.factor !== 1 ? `× ${String(x.factor).replace('.', ',')} breakout time` : '')}` : ''}`)
      + block('Labour per unit', `<div class="grid2"><div class="field"><label for="cfg-hours">Person-hours per unit</label><div class="unit-inp"><input class="inp num" id="cfg-hours" data-cfg="hours" type="number" min="0" step="0.25" value="${c.hours != null ? c.hours : ''}" placeholder="${String(auto)}"><span>h</span></div></div>
        <div class="field"><span class="lbl">Calculated</span><span class="num" style="padding-top:9px">${fmtH(auto)} × ${c.qty} = ${fmtH(auto * c.qty)}</span></div></div>
        <p class="muted" style="font-size:12.5px">Leave empty to use the calculated time. Labour, days on site, containers and crane are totalled per offer on the Products step.</p>`);
  }
  const i = CFG_TABS.findIndex(x => x[0] === tab), prev = CFG_TABS[i - 1], next = CFG_TABS[i + 1];
  const nav = `<div class="tabnav">${prev ? `<button class="btn ghost" data-act="cfg-tab" data-v="${prev[0]}">← ${prev[1]}</button>` : '<span></span>'}
    ${next ? `<button class="btn" data-act="cfg-tab" data-v="${next[0]}">Next: ${next[1]} →</button>` : `<button class="btn primary" data-act="save-line" ${linePrice(c).errors.length ? 'disabled' : ''}>${S.editIdx >= 0 ? 'Update line' : 'Add to offer'}</button>`}</div>`;
  const tabs = `<div class="ctabs" role="tablist" aria-label="Configuration">${CFG_TABS.map(([k, l], n) => `<button role="tab" data-act="cfg-tab" data-v="${k}" aria-selected="${tab === k}"><span class="tn num">${n + 1}</span><span class="tl">${l}</span><span class="ts">${esc(summary[k])}</span></button>`).join('')}</div>`;
  return `<div class="cfg"><div class="cfg-main">${tabs}<div class="card tabpanel" role="tabpanel">${body}${nav}</div></div><aside class="cfg-side sticky" id="side">${sideHtml()}</aside></div>
    <div class="mobilebar" id="mbar">${mbarHtml()}</div>`;
}

function siteCard(q, sc) {
  const inst = q.inst || {}, L = S.pb.labour;
  const num = (id, key, label, val, ph, unit) => `<div class="field"><label for="${id}">${label}</label><div class="unit-inp"><input class="inp num" id="${id}" data-inst="${key}" type="number" min="0" step="${key === 'crew' ? 1 : 0.5}" value="${val != null && val !== '' ? val : ''}" placeholder="${ph}"><span>${unit}</span></div></div>`;
  return `<div class="card panel"><div><h2>Placement and site</h2><p class="muted" style="font-size:13px">Hours come from each product’s placement tab. Override any value for this offer; leave it empty to use the calculation.</p></div>
    <div class="grid3">${num('inst-crew', 'crew', 'Fitters on site', inst.crew, L.crew, 'pers.')}${num('inst-hours', 'hours', 'Total person-hours', inst.hours, sc.autoHours, 'h')}${num('inst-days', 'days', 'Days on site', inst.days, sc.autoDays, 'days')}</div>
    <p class="num" style="font-size:13px">${fmtH(sc.hours)} × ${eur(sc.rate)}/h = <b>${eur(sc.labour)}</b></p>
    <div class="optgrp"><p class="lbl">Site costs</p>${(S.pb.siteItems || []).map(it => {
      const v = inst.items && inst.items[it.id], row = sc.items.find(x => x.id === it.id);
      return `<div class="optrow ${row ? 'on' : ''}"><span>${esc(it.name)}<br><span class="pp num">${eur(it.price)}/${unitLbl(it.unit, 1)}${it.min ? ` · min. ${eur(it.min)}` : ''}${it.perDay ? ' · follows days on site' : ''}</span></span>
        <span class="row-actions"><input class="inp qty num" type="number" min="0" step="${it.unit === 'pc' ? 1 : 0.5}" data-institem="${it.id}" value="${v != null && v !== '' ? v : ''}" placeholder="${it.perDay ? sc.days : 0}" aria-label="${esc(it.name)} quantity"><span class="num" style="min-width:86px;text-align:right">${row ? eur(row.amount) : '—'}</span></span></div>`;
    }).join('')}</div></div>`;
}

function sideHtml() {
  const c = S.cfg, p = linePrice(c), t = CORE.typeById(c.type), sys = byId(S.pb.systems, c.system);
  const lineTot = p.unit * Math.max(1, +c.qty || 1) * (1 - (+c.discount || 0) / 100);
  const editing = S.editIdx >= 0;
  return `<div class="card preview"><div class="row-actions" style="justify-content:space-between"><div><p class="eyebrow num">${t.code}</p><h2>${esc(t.name)}</h2></div>${S.pb.sample ? '<span class="chip sample">Sample prices</span>' : ''}</div>
      <div class="canvas">${CORE.draw(S.pb, c)}</div>
      <dl class="spec"><dt>System</dt><dd>${esc(sys ? sys.name : '')}</dd><dt>Size</dt><dd class="num">${c.W} × ${c.H} mm · ${(c.W * c.H / 1e6).toFixed(2)} m²</dd>
      <dt>Uw (estimate)</dt><dd class="num">${p.uw != null ? String(p.uw).replace('.', ',') + ' W/m²K' : '—'}</dd>
      <dt>Placement</dt><dd class="num">${c.place !== false || c.breakout ? fmtH(p.hours) + ' per unit' : 'Supply only'}</dd></dl></div>
    <div class="card panel"><p class="eyebrow">Price per unit</p>
      ${p.errors.length ? p.errors.map(e => `<p class="err">${esc(e)}</p>`).join('') : `<div class="bd">${p.items.map(i => `<div class="r"><span>${esc(i.label)}${i.note ? ` <small>${esc(i.note)}</small>` : ''}</span><span class="num">${eur(i.amount)}</span></div>`).join('')}
        <div class="tot"><span>Unit price excl. VAT</span><span class="num">${eur(p.unit)}</span></div>
        ${(+c.qty > 1 || +c.discount) ? `<div class="r"><span>${c.qty} × ${c.discount ? `−${c.discount}% ` : ''}line total</span><b class="num">${eur(lineTot)}</b></div>` : ''}</div>`}
      <div class="row-actions side-actions"><button class="btn primary" data-act="save-line" ${p.errors.length ? 'disabled' : ''}>${editing ? 'Update line' : 'Add to offer'}</button>${editing ? '' : `<button class="btn" data-act="save-next" ${p.errors.length ? 'disabled' : ''} title="Add this line and start the next one with the same specification">Add + next</button>`}<button class="btn ghost" data-act="cancel-line">Cancel</button></div></div>`;
}
function mbarHtml() {
  const c = S.cfg, p = linePrice(c);
  return `<div class="p">${p.errors.length ? `<span class="err">Size outside grid</span>` : `<span class="muted" style="font-size:12px">Unit price excl. VAT</span><br><b class="num">${eur(p.unit)}</b>`}</div>
    <button class="btn ghost small" data-act="cancel-line">Cancel</button>${S.editIdx >= 0 ? '' : `<button class="btn small" data-act="save-next" ${p.errors.length ? 'disabled' : ''}>+ Next</button>`}<button class="btn primary" data-act="save-line" ${p.errors.length ? 'disabled' : ''}>${S.editIdx >= 0 ? 'Update' : 'Add'}</button>`;
}
function refreshSide() { const s = $('#side'); if (s) s.innerHTML = sideHtml(); const b = $('#mbar'); if (b) b.innerHTML = mbarHtml(); }

function setCfg(k, v) {
  const c = S.cfg, pb = S.pb;
  if (k === 'material') {
    if (c.material === v) return;
    const d = CORE.defaultConfig(pb, v);
    Object.assign(c, { material: v, system: d.system, colOut: d.colOut, colIn: d.colIn });
    const t = CORE.typeById(c.type); if (t.materials && !t.materials.includes(v)) setType('W-DK');
  } else if (['mirror', 'place', 'breakout'].includes(k)) c[k] = v === 'true' || v === true;
  else c[k] = v;
  if (k === 'colOut' && c.sameColour) { c.colIn = v; c.ralIn = c.ralOut; }
}
function setType(id) {
  const c = S.cfg; c.type = id;
  const g = S.grids[c.system] && S.grids[c.system][id];
  if (!g || c.W < g.w[0] || c.W > g.w[g.w.length - 1] || c.H < g.h[0] || c.H > g.h[g.h.length - 1]) { [c.W, c.H] = DEFAULT_SIZE[id]; }
  const t = CORE.typeById(id); if (t.top) c.topH = Math.round(c.H * t.top / 10) * 10;
  for (const oid of Object.keys(c.options)) { const o = byId(S.pb.options, oid); if (!o || !CORE.optionAllowed(o, t)) delete c.options[oid]; }
}

/* ---------- step 3: offer document ---------- */
function offerDoc(q, standalone) {
  const t = CORE.quoteTotals(q, S.pb), co = S.pb.company || {};
  const until = new Date(new Date(q.date || today()).getTime() + (+q.validityDays || 30) * 864e5);
  const c = q.client;
  const rows = q.lines.map((l, i) => `<tr><td style="padding:12px 8px;vertical-align:top;width:110px"><div style="width:100px">${l.cfg ? CORE.draw(S.pb, l.cfg).replace('class="drawing"', 'class="drawing" style="width:100%;height:auto"') : ''}</div></td>
      <td style="padding:12px 8px;vertical-align:top"><div style="font-size:11px;color:#5B6870;font-family:monospace">${String(i + 1).padStart(3, '0')} · ${esc(l.code)}${l.label ? ' · ' + esc(l.label) : ''}</div>
      <div style="font-weight:700">${esc(l.name)}${l.W ? ` — ${l.W} × ${l.H} mm` : ''}</div><div style="color:#4A5860;font-size:12.5px;margin-top:3px">${esc(l.desc.join(' · '))}</div></td>
      <td style="padding:12px 8px;vertical-align:top;text-align:right;white-space:nowrap">${l.qty}</td>
      <td style="padding:12px 8px;vertical-align:top;text-align:right;white-space:nowrap">${eur(l.unitPrice)}${l.discount ? `<br><span style="color:#5B6870;font-size:12px">−${l.discount}%</span>` : ''}</td>
      <td style="padding:12px 8px;vertical-align:top;text-align:right;white-space:nowrap;font-weight:700">${eur(l.unitPrice * l.qty * (1 - (l.discount || 0) / 100))}</td></tr>`).join('');
  const tr = (l, v, b) => `<tr><td style="padding:4px 8px;${b ? 'font-weight:800;font-size:16px;border-top:2px solid #16222A;padding-top:8px' : ''}">${l}</td><td style="padding:4px 8px;text-align:right;white-space:nowrap;${b ? 'font-weight:800;font-size:16px;border-top:2px solid #16222A;padding-top:8px' : ''}">${v}</td></tr>`;
  const inner = `<div style="display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;border-bottom:3px solid #16222A;padding-bottom:16px">
      <div><div style="font-size:26px;font-weight:800;letter-spacing:-.02em">${esc(co.name || 'Winsol')}</div><div style="color:#5B6870">${esc(co.line || '')}</div></div>
      <div style="text-align:right"><div style="font-size:22px;font-weight:800">Offer</div><div style="font-family:monospace">${esc(q.number)}</div><div style="color:#5B6870">${fmtDate(q.date)} · valid until ${fmtDate(until)}</div></div></div>
    <div style="display:flex;gap:32px;flex-wrap:wrap;margin:18px 0">
      <div style="min-width:220px"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5B6870">For</div><div style="font-weight:700">${esc(c.name)}</div>${c.company ? `<div>${esc(c.company)}</div>` : ''}<div>${esc(c.street)}</div><div>${esc([c.zip, c.city].filter(Boolean).join(' '))}</div>${c.vatNo ? `<div>VAT ${esc(c.vatNo)}</div>` : ''}${c.email ? `<div>${esc(c.email)}</div>` : ''}${c.phone ? `<div>${esc(c.phone)}</div>` : ''}</div>
      ${q.reference || q.site ? `<div style="min-width:220px"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5B6870">Project</div>${q.reference ? `<div style="font-weight:700">${esc(q.reference)}</div>` : ''}${q.site ? `<div>${esc(q.site)}</div>` : ''}</div>` : ''}</div>
    <div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:13px"><thead><tr style="border-bottom:1px solid #C9D2D7;text-align:left;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#5B6870"><th style="padding:6px 8px"></th><th style="padding:6px 8px">Description</th><th style="padding:6px 8px;text-align:right">Qty</th><th style="padding:6px 8px;text-align:right">Unit</th><th style="padding:6px 8px;text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table></div>
    <table style="margin-left:auto;margin-top:16px;border-collapse:collapse;min-width:280px;font-size:14px">
      ${tr('Products', eur(t.products))}${t.labour ? tr(`Placement · ${fmtH(t.sc.hours)} · ${String(t.sc.days).replace('.', ',')} day${t.sc.days === 1 ? '' : 's'} with ${t.sc.crew} fitters`, eur(t.labour)) : ''}${t.sc.items.map(i => tr(`${esc(i.name)} · ${String(i.qty).replace('.', ',')} ${unitLbl(i.unit, i.qty)}`, eur(i.amount))).join('')}${t.lineDisc ? tr('Line discounts', '−' + eur(t.lineDisc)) : ''}${t.qDisc ? tr(`Discount ${q.discount}%`, '−' + eur(t.qDisc)) : ''}
      ${tr('Total excl. VAT', eur(t.net))}${tr(`VAT ${q.vat}%`, eur(t.vat))}${tr('Total incl. VAT', eur(t.total), true)}</table>
    ${q.notes ? `<div style="margin-top:20px;white-space:pre-wrap"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#5B6870">Notes</div>${esc(q.notes)}</div>` : ''}
    <div style="display:flex;gap:24px;margin-top:36px;flex-wrap:wrap"><div style="flex:1;min-width:220px;border-top:1px solid #8C979D;padding-top:6px;color:#5B6870">Date and signature client, “read and approved”</div><div style="flex:1;min-width:220px;border-top:1px solid #8C979D;padding-top:6px;color:#5B6870">${esc(co.name || 'Winsol')}</div></div>
    ${S.pb.sample ? '<p style="margin-top:20px;color:#9A5800;font-size:12px">Indicative offer based on sample prices.</p>' : ''}`;
  if (!standalone) return inner;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(q.number)} – ${esc(c.name)}</title>
    <style>body{font-family:Arial,Helvetica,sans-serif;color:#16222A;margin:0;padding:32px;--glass:#CBE2EE;--draw-ink:#22313A}.wrap{max-width:900px;margin:0 auto}@media print{body{padding:0}}</style></head><body><div class="wrap">${inner}</div></body></html>`;
}

function viewOffer() {
  const q = S.q;
  return `<div class="doc-actions">
      <label class="lbl" for="status">Status</label><select class="inp" id="status" data-q="status" style="width:auto">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <button class="btn primary" data-act="dl-offer">Download offer (.html)</button>
      <button class="btn" data-act="dl-csv">Download lines (.csv)</button>
      <button class="btn ghost" data-act="step" data-view="lines">Edit products</button></div>
    <div class="card panel" style="max-width:900px;margin:0 auto 16px"><div class="field"><label for="notes">Notes on the offer</label><textarea class="inp" id="notes" data-q="notes" placeholder="Delivery time, payment terms, site conditions…">${esc(q.notes)}</textarea></div>
      <p class="muted" style="font-size:12.5px">Open the downloaded file in your browser to print it or save it as PDF.</p></div>
    <div class="doc" id="doc">${offerDoc(q)}</div>`;
}
function offerCsv(q) {
  const head = ['pos', 'label', 'code', 'product', 'system', 'width_mm', 'height_mm', 'qty', 'unit_price', 'discount_pct', 'line_total', 'specification'];
  const rows = q.lines.map((l, i) => [i + 1, l.label, l.code, l.name, (l.cfg ? (byId(S.pb.systems, l.cfg.system) || {}).name : 'Article'), l.W, l.H, l.qty, l.unitPrice.toFixed(2), l.discount || 0, (l.unitPrice * l.qty * (1 - (l.discount || 0) / 100)).toFixed(2), l.desc.join(' | ')]);
  const sc = CORE.siteCalc(q, S.pb);
  if (sc.labour) rows.push(['', 'placement', '', `Placement ${sc.hours} h, ${sc.days} days, ${sc.crew} fitters`, '', '', '', sc.hours, sc.rate.toFixed(2), 0, sc.labour.toFixed(2), '']);
  for (const i of sc.items) rows.push(['', 'site', i.id, i.name, '', '', '', i.qty, i.price.toFixed(2), 0, i.amount.toFixed(2), '']);
  return [head, ...rows].map(r => r.map(v => { v = String(v == null ? '' : v); return /[;"\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(';')).join('\n');
}
