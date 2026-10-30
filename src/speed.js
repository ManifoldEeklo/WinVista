/* ===== Speed tools: selection + bulk edit, quick entry, copies, material variants ===== */
S.sel = new Set(); S.bulk = null; S.quick = null;

function lineFromCfg(cfg, prev) {
  const p = linePrice(cfg), t = CORE.typeById(cfg.type);
  return { id: prev ? prev.id : uid(), cfg: clone(cfg), label: cfg.label || '', qty: Math.max(1, +cfg.qty || 1), discount: +cfg.discount || 0,
    unitPrice: p.errors.length ? 0 : p.unit, err: p.errors[0] || null, items: p.items, hours: p.hours, code: t.code, name: t.name, W: cfg.W, H: cfg.H,
    desc: CORE.describe(S.pb, cfg), pricedAt: new Date().toISOString() };
}
const relabel = (l, extra) => lineFromCfg({ ...l.cfg, label: l.label, qty: l.qty, discount: l.discount, ...(extra || {}) }, l);
const lineTotal = l => l.unitPrice * l.qty * (1 - (l.discount || 0) / 100);
const matOf = q => { const n = {}; for (const l of q.lines) if (l.cfg) n[l.cfg.material] = (n[l.cfg.material] || 0) + l.qty; const best = Object.entries(n).sort((a, b) => b[1] - a[1])[0]; return best ? best[0] : 'PVC'; };
const baseNumber = n => String(n).replace(/-(PVC|ALU|WOOD|V\d+)$/, '');
function variantsOf(q) {
  if (!q.group) return [q];
  const list = S.quotes.filter(x => x.group === q.group && x.id !== q.id).concat([q]);
  return list.sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));
}

/* ---------- quote header with variant switch ---------- */
function qHead() {
  const q = S.q, steps = [['client', 'Client'], ['lines', 'Products'], ['offer', 'Offer']];
  const cur = S.view === 'config' ? 'lines' : S.view;
  const vs = variantsOf(q);
  const sw = vs.length > 1 ? `<div class="variants" role="group" aria-label="Offer variants">${vs.map(v => `<button data-act="switch-variant" data-id="${esc(v.id)}" aria-pressed="${v.id === q.id}"><b>${esc(vLabel(v.variant || matOf(v)))}</b><span class="num">${eur(CORE.quoteTotals(v, S.pb).total)}</span></button>`).join('')}</div>` : '';
  return `<div class="qhead"><button class="btn ghost small" data-act="go" data-view="quotes">← Offers</button>
    <div class="qt"><span class="eyebrow num">${esc(q.number)}</span><b>${esc(q.client.name || 'New offer')}</b></div>
    ${sw}
    <ol class="stepper" aria-label="Offer steps">${steps.map(([k, l], i) => `<li><button data-act="step" data-view="${k}" ${cur === k ? 'aria-current="step"' : ''}><i>${i + 1}</i>${l}</button></li>`).join('')}</ol></div>`;
}

/* ---------- products step ---------- */
function viewLines() {
  const q = S.q, t = CORE.quoteTotals(q, S.pb);
  for (const id of [...S.sel]) if (!q.lines.find(l => l.id === id)) S.sel.delete(id);
  const nSel = S.sel.size, all = q.lines.length && nSel === q.lines.length;
  const lines = q.lines.map((l, i) => {
    const cur = linePrice(l.cfg), changed = !l.err && !cur.errors.length && Math.abs(cur.unit - l.unitPrice) > 0.01;
    const conf = S.confirm === 'line:' + l.id, on = S.sel.has(l.id);
    const co = byId(S.pb.colours, l.cfg.colOut);
    return `<div class="card line ${on ? 'picked' : ''}">
      <label class="pick" title="Select"><input type="checkbox" data-sel="${l.id}" ${on ? 'checked' : ''} aria-label="Select line ${i + 1}"></label>
      <div class="thumb" data-act="edit-line" data-id="${l.id}" role="button" tabindex="0" aria-label="Edit line ${i + 1}">${CORE.draw(S.pb, l.cfg, { noDims: true })}</div>
      <div style="min-width:0"><div class="pos num">${String(i + 1).padStart(3, '0')}${l.label ? ' · ' + esc(l.label) : ''} <span class="mat-tag">${l.cfg.material}</span>${co ? `<i class="dot" style="background:${esc(co.hex)}" title="${esc(co.name)}"></i>` : ''}</div>
        <div class="nm">${esc(l.name)} <span class="muted num" style="font-weight:500">${l.W} × ${l.H} mm</span></div>
        <div class="desc">${esc(l.desc.join(' · '))}</div>
        ${l.err ? `<div class="notice bad" style="margin-top:8px;padding:8px 10px;font-size:13px">Not priced: ${esc(l.err)} Edit the line to fix it.</div>` : ''}
        ${changed ? `<div class="notice" style="margin-top:8px;padding:8px 10px;font-size:13px">The price book changed: now ${eur(cur.unit)} per unit. <button class="btn small" data-act="reprice" data-id="${l.id}" style="margin-left:auto">Update price</button></div>` : ''}
        <div class="acts"><button class="btn small" data-act="edit-line" data-id="${l.id}">Edit</button><button class="btn small ghost" data-act="dup-line" data-id="${l.id}">Copy</button><button class="btn small ghost" data-act="dup-edit" data-id="${l.id}">Copy &amp; edit</button>
        ${conf ? `<button class="btn small danger" data-act="del-line" data-id="${l.id}">Confirm remove</button><button class="btn small ghost" data-act="cancel-confirm">Keep</button>` : `<button class="btn small ghost danger" data-act="ask-del-line" data-id="${l.id}">Remove</button>`}</div></div>
      <div class="pr"><div class="qtybox"><button class="btn small ghost" data-act="qty-step" data-id="${l.id}" data-d="-1" aria-label="One less">−</button><input class="inp num" type="number" min="1" data-lqty="${l.id}" value="${l.qty}" aria-label="Quantity line ${i + 1}"><button class="btn small ghost" data-act="qty-step" data-id="${l.id}" data-d="1" aria-label="One more">+</button></div>
        <span class="muted" style="font-size:12.5px">× ${eur(l.unitPrice)}${l.discount ? ` −${l.discount}%` : ''}</span><b class="num" id="lt-${l.id}">${eur(lineTotal(l))}</b></div></div>`;
  }).join('');
  const tools = q.lines.length ? `<div class="card seltools">
      <label class="check"><input type="checkbox" data-selall ${all ? 'checked' : ''}> ${nSel ? `<b>${nSel}</b>&nbsp;of ${q.lines.length} selected` : 'Select all'}</label>
      <div class="row-actions">${[['colour', 'Colour'], ['glass', 'Glass'], ['system', 'System'], ['material', 'PVC ⇄ ALU'], ['finish', 'Finish'], ['place', 'Placement']].map(([k, l]) => `<button class="btn small ${S.bulk === k ? 'on' : ''}" data-act="bulk-open" data-v="${k}" ${nSel ? '' : 'disabled'}>${l}</button>`).join('')}
        <button class="btn small ghost" data-act="bulk-copy" ${nSel ? '' : 'disabled'}>Copy</button>
        <button class="btn small ghost danger" data-act="${S.confirm === 'bulk-del' ? 'bulk-del' : 'ask-bulk-del'}" ${nSel ? '' : 'disabled'}>${S.confirm === 'bulk-del' ? `Confirm remove ${nSel}` : 'Remove'}</button></div></div>
      ${nSel && S.bulk ? bulkPanel() : ''}` : '';
  const vs = variantsOf(q), mine = q.variant || matOf(q), other = mine === 'PVC' ? 'ALU' : 'PVC', otherQ = vs.find(v => v.id !== q.id && (v.variant || matOf(v)) === other);
  return `<div class="two"><div class="lines">${tools}
      ${lines || `<div class="card empty"><h2>No products yet</h2><p class="muted">Add the first window or door for ${esc(q.client.name || 'this client')}, or enter several at once.</p></div>`}
      ${S.quick ? quickPanel() : `<div class="addrow"><button class="addbtn" data-act="add-line">+ Configure a window or door</button><button class="addbtn" data-act="quick-open">+ Quick entry: several at once</button></div>`}
      ${q.lines.length ? siteCard(q, t.sc) : ''}</div>
    <aside class="sticky" style="display:flex;flex-direction:column;gap:12px"><div class="card panel">${totalsBlock(q, t)}
      <button class="btn primary" data-act="step" data-view="offer" ${q.lines.length ? '' : 'disabled'}>Review offer →</button></div>
      ${q.lines.length ? `<div class="card panel"><p class="eyebrow">Material variant</p>
        ${otherQ ? `<p class="muted" style="font-size:13px">This offer also exists in ${other}: <b class="num">${eur(CORE.quoteTotals(otherQ, S.pb).total)}</b> (${(d => `${d >= 0 ? '+' : '−'}${eur(Math.abs(d))}`)(CORE.quoteTotals(otherQ, S.pb).total - t.total)} compared with this ${mine} offer).</p>
          <div class="row-actions"><button class="btn" data-act="switch-variant" data-id="${esc(otherQ.id)}">Switch to ${other}</button><button class="btn ghost small" data-act="make-variant" data-v="${other}">Rebuild ${other} from this</button></div>`
          : `<p class="muted" style="font-size:13px">Copy every line to ${other} in one click: same sizes, types and options, the matching ${other} system and the closest colour. Both versions stay linked so you can switch while talking to the client.</p>
          <button class="btn" data-act="make-variant" data-v="${other}">Make ${other} variant</button>`}</div>` : ''}</aside></div>`;
}

/* ---------- bulk panel: a click applies to every selected line ---------- */
function bulkPanel() {
  const q = S.q, sel = q.lines.filter(l => S.sel.has(l.id)), mats = [...new Set(sel.map(l => l.cfg.material))], pb = S.pb;
  const head = (title, hint) => `<div class="blk-h"><h3>${title}</h3><span class="muted">${hint || `Applies to ${sel.length} selected line${sel.length > 1 ? 's' : ''} at once`}</span></div>`;
  const cardsH = (k, list, sub, extra = '') => `<div class="seg">${list.map(x => `<button class="opt-card" data-act="bulk-set" data-k="${k}" data-v="${esc(x.id)}" ${extra}><b>${esc(x.name)}</b>${sub && sub(x) ? `<span class="num">${sub(x)}</span>` : ''}</button>`).join('')}</div>`;
  let body = '';
  if (S.bulk === 'colour') {
    body = mats.map(m => { const cols = pb.colours.filter(c => c.material === m); const sw = k => `<div class="swatches">${cols.map(x => `<button class="sw" data-act="bulk-set" data-k="${k}" data-v="${x.id}" data-m="${m}"><i style="background:${esc(x.hex)}"></i>${esc(x.name)}${x.pct ? ` <em>+${x.pct}%</em>` : ''}</button>`).join('')}</div>`;
      return `${mats.length > 1 ? `<p class="lbl">${m} lines</p>` : ''}<p class="lbl">Outside (inside follows when it is the same)</p>${sw('colOut')}<p class="lbl">Inside</p><div class="swatches"><button class="sw" data-act="bulk-set" data-k="sameColour" data-v="1" data-m="${m}">Same as outside</button></div>${sw('colIn')}`; }).join('');
  } else if (S.bulk === 'glass') body = cardsH('glazing', pb.glazing, x => x.perM2 ? `+${eur(x.perM2)}/m²` : 'Included');
  else if (S.bulk === 'system') body = mats.map(m => `${mats.length > 1 ? `<p class="lbl">${m} lines</p>` : ''}${cardsH('system', pb.systems.filter(s => s.material === m && s.enabled !== false), s => `${s.depth} mm · Uw ${String(s.uw).replace('.', ',')}`)}`).join('');
  else if (S.bulk === 'material') body = `<div class="seg">${['PVC', 'ALU'].map(m => `<button class="opt-card" data-act="bulk-set" data-k="material" data-v="${m}"><b>All selected to ${m}</b><span>Matching system and closest colour</span></button>`).join('')}</div>`;
  else if (S.bulk === 'finish') body = `<p class="lbl">Inside</p>${cardsH('finishIn', pb.finishIn, x => x.perM ? `${eur(x.perM)}/m` : '')}<p class="lbl">Outside</p>${cardsH('finishOut', pb.finishOut, x => x.perM ? `${eur(x.perM)}/m` : '')}`;
  else if (S.bulk === 'place') body = `<div class="seg"><button class="opt-card" data-act="bulk-set" data-k="place" data-v="true"><b>Supply and placement</b></button><button class="opt-card" data-act="bulk-set" data-k="place" data-v="false"><b>Supply only</b></button></div>
    <p class="lbl">Breakout of the old frame</p><div class="seg"><button class="opt-card" data-act="bulk-set" data-k="breakout" data-v="none"><b>No breakout</b></button>${pb.oldFrames.map(o => `<button class="opt-card" data-act="bulk-set" data-k="breakout" data-v="${o.id}"><b>Break out ${esc(o.name.toLowerCase())}</b></button>`).join('')}</div>`;
  const titles = { colour: 'Colour', glass: 'Glass', system: 'System', material: 'Material', finish: 'Finishing', place: 'Placement' };
  return `<div class="card bulk">${head(titles[S.bulk])}${body}<div class="row-actions" style="justify-content:flex-end"><button class="btn small ghost" data-act="bulk-close">Done</button></div></div>`;
}

async function applyToSelected(fn, what) {
  const q = S.q; let n = 0; const notes = [];
  q.lines = q.lines.map(l => {
    if (!S.sel.has(l.id) || !l.cfg) return l;
    const c = clone(l.cfg); const r = fn(c, notes); if (r === false) return l; n++;
    return lineFromCfg({ ...(r && r.cfg ? r.cfg : c), label: l.label, qty: l.qty, discount: l.discount }, l);
  });
  await Store.saveQuote(q); render();
  toast(n ? `${what} changed on ${n} line${n > 1 ? 's' : ''}.${notes.length ? ' ' + notes[0] : ''}` : 'Nothing to change for the selected lines.');
}

/* ---------- quick entry ---------- */
function quickBase() {
  const last = S.q.lines.filter(l => l.cfg).pop();
  const b = last ? clone(last.cfg) : CORE.defaultConfig(S.pb, S.prefs.material);
  Object.assign(b, { label: '', qty: 1, discount: 0, hours: null, mirror: false });
  return b;
}
function quickRowPrice(r) {
  const b = S.quick.base; if (!r.W || !r.H) return '';
  const p = linePrice({ ...b, type: r.type, W: +r.W, H: +r.H, topH: Math.round(+r.H * 0.25 / 10) * 10 });
  return p.errors.length ? `<span class="err" title="${esc(p.errors[0])}">Outside grid</span>` : `${eur(p.unit * (+r.qty || 1))}`;
}
function quickPanel() {
  const Q = S.quick, b = Q.base, pb = S.pb;
  const types = CORE.TYPES.filter(t => !t.materials || t.materials.includes(b.material));
  const sel = (k, list, lbl) => `<div class="field"><label for="qb-${k}">${lbl}</label><select class="inp" id="qb-${k}" data-qb="${k}">${list.map(x => `<option value="${x.id}" ${b[k] === x.id ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></div>`;
  const rows = Q.rows.map((r, i) => `<tr>
      <td><input class="inp" data-qk="label" data-qi="${i}" value="${esc(r.label)}" placeholder="Room" aria-label="Room row ${i + 1}"></td>
      <td><select class="inp" data-qk="type" data-qi="${i}" aria-label="Type row ${i + 1}">${types.map(t => `<option value="${t.id}" ${r.type === t.id ? 'selected' : ''}>${t.code} ${esc(t.name)}</option>`).join('')}</select></td>
      <td><input class="inp num" type="number" step="10" data-qk="W" data-qi="${i}" value="${r.W}" placeholder="mm" aria-label="Width row ${i + 1}"></td>
      <td><input class="inp num" type="number" step="10" data-qk="H" data-qi="${i}" value="${r.H}" placeholder="mm" aria-label="Height row ${i + 1}"></td>
      <td><input class="inp num" type="number" min="1" data-qk="qty" data-qi="${i}" value="${r.qty}" aria-label="Quantity row ${i + 1}"></td>
      <td class="num qp" id="qp-${i}">${quickRowPrice(r)}</td>
      <td><button class="btn small ghost" data-act="quick-del" data-i="${i}" aria-label="Remove row ${i + 1}">✕</button></td></tr>`).join('');
  const ready = Q.rows.filter(r => +r.W && +r.H).length;
  return `<div class="card panel quick"><div class="blk-h"><h2>Quick entry</h2><span class="muted">Type sizes row by row. Enter in the last row adds a new one.</span></div>
    <div class="grid3"><div class="field"><span class="lbl">Material</span><div class="seg" style="gap:6px">${['PVC', 'ALU'].map(m => `<button class="opt-card" style="padding:8px 10px" data-act="quick-mat" data-v="${m}" aria-pressed="${b.material === m}"><b>${m}</b></button>`).join('')}</div></div>
      ${sel('system', pb.systems.filter(s => s.material === b.material && s.enabled !== false), 'System')}${sel('colOut', pb.colours.filter(c => c.material === b.material), 'Colour (both sides)')}</div>
    <div class="grid3">${sel('glazing', pb.glazing, 'Glass')}${sel('finishIn', pb.finishIn, 'Inside finishing')}<div class="field"><label for="qb-place">Placement</label><select class="inp" id="qb-place" data-qb="place"><option value="true" ${b.place !== false ? 'selected' : ''}>Supply and placement</option><option value="false" ${b.place === false ? 'selected' : ''}>Supply only</option></select></div></div>
    <div class="scroll-x" style="border:0"><table class="qt"><thead><tr><th>Room</th><th>Type</th><th>Width</th><th>Height</th><th>Qty</th><th style="text-align:right">Price</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="row-actions" style="justify-content:space-between"><button class="btn small" data-act="quick-row">+ Row</button>
      <div class="row-actions"><button class="btn ghost" data-act="quick-close">Cancel</button><button class="btn primary" data-act="quick-add" ${ready ? '' : 'disabled'}>Add ${ready || ''} line${ready === 1 ? '' : 's'} to offer</button></div></div></div>`;
}
const newQuickRow = prev => ({ label: '', type: prev ? prev.type : 'W-DK', W: '', H: '', qty: 1 });

/* ---------- variants ---------- */
async function makeVariant(to) {
  const q = S.q; await Store.saveQuote(q);
  const group = q.group || q.id; q.group = group; q.variant = q.variant || matOf(q);
  if (!/-(PVC|ALU)$/.test(q.number)) q.number = `${q.number}-${q.variant}`;
  await Store.saveQuote(q);
  const existing = variantsOf(q).find(v => v.id !== q.id && (v.variant || matOf(v)) === to);
  const v = clone(q); const notes = [];
  Object.assign(v, { id: existing ? existing.id : uid(), number: `${baseNumber(q.number)}-${to}`, variant: to, status: 'draft', createdAt: existing ? existing.createdAt : new Date().toISOString() });
  v.lines = q.lines.map(l => { const r = CORE.convertCfg(S.pb, l.cfg, to); notes.push(...r.notes); return lineFromCfg({ ...r.cfg, label: l.label, qty: l.qty, discount: l.discount }); });
  await Store.saveQuote(v);
  S.q = clone(v); S.sel = new Set(); S.bulk = null; S.quick = null; render(); scrollTo(0, 0);
  const bad = v.lines.filter(l => l.err).length;
  toast(`${to} variant ready: ${v.lines.length} lines.${bad ? ` ${bad} need a size check.` : ''}${notes.length ? ' ' + notes[0] : ''}`);
}
function syncSiblings(q) {
  if (!q.group) return;
  for (const s of S.quotes.filter(x => x.group === q.group && x.id !== q.id)) {
    const same = JSON.stringify([s.client, s.reference, s.site, s.vat, s.date, s.validityDays]) === JSON.stringify([q.client, q.reference, q.site, q.vat, q.date, q.validityDays]);
    if (same) continue;
    Object.assign(s, { client: clone(q.client), reference: q.reference, site: q.site, vat: q.vat, date: q.date, validityDays: q.validityDays });
    Store.saveQuote(s);
  }
}

/* ---------- events for the speed tools ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act, q = S.q;
  switch (a) {
    case 'open-quote': case 'new-quote': case 'go': S.sel = new Set(); S.bulk = null; S.quick = null; break;
    case 'dup-edit': { const i = q.lines.findIndex(l => l.id === b.dataset.id); const c = clone(q.lines[i]); c.id = uid(); q.lines.splice(i + 1, 0, c); await Store.saveQuote(q);
      S.cfg = clone(c.cfg); Object.assign(S.cfg, { label: c.label, qty: c.qty, discount: c.discount }); S.editIdx = i + 1; S.cfgTab = 'dims'; S.view = 'config'; render(); scrollTo(0, 0); break; }
    case 'qty-step': { const l = q.lines.find(x => x.id === b.dataset.id); l.qty = Math.max(1, l.qty + +b.dataset.d); if (l.cfg) l.cfg.qty = l.qty; await Store.saveQuote(q); render(); break; }
    case 'bulk-open': S.bulk = S.bulk === b.dataset.v ? null : b.dataset.v; S.confirm = null; render(); break;
    case 'bulk-close': S.bulk = null; render(); break;
    case 'bulk-copy': { const out = []; let n = 0; for (const l of q.lines) { out.push(l); if (S.sel.has(l.id)) { const c = clone(l); c.id = uid(); out.push(c); n++; } } q.lines = out; await Store.saveQuote(q); render(); toast(`Copied ${n} line${n > 1 ? 's' : ''}.`); break; }
    case 'ask-bulk-del': S.confirm = 'bulk-del'; render(); break;
    case 'bulk-del': { const n = S.sel.size; q.lines = q.lines.filter(l => !S.sel.has(l.id)); S.sel = new Set(); S.confirm = null; S.bulk = null; await Store.saveQuote(q); render(); toast(`Removed ${n} line${n > 1 ? 's' : ''}.`); break; }
    case 'bulk-set': {
      const k = b.dataset.k, v = b.dataset.v, m = b.dataset.m;
      const names = { colOut: 'Colour', colIn: 'Inside colour', sameColour: 'Inside colour', glazing: 'Glass', system: 'System', material: 'Material', finishIn: 'Inside finishing', finishOut: 'Outside finishing', place: 'Placement', breakout: 'Breakout' };
      await applyToSelected((c, notes) => {
        if (m && c.material !== m) return false;
        if (k === 'colOut') { c.colOut = v; if (CORE.kindOf(byId(S.pb.colours, v)) === 'lacq') c.ralOut = bulkRal(); if (c.sameColour) { c.colIn = v; c.ralIn = c.ralOut; } }
        else if (k === 'colIn') { c.colIn = v; if (CORE.kindOf(byId(S.pb.colours, v)) === 'lacq') c.ralIn = bulkRal(); c.sameColour = v === c.colOut && c.ralIn === c.ralOut; }
        else if (k === 'sameColour') { c.sameColour = true; c.colIn = c.colOut; }
        else if (k === 'system') { const s = byId(S.pb.systems, v); if (!s || s.material !== c.material) return false; c.system = v; }
        else if (k === 'material') { if (c.material === v) return false; const r = CORE.convertCfg(S.pb, c, v); notes.push(...r.notes); return r; }
        else if (k === 'place') c.place = v === 'true';
        else if (k === 'breakout') { if (v === 'none') c.breakout = false; else { c.breakout = true; c.oldFrame = v; } }
        else c[k] = v;
      }, names[k] || 'Setting');
      break;
    }
    case 'quick-open': S.quick = { base: quickBase(), rows: [newQuickRow(), newQuickRow(), newQuickRow()] }; render(); setTimeout(() => { const f = document.querySelector('[data-qk="label"][data-qi="0"]'); if (f) f.focus(); }, 20); break;
    case 'quick-close': S.quick = null; render(); break;
    case 'quick-row': S.quick.rows.push(newQuickRow(S.quick.rows[S.quick.rows.length - 1])); render(); { const i = S.quick.rows.length - 1; const f = document.querySelector(`[data-qk="label"][data-qi="${i}"]`); if (f) f.focus(); } break;
    case 'quick-del': S.quick.rows.splice(+b.dataset.i, 1); if (!S.quick.rows.length) S.quick.rows.push(newQuickRow()); render(); break;
    case 'quick-mat': { const d = CORE.defaultConfig(S.pb, b.dataset.v); const r = CORE.convertCfg(S.pb, S.quick.base, b.dataset.v); S.quick.base = { ...r.cfg, system: r.cfg.system || d.system }; for (const row of S.quick.rows) { const t = CORE.typeById(row.type); if (t.materials && !t.materials.includes(b.dataset.v)) row.type = 'S-HS'; } render(); break; }
    case 'quick-add': {
      const rows = S.quick.rows.filter(r => +r.W && +r.H); let bad = 0;
      for (const r of rows) { const t = CORE.typeById(r.type); const cfg = { ...clone(S.quick.base), type: r.type, W: +r.W, H: +r.H, label: r.label, qty: Math.max(1, +r.qty || 1), topH: t.top ? Math.round(+r.H * t.top / 10) * 10 : S.quick.base.topH };
        const l = lineFromCfg(cfg); if (l.err) bad++; q.lines.push(l); }
      S.quick = null; await Store.saveQuote(q); render(); toast(`Added ${rows.length} line${rows.length > 1 ? 's' : ''}.${bad ? ` ${bad} outside the price grid — edit them.` : ''}`); break;
    }
    case 'make-variant': await makeVariant(b.dataset.v); break;
    case 'switch-variant': { if (b.dataset.id === q.id) break; await Store.saveQuote(q); const f = S.quotes.find(x => x.id === b.dataset.id); if (!f) break; S.q = clone(f); S.sel = new Set(); S.bulk = null; S.quick = null; if (S.view === 'config') S.view = 'lines'; render(); toast(`Showing ${f.variant || matOf(f)} variant.`); break; }
    case 'save-next': {
      const line = lineFromCfg(S.cfg); q.lines.push(line); await Store.saveQuote(q);
      Object.assign(S.cfg, { label: '', qty: 1, discount: 0, hours: null }); S.editIdx = -1; S.cfgTab = 'dims'; render(); scrollTo(0, 0);
      setTimeout(() => { const f = document.getElementById('cfg-W'); if (f) { f.focus(); f.select(); } }, 20);
      toast(`Line ${q.lines.length} added. Enter the next size.`); break;
    }
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.closest && e.target.closest('[data-act="edit-line"].thumb')) { e.target.click(); return; }
  const t = e.target; if (e.key !== 'Enter' || !t.dataset || t.dataset.qi == null || !S.quick) return;
  e.preventDefault();
  const i = +t.dataset.qi;
  if (i === S.quick.rows.length - 1) { S.quick.rows.push(newQuickRow(S.quick.rows[i])); render(); }
  const f = document.querySelector(`[data-qk="label"][data-qi="${i + 1}"]`); if (f) f.focus();
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.dataset.qk && S.quick) { const r = S.quick.rows[+t.dataset.qi]; r[t.dataset.qk] = t.value; const c = document.getElementById('qp-' + t.dataset.qi); if (c) c.innerHTML = quickRowPrice(r);
    const ready = S.quick.rows.filter(x => +x.W && +x.H).length, btn = document.querySelector('[data-act="quick-add"]'); if (btn) { btn.disabled = !ready; btn.textContent = `Add ${ready || ''} line${ready === 1 ? '' : 's'} to offer`; } return; }
  if (t.dataset.lqty) { const l = S.q.lines.find(x => x.id === t.dataset.lqty); l.qty = Math.max(l.unit === 'm2' ? 0.5 : 1, +t.value || 1); if (l.cfg) l.cfg.qty = l.qty; const c = document.getElementById('lt-' + l.id); if (c) c.textContent = eur(lineTotal(l)); saveQuoteSoon(); return; }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.dataset.sel) { t.checked ? S.sel.add(t.dataset.sel) : S.sel.delete(t.dataset.sel); S.confirm = null; render(); return; }
  if (t.hasAttribute && t.hasAttribute('data-selall')) { S.sel = t.checked ? new Set(S.q.lines.map(l => l.id)) : new Set(); if (!t.checked) S.bulk = null; render(); return; }
  if (t.dataset.lqty) { render(); return; }
  if (t.dataset.qb && S.quick) { const k = t.dataset.qb; if (k === 'place') S.quick.base.place = t.value === 'true'; else { S.quick.base[k] = t.value; if (k === 'colOut') { S.quick.base.colIn = t.value; S.quick.base.sameColour = true; } } render(); return; }
  if (t.dataset.qk === 'type' && S.quick) { const c = document.getElementById('qp-' + t.dataset.qi); if (c) c.innerHTML = quickRowPrice(S.quick.rows[+t.dataset.qi]); }
});
