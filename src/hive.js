/* ===== Pro features: wood, technical checks, BOM, articles, scenarios, compare, list reading ===== */
S.open = new Set(); S.art = false; S.aiBusy = false;
const KIND_NAME = { std: 'Standard', foil: 'Foil', lacq: 'Lacquer (RAL)' };
const RAL_QUICK = ['9016', '9010', '1015', '7035', '7039', '7016', '7021', '9005', '9006', '8017', '6009', '3004'];
const bulkRal = () => { const e = document.getElementById('bulk-ral'); const v = e && e.value.trim(); return v || '9016'; };
function colourSide(key, ralKey) {
  const c = S.cfg, cols = S.pb.colours.filter(x => x.material === c.material);
  const cur = byId(S.pb.colours, c[key]) || cols[0], kind = CORE.kindOf(cur);
  const kinds = ['std', 'foil', 'lacq'].filter(k => cols.some(x => CORE.kindOf(x) === k));
  const seg = `<div class="kinds" role="group">${kinds.map(k => `<button class="btn small ${kind === k ? 'on' : ''}" data-act="col-kind" data-k="${key}" data-v="${k}" aria-pressed="${kind === k}">${KIND_NAME[k]}</button>`).join('')}</div>`;
  if (kind === 'lacq') {
    const r = String(c[ralKey] || '');
    return seg + `<div class="ralrow"><div class="field" style="max-width:180px"><label for="ral-${key}">RAL code</label><input class="inp num" id="ral-${key}" data-ral="${ralKey}" value="${esc(r)}" maxlength="4" inputmode="numeric" placeholder="7016"></div>
      <div class="swatches">${RAL_QUICK.map(x => `<button class="sw" data-act="col-ral" data-k="${ralKey}" data-v="${x}" aria-pressed="${r === x}"><i style="background:${CORE.RAL[x]}"></i>RAL ${x}</button>`).join('')}</div></div>
      <p class="muted" style="font-size:12.5px">Any RAL code is possible. The lacquer surcharge comes from the price book.</p>`;
  }
  const list = cols.filter(x => CORE.kindOf(x) === kind);
  return seg + `<div class="swatches" role="group">${list.map(x => `<button class="sw" data-act="cfg-set" data-k="${key}" data-v="${x.id}" aria-pressed="${c[key] === x.id}"><i style="background:${esc(x.hex)}"></i>${esc(x.name)}${x.pct ? ` <em>+${x.pct}%</em>` : ''}</button>`).join('')}</div>`;
}
const MAT_DESC = { PVC: 'Best insulation per euro, foil colours', ALU: 'Slim profiles, large sizes, any RAL colour', WOOD: 'Warm look, meranti or oak, stains' };
const vLabel = v => CORE.MAT_NAME[v] || v;
const isArt = l => l.kind === 'article';
const lineChecks = cfg => CORE.checks(S.pb, cfg);
const hasErr = list => list.some(x => x.level === 'err');
const chkHtml = list => `<ul class="chk">${list.map(x => `<li class="${x.level}"><span class="ic" aria-hidden="true">${x.level === 'ok' ? '✓' : x.level === 'warn' ? '!' : '✕'}</span><span>${esc(x.text)}</span></li>`).join('')}</ul>`;

function sideHtml() {
  const c = S.cfg, p = linePrice(c), t = CORE.typeById(c.type), sys = byId(S.pb.systems, c.system);
  const ck = p.errors.length ? [] : lineChecks(c), blocked = p.errors.length || hasErr(ck);
  const lineTot = p.unit * Math.max(1, +c.qty || 1) * (1 - (+c.discount || 0) / 100);
  const editing = S.editIdx >= 0;
  return `<div class="card preview"><div class="row-actions" style="justify-content:space-between"><div><p class="eyebrow num">${t.code} · ${vLabel(c.material)}</p><h2>${esc(t.name)}</h2></div>${S.pb.sample ? '<span class="chip sample">Sample prices</span>' : ''}</div>
      <div class="canvas">${CORE.draw(S.pb, c)}</div>
      <dl class="spec"><dt>System</dt><dd>${esc(sys ? sys.name : '')}</dd><dt>Size</dt><dd class="num">${c.W} × ${c.H} mm · ${(c.W * c.H / 1e6).toFixed(2)} m²</dd>
      <dt>Uw (estimate)</dt><dd class="num">${p.uw != null ? String(p.uw).replace('.', ',') + ' W/m²K' : '—'}</dd>
      <dt>Placement</dt><dd class="num">${c.place !== false || c.breakout ? fmtH(p.hours) + ' per unit' : 'Supply only'}</dd></dl></div>
    ${ck.length ? `<div class="card panel"><p class="eyebrow">Technical checks</p>${chkHtml(ck)}</div>` : ''}
    <div class="card panel"><p class="eyebrow">Price per unit</p>
      ${p.errors.length ? p.errors.map(e => `<p class="err">${esc(e)}</p>`).join('') : `<div class="bd">${p.items.map(i => `<div class="r"><span>${esc(i.label)}${i.note ? ` <small>${esc(i.note)}</small>` : ''}</span><span class="num">${eur(i.amount)}</span></div>`).join('')}
        <div class="tot"><span>Unit price excl. VAT</span><span class="num">${eur(p.unit)}</span></div>
        ${(+c.qty > 1 || +c.discount) ? `<div class="r"><span>${c.qty} × ${c.discount ? `−${c.discount}% ` : ''}line total</span><b class="num">${eur(lineTot)}</b></div>` : ''}</div>`}
      ${hasErr(ck) ? '<p class="err" style="font-size:13px">Fix the technical check above before adding.</p>' : ''}
      <div class="row-actions side-actions"><button class="btn primary" data-act="save-line" ${blocked ? 'disabled' : ''}>${editing ? 'Update line' : 'Add to offer'}</button>${editing ? '' : `<button class="btn" data-act="save-next" ${blocked ? 'disabled' : ''} title="Add this line and start the next one with the same specification">Add + next</button>`}<button class="btn ghost" data-act="cancel-line">Cancel</button></div></div>`;
}
function mbarHtml() {
  const c = S.cfg, p = linePrice(c), ck = p.errors.length ? [] : lineChecks(c), blocked = p.errors.length || hasErr(ck);
  return `<div class="p">${p.errors.length ? `<span class="err">Size outside grid</span>` : hasErr(ck) ? `<span class="err">Check failed</span><br><b class="num">${eur(p.unit)}</b>` : `<span class="muted" style="font-size:12px">Unit price excl. VAT</span><br><b class="num">${eur(p.unit)}</b>`}</div>
    <button class="btn ghost small" data-act="cancel-line">Cancel</button>${S.editIdx >= 0 ? '' : `<button class="btn small" data-act="save-next" ${blocked ? 'disabled' : ''}>+ Next</button>`}<button class="btn primary" data-act="save-line" ${blocked ? 'disabled' : ''}>${S.editIdx >= 0 ? 'Update' : 'Add'}</button>`;
}

/* ---------- products step ---------- */
function bomTable(rows) {
  return `<div class="scroll-x" style="border:0"><table class="lt bom"><thead><tr><th>Group</th><th>Item</th><th style="text-align:right">Qty</th><th>Unit</th></tr></thead><tbody>${rows.map(r => `<tr><td class="muted">${esc(r.group)}</td><td>${esc(r.item)}</td><td class="num" style="text-align:right">${String(r.qty).replace('.', ',')}</td><td>${esc(r.unit)}</td></tr>`).join('')}</tbody></table></div>`;
}
function lineCard(l, i) {
  const conf = S.confirm === 'line:' + l.id, on = S.sel.has(l.id), open = S.open.has(l.id);
  const qtyBox = `<div class="qtybox"><button class="btn small ghost" data-act="qty-step" data-id="${l.id}" data-d="-1" aria-label="One less">−</button><input class="inp num" type="number" min="1" data-lqty="${l.id}" value="${l.qty}" aria-label="Quantity line ${i + 1}"><button class="btn small ghost" data-act="qty-step" data-id="${l.id}" data-d="1" aria-label="One more">+</button></div>`;
  const del = conf ? `<button class="btn small danger" data-act="del-line" data-id="${l.id}">Confirm remove</button><button class="btn small ghost" data-act="cancel-confirm">Keep</button>` : `<button class="btn small ghost danger" data-act="ask-del-line" data-id="${l.id}">Remove</button>`;
  const price = `<div class="pr">${qtyBox}<span class="muted" style="font-size:12.5px">× ${eur(l.unitPrice)}${l.unit === 'm2' ? '/m²' : ''}${l.discount ? ` −${l.discount}%` : ''}</span><b class="num" id="lt-${l.id}">${eur(lineTotal(l))}</b></div>`;
  const pick = `<label class="pick" title="Select"><input type="checkbox" data-sel="${l.id}" ${on ? 'checked' : ''} aria-label="Select line ${i + 1}"></label>`;
  if (isArt(l)) {
    return `<div class="card line ${on ? 'picked' : ''}">${pick}<div class="thumb art" aria-hidden="true">${esc((l.desc[0] || 'Article').split(' ')[0])}</div>
      <div style="min-width:0"><div class="pos num">${String(i + 1).padStart(3, '0')} <span class="mat-tag">Article</span></div><div class="nm">${esc(l.name)}</div><div class="desc">${esc(l.desc.join(' · '))}</div>
      <div class="acts"><button class="btn small ghost" data-act="dup-line" data-id="${l.id}">Copy</button>${del}</div></div>${price}</div>`;
  }
  const cur = linePrice(l.cfg), changed = !l.err && !cur.errors.length && Math.abs(cur.unit - l.unitPrice) > 0.01;
  const ck = cur.errors.length ? [] : lineChecks(l.cfg), nErr = ck.filter(x => x.level === 'err').length, nWarn = ck.filter(x => x.level === 'warn').length;
  const co = byId(S.pb.colours, l.cfg.colOut) ? { hex: CORE.colHex(S.pb, l.cfg, 'out'), name: CORE.colName(S.pb, l.cfg, 'out') } : null;
  return `<div class="card line ${on ? 'picked' : ''}">${pick}
    <div class="thumb" data-act="edit-line" data-id="${l.id}" role="button" tabindex="0" aria-label="Edit line ${i + 1}">${CORE.draw(S.pb, l.cfg, { noDims: true })}</div>
    <div style="min-width:0"><div class="pos num">${String(i + 1).padStart(3, '0')}${l.label ? ' · ' + esc(l.label) : ''} <span class="mat-tag">${vLabel(l.cfg.material)}</span>${co ? `<i class="dot" style="background:${esc(co.hex)}" title="${esc(co.name)}"></i>` : ''}${nErr ? ` <span class="chk-pill err">${nErr} check failed</span>` : nWarn ? ` <span class="chk-pill warn">${nWarn} warning${nWarn > 1 ? 's' : ''}</span>` : ''}</div>
      <div class="nm">${esc(l.name)} <span class="muted num" style="font-weight:500">${l.W} × ${l.H} mm</span></div>
      <div class="desc">${esc(l.desc.join(' · '))}</div>
      ${l.err ? `<div class="notice bad" style="margin-top:8px;padding:8px 10px;font-size:13px">Not priced: ${esc(l.err)} Edit the line to fix it.</div>` : ''}
      ${changed ? `<div class="notice" style="margin-top:8px;padding:8px 10px;font-size:13px">The price book changed: now ${eur(cur.unit)} per unit. <button class="btn small" data-act="reprice" data-id="${l.id}" style="margin-left:auto">Update price</button></div>` : ''}
      <div class="acts"><button class="btn small" data-act="edit-line" data-id="${l.id}">Edit</button><button class="btn small ghost" data-act="dup-line" data-id="${l.id}">Copy</button><button class="btn small ghost" data-act="dup-edit" data-id="${l.id}">Copy &amp; edit</button><button class="btn small ghost" data-act="line-details" data-id="${l.id}" aria-expanded="${open}">${open ? 'Hide details' : 'Details'}</button>${del}</div>
      ${open ? `<div class="details">${ck.length ? chkHtml(ck) : ''}<p class="lbl" style="margin-top:8px">Bill of materials per unit (approximate)</p>${bomTable(CORE.bom(S.pb, l.cfg))}</div>` : ''}</div>
    ${price}</div>`;
}

function articlesPanel() {
  const cats = [...new Set(S.pb.articles.map(a => a.cat))];
  return `<div class="card panel quick"><div class="blk-h"><h2>Add articles</h2><span class="muted">Loose items sold with the offer</span></div>
    ${cats.map(c => `<div class="optgrp"><p class="lbl">${esc(c)}</p>${S.pb.articles.filter(a => a.cat === c).map(a => `<div class="optrow"><span>${esc(a.name)}<br><span class="pp num">${eur(a.price)}/${a.unit === 'm2' ? 'm²' : 'pc'}</span></span>
      <span class="row-actions"><input class="inp qty num" type="number" min="1" step="${a.unit === 'm2' ? 0.5 : 1}" id="artq-${a.id}" value="1" aria-label="${esc(a.name)} quantity"><button class="btn small" data-act="article-add" data-id="${a.id}">Add</button></span></div>`).join('')}</div>`).join('')}
    <div class="row-actions" style="justify-content:flex-end"><button class="btn ghost" data-act="art-close">Done</button></div></div>`;
}

function variantPanel(q, t) {
  const vs = variantsOf(q), mine = q.variant || matOf(q);
  const have = new Set(vs.map(v => v.variant || matOf(v)));
  const rows = vs.length > 1 ? `<div class="vlist">${vs.map(v => { const tt = CORE.quoteTotals(v, S.pb).total, d = tt - t.total;
    return `<div class="vrow ${v.id === q.id ? 'on' : ''}"><b>${esc(vLabel(v.variant || matOf(v)))}</b><span class="num">${eur(tt)}</span><span class="num muted" style="font-size:12px">${v.id === q.id ? 'this one' : `${d >= 0 ? '+' : '−'}${eur(Math.abs(d))}`}</span>${v.id === q.id ? '' : `<button class="btn small" data-act="switch-variant" data-id="${esc(v.id)}">Open</button>`}</div>`; }).join('')}</div>` : '';
  const mats = CORE.MATS.filter(m => !have.has(m) && m !== mine);
  return `<div class="card panel"><p class="eyebrow">Variants</p>${rows}
    <p class="muted" style="font-size:13px">Make the same offer in another material, or a copy to try other glass, colours or options. Variants stay linked, so you can switch and compare with the client.</p>
    <div class="row-actions">${mats.map(m => `<button class="btn small" data-act="make-variant" data-v="${m}">In ${vLabel(m)}</button>`).join('')}</div>
    <div class="row-actions"><input class="inp" id="variant-name" placeholder="e.g. Triple glass" style="flex:1;min-width:120px" aria-label="Name of the copy"><button class="btn small" data-act="variant-copy">Copy as variant</button></div></div>`;
}

function viewLines() {
  const q = S.q, t = CORE.quoteTotals(q, S.pb);
  for (const id of [...S.sel]) if (!q.lines.find(l => l.id === id)) S.sel.delete(id);
  const nSel = S.sel.size, all = q.lines.length && nSel === q.lines.length;
  const lines = q.lines.map(lineCard).join('');
  const tools = q.lines.length ? `<div class="card seltools">
      <label class="check"><input type="checkbox" data-selall ${all ? 'checked' : ''}> ${nSel ? `<b>${nSel}</b>&nbsp;of ${q.lines.length} selected` : 'Select all'}</label>
      <div class="row-actions">${[['colour', 'Colour'], ['glass', 'Glass'], ['hardware', 'Hardware'], ['system', 'System'], ['material', 'Material'], ['finish', 'Finish'], ['place', 'Placement']].map(([k, l]) => `<button class="btn small ${S.bulk === k ? 'on' : ''}" data-act="bulk-open" data-v="${k}" ${nSel ? '' : 'disabled'}>${l}</button>`).join('')}
        <button class="btn small ghost" data-act="bulk-copy" ${nSel ? '' : 'disabled'}>Copy</button>
        <button class="btn small ghost danger" data-act="${S.confirm === 'bulk-del' ? 'bulk-del' : 'ask-bulk-del'}" ${nSel ? '' : 'disabled'}>${S.confirm === 'bulk-del' ? `Confirm remove ${nSel}` : 'Remove'}</button></div></div>
      ${nSel && S.bulk ? bulkPanel() : ''}` : '';
  const adders = S.quick ? quickPanel() : S.art ? articlesPanel() : `<div class="addrow three"><button class="addbtn" data-act="add-line">+ Configure a window or door</button><button class="addbtn" data-act="quick-open">+ Several at once, or paste a list</button><button class="addbtn" data-act="art-open">+ Articles: sun protection, accessories</button></div>`;
  const nErr = q.lines.filter(l => !isArt(l) && hasErr(lineChecks(l.cfg))).length;
  return `<div class="two"><div class="lines">${tools}
      ${nErr ? `<div class="notice bad">${nErr} line${nErr > 1 ? 's fail' : ' fails'} a technical check. Open the line to fix it before the offer goes out.</div>` : ''}
      ${lines || `<div class="card empty"><h2>No products yet</h2><p class="muted">Add the first window or door for ${esc(q.client.name || 'this client')}, enter several at once, or paste a measurement list.</p></div>`}
      ${adders}
      ${q.lines.length ? siteCard(q, t.sc) : ''}</div>
    <aside class="sticky" style="display:flex;flex-direction:column;gap:12px"><div class="card panel">${totalsBlock(q, t)}
      <button class="btn primary" data-act="step" data-view="offer" ${q.lines.length ? '' : 'disabled'}>Review offer →</button></div>
      ${q.lines.length ? variantPanel(q, t) : ''}</aside></div>`;
}

function bulkPanel() {
  const q = S.q, sel = q.lines.filter(l => S.sel.has(l.id) && l.cfg), mats = [...new Set(sel.map(l => l.cfg.material))], pb = S.pb;
  if (!sel.length) return `<div class="card bulk"><p class="muted">The selection holds only articles. Copy or remove them with the buttons above.</p></div>`;
  const head = title => `<div class="blk-h"><h3>${title}</h3><span class="muted">Applies to ${sel.length} selected line${sel.length > 1 ? 's' : ''} at once</span></div>`;
  const cardsH = (k, list, sub) => `<div class="seg">${list.map(x => `<button class="opt-card" data-act="bulk-set" data-k="${k}" data-v="${esc(x.id)}"><b>${esc(x.name)}</b>${sub && sub(x) ? `<span class="num">${sub(x)}</span>` : ''}</button>`).join('')}</div>`;
  let body = '';
  if (S.bulk === 'colour') body = `<div class="field" style="max-width:200px"><label for="bulk-ral">RAL code for lacquer</label><input class="inp num" id="bulk-ral" value="7016" maxlength="4" inputmode="numeric"></div>` + mats.map(m => { const cols = pb.colours.filter(c => c.material === m);
    const sw = k => ['std', 'foil', 'lacq'].map(kd => { const l = cols.filter(x => CORE.kindOf(x) === kd); return l.length ? `<p class="lbl" style="font-weight:500">${KIND_NAME[kd]}</p><div class="swatches">${l.map(x => `<button class="sw" data-act="bulk-set" data-k="${k}" data-v="${x.id}" data-m="${m}"><i style="background:${esc(x.hex)}"></i>${esc(x.name)}${x.pct ? ` <em>+${x.pct}%</em>` : ''}</button>`).join('')}</div>` : ''; }).join('');
    return `${mats.length > 1 ? `<p class="lbl">${vLabel(m)} lines</p>` : ''}<h3 style="font-size:14px">Outside</h3><p class="muted" style="font-size:12.5px">Inside follows when it is the same.</p>${sw('colOut')}<h3 style="font-size:14px;margin-top:6px">Inside</h3><div class="swatches"><button class="sw" data-act="bulk-set" data-k="sameColour" data-v="1" data-m="${m}">Same as outside</button></div>${sw('colIn')}`; }).join('');
  else if (S.bulk === 'glass') body = cardsH('glazing', pb.glazing, x => x.perM2 ? `+${eur(x.perM2)}/m²` : 'Included');
  else if (S.bulk === 'hardware') body = `<p class="lbl">Handles</p>${cardsH('handle', pb.handles, x => x.perSash ? `+${eur(x.perSash)}/sash` : 'Included')}<p class="lbl">Security</p>${cardsH('security', pb.security, x => x.perSash ? `+${eur(x.perSash)}/sash` : 'Included')}<p class="lbl">Hinges</p>${cardsH('hinges', pb.hinges, x => x.perSash ? `+${eur(x.perSash)}/sash` : 'Included')}`;
  else if (S.bulk === 'system') body = mats.map(m => `${mats.length > 1 ? `<p class="lbl">${vLabel(m)} lines</p>` : ''}${cardsH('system', pb.systems.filter(s => s.material === m && s.enabled !== false), s => `${s.depth} mm · Uw ${String(s.uw).replace('.', ',')}`)}`).join('');
  else if (S.bulk === 'material') body = `<div class="seg">${CORE.MATS.map(m => `<button class="opt-card" data-act="bulk-set" data-k="material" data-v="${m}"><b>All to ${vLabel(m)}</b><span>Matching system, closest colour</span></button>`).join('')}</div>`;
  else if (S.bulk === 'finish') body = `<p class="lbl">Inside</p>${cardsH('finishIn', pb.finishIn, x => x.perM ? `${eur(x.perM)}/m` : '')}<p class="lbl">Outside</p>${cardsH('finishOut', pb.finishOut, x => x.perM ? `${eur(x.perM)}/m` : '')}`;
  else if (S.bulk === 'place') body = `<div class="seg"><button class="opt-card" data-act="bulk-set" data-k="place" data-v="true"><b>Supply and placement</b></button><button class="opt-card" data-act="bulk-set" data-k="place" data-v="false"><b>Supply only</b></button></div>
    <p class="lbl">Breakout of the old frame</p><div class="seg"><button class="opt-card" data-act="bulk-set" data-k="breakout" data-v="none"><b>No breakout</b></button>${pb.oldFrames.map(o => `<button class="opt-card" data-act="bulk-set" data-k="breakout" data-v="${o.id}"><b>Break out ${esc(o.name.toLowerCase())}</b></button>`).join('')}</div>`;
  const titles = { colour: 'Colour', glass: 'Glass', hardware: 'Hardware', system: 'System', material: 'Material', finish: 'Finishing', place: 'Placement' };
  return `<div class="card bulk">${head(titles[S.bulk])}${body}<div class="row-actions" style="justify-content:flex-end"><button class="btn small ghost" data-act="bulk-close">Done</button></div></div>`;
}

/* ---------- quick entry with list reading ---------- */
function parseList(text) {
  const rows = [];
  for (const raw of String(text).split(/\n|;/)) {
    const line = raw.trim(); if (!line) continue;
    const m = line.match(/(\d{2,4}(?:[.,]\d+)?)\s*(?:mm|cm)?\s*[x×*\/]\s*(\d{2,4}(?:[.,]\d+)?)\s*(mm|cm)?/i); if (!m) continue;
    let W = parseFloat(m[1].replace(',', '.')), H = parseFloat(m[2].replace(',', '.'));
    if (/cm/i.test(line) || (W < 400 && H < 400)) { W *= 10; H *= 10; }
    const rest = (line.slice(0, m.index) + ' ' + line.slice(m.index + m[0].length)).trim();
    const qm = rest.match(/(\d+)\s*(x|st|stuks|pcs|pc|stk)\b/i) || rest.match(/\b(?:qty|aantal|x)\s*(\d+)/i);
    const lw = line.toLowerCase(); let type = 'W-DK';
    if (/schuif|slide|hst|hef/.test(lw)) type = 'S-HS'; else if (/voordeur|inkom|front ?door|entrance/.test(lw)) type = 'D-ENT';
    else if (/terras|terrace|balcon|deur|door/.test(lw)) type = 'D-TER'; else if (/vast|fixed/.test(lw)) type = 'W-F';
    else if (/\bkip\b|tilt only|bottom/.test(lw)) type = 'W-K'; else if (/dubbel|double|2 ?vl/.test(lw)) type = 'W-2S'; else if (/3 ?del|three/.test(lw)) type = 'W-3P';
    const label = rest.replace(qm ? qm[0] : '', '').replace(/\b(vast|fixed|kip|draai-?kip|dk|schuifraam|schuifdeur|schuif|deur|door|raam|window|dubbel|double|mm|cm)\b/ig, '').replace(/[-:,()]+/g, ' ').replace(/\s+/g, ' ').trim();
    const first = line.split(/\s+/)[0]; rows.push({ label: (label || (/^[^\d]/.test(first) ? first : '')).slice(0, 40), type, W: Math.round(W), H: Math.round(H), qty: qm ? Math.max(1, +qm[1]) : 1 });
  }
  return rows;
}
async function aiParse(text) {
  let sample = null; try { sample = window.claude && window.claude.use ? await window.claude.use('sample') : null; } catch (e) {}
  if (!sample) return null;
  const types = CORE.TYPES.map(t => `${t.id}: ${t.name}`).join('\n');
  const res = await sample.json(`Turn this window and door measurement list into rows for a quote. Allowed type ids:\n${types}\nReturn only JSON: {"rows":[{"label":"room or position","type":"one of the ids","W":width in mm,"H":height in mm,"qty":whole number}]}. Convert cm to mm. Width comes before height unless the list says otherwise. When the type is unclear use W-DK. Skip lines without a size.\n\nList:\n${text}`, { modelTier: 'quick' });
  const ok = new Set(CORE.TYPES.map(t => t.id));
  return (res && Array.isArray(res.rows) ? res.rows : []).filter(r => +r.W && +r.H).map(r => ({ label: String(r.label || '').slice(0, 40), type: ok.has(r.type) ? r.type : 'W-DK', W: Math.round(+r.W), H: Math.round(+r.H), qty: Math.max(1, Math.round(+r.qty || 1)) }));
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
  return `<div class="card panel quick"><div class="blk-h"><h2>Quick entry</h2><span class="muted">Type row by row, or paste a measurement list. Enter in the last row adds a new one.</span></div>
    <details class="paste" ${Q.pasteOpen ? 'open' : ''}><summary>Paste a measurement list</summary>
      <textarea class="inp" id="quick-paste" placeholder="Kitchen 1000 x 1200 tilt-turn 2 pcs&#10;Living room fixed 2400x1500&#10;Back door 90 x 215 cm">${esc(Q.paste || '')}</textarea>
      <div class="row-actions"><button class="btn small" data-act="quick-parse">Read list</button>${window.claude ? `<button class="btn small" data-act="quick-ai" ${S.aiBusy ? 'disabled' : ''}>${S.aiBusy ? 'Reading…' : 'Read with AI'}</button>` : ''}<span class="muted" style="font-size:12px">Rows are added below for you to check.</span></div></details>
    <div class="grid3"><div class="field"><span class="lbl">Material</span><div class="seg" style="gap:6px">${CORE.MATS.map(m => `<button class="opt-card" style="padding:8px 10px" data-act="quick-mat" data-v="${m}" aria-pressed="${b.material === m}"><b>${vLabel(m)}</b></button>`).join('')}</div></div>
      ${sel('system', pb.systems.filter(s => s.material === b.material && s.enabled !== false), 'System')}${sel('colOut', pb.colours.filter(c => c.material === b.material), 'Colour (both sides)')}</div>
    <div class="grid3">${sel('glazing', pb.glazing, 'Glass')}${sel('finishIn', pb.finishIn, 'Inside finishing')}<div class="field"><label for="qb-place">Placement</label><select class="inp" id="qb-place" data-qb="place"><option value="true" ${b.place !== false ? 'selected' : ''}>Supply and placement</option><option value="false" ${b.place === false ? 'selected' : ''}>Supply only</option></select></div></div>
    <div class="scroll-x" style="border:0"><table class="qt"><thead><tr><th>Room</th><th>Type</th><th>Width</th><th>Height</th><th>Qty</th><th style="text-align:right">Price</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="row-actions" style="justify-content:space-between"><button class="btn small" data-act="quick-row">+ Row</button>
      <div class="row-actions"><button class="btn ghost" data-act="quick-close">Cancel</button><button class="btn primary" data-act="quick-add" ${ready ? '' : 'disabled'}>Add ${ready || ''} line${ready === 1 ? '' : 's'} to offer</button></div></div></div>`;
}
function addParsed(rows, how) {
  if (!rows || !rows.length) { toast('No sizes found. Write each opening on its own line, like “Kitchen 1000 x 1200”.'); return; }
  const keep = S.quick.rows.filter(r => +r.W && +r.H || r.label);
  for (const r of rows) { const t = CORE.typeById(r.type); if (t.materials && !t.materials.includes(S.quick.base.material)) r.type = 'S-HS'; }
  S.quick.rows = keep.concat(rows); S.quick.pasteOpen = false; render(); toast(`${rows.length} row${rows.length > 1 ? 's' : ''} read ${how}. Check them before adding.`);
}

/* ---------- variants ---------- */
async function makeVariant(to, label) {
  const q = S.q; await Store.saveQuote(q);
  const group = q.group || q.id; q.group = group; q.variant = q.variant || matOf(q);
  if (!/-(PVC|ALU|WOOD|V\d+)$/.test(q.number)) q.number = `${q.number}-${q.variant.length <= 4 ? q.variant : 'V1'}`;
  await Store.saveQuote(q);
  const isMat = CORE.MATS.includes(to), name = isMat ? to : (label || 'Variant');
  const vs = variantsOf(q), existing = vs.find(v => v.id !== q.id && (v.variant || matOf(v)) === name);
  const v = clone(q), notes = [];
  const suffix = isMat ? to : `V${vs.length + 1}`;
  Object.assign(v, { id: existing ? existing.id : uid(), number: existing ? existing.number : `${baseNumber(q.number).replace(/-(WOOD|V\d+)$/, '')}-${suffix}`, variant: name, status: 'draft', createdAt: existing ? existing.createdAt : new Date().toISOString() });
  v.lines = q.lines.map(l => { if (isArt(l) || !isMat) { const c = clone(l); c.id = uid(); return c; } const r = CORE.convertCfg(S.pb, l.cfg, to); notes.push(...r.notes); return lineFromCfg({ ...r.cfg, label: l.label, qty: l.qty, discount: l.discount }); });
  await Store.saveQuote(v);
  S.q = clone(v); S.sel = new Set(); S.bulk = null; S.quick = null; S.art = false; render(); scrollTo(0, 0);
  const bad = v.lines.filter(l => l.err || (l.cfg && hasErr(lineChecks(l.cfg)))).length;
  toast(`${vLabel(name)} variant ready: ${v.lines.length} lines.${bad ? ` ${bad} need a check.` : ''}${notes.length ? ' ' + notes[0] : ''}`);
}
function avgUw(q) {
  let a = 0, s = 0; for (const l of q.lines) { if (isArt(l)) continue; const p = linePrice(l.cfg); if (p.uw == null) continue; const ar = l.W * l.H / 1e6 * l.qty; a += ar; s += ar * p.uw; }
  return a ? Math.round(s / a * 100) / 100 : null;
}
function compareCard(q) {
  const vs = variantsOf(q); if (vs.length < 2) return '';
  const T = vs.map(v => CORE.quoteTotals(v, S.pb)), low = Math.min(...T.map(t => t.total));
  const row = (label, f) => `<tr><th>${label}</th>${vs.map((v, i) => `<td class="num">${f(v, T[i])}</td>`).join('')}</tr>`;
  return `<div class="card panel compare"><div class="blk-h"><h2>Compare variants</h2><span class="muted">Show this to the client and let them choose</span></div>
    <div class="scroll-x" style="border:0"><table class="lt cmp"><thead><tr><th></th>${vs.map(v => `<th class="${v.id === q.id ? 'cur' : ''}">${esc(vLabel(v.variant || matOf(v)))}${v.status === 'accepted' ? ' <span class="chip accepted">Chosen</span>' : ''}</th>`).join('')}</tr></thead><tbody>
      ${row('Products', (v, t) => eur(t.products))}${row('Placement and site', (v, t) => eur(t.labour + t.siteCost))}${row('Total excl. VAT', (v, t) => eur(t.net))}
      ${row('<b>Total incl. VAT</b>', (v, t) => `<b>${eur(t.total)}</b>${t.total === low ? '' : `<br><span class="muted" style="font-size:12px">+${eur(t.total - low)}</span>`}`)}
      ${row('Average Uw', v => { const u = avgUw(v); return u == null ? '—' : u.toFixed(1).replace('.', ',') + ' W/m²K'; })}
      ${row('Units', (v, t) => t.units)}
      <tr><th></th>${vs.map(v => `<td><button class="btn small ${v.status === 'accepted' ? 'on' : ''}" data-act="variant-choose" data-id="${esc(v.id)}">${v.status === 'accepted' ? 'Chosen' : 'Client chooses this'}</button></td>`).join('')}</tr></tbody></table></div></div>`;
}
function viewOffer() {
  const q = S.q;
  return `<div class="doc-actions">
      <label class="lbl" for="status">Status</label><select class="inp" id="status" data-q="status" style="width:auto">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${q.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <button class="btn primary" data-act="dl-offer">Download offer (.html)</button>
      <label class="lbl" for="offer-lang">Offer language</label><select class="inp" id="offer-lang" data-q="lang" style="width:auto">${Object.entries(LANGS).map(([k, v]) => `<option value="${k}" ${(q.lang || S.prefs.offerLang || S.prefs.lang) === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <button class="btn" data-act="dl-csv">Lines (.csv)</button>
      <button class="btn" data-act="dl-bom">Bill of materials (.csv)</button>
      <button class="btn ghost" data-act="step" data-view="lines">Edit products</button></div>
    ${compareCard(q)}
    <div class="card panel" style="max-width:900px;margin:0 auto 16px"><div class="field"><label for="notes">Notes on the offer</label><textarea class="inp" id="notes" data-q="notes" placeholder="Delivery time, payment terms, site conditions…">${esc(q.notes)}</textarea></div>
      <p class="muted" style="font-size:12.5px">Open the downloaded file in your browser to print it or save it as PDF.</p></div>
    <div class="doc" id="doc" data-i18n-lang="${q.lang || S.prefs.offerLang || S.prefs.lang}">${offerDoc(q)}</div>`;
}
function bomCsv(q) {
  const agg = new Map();
  for (const l of q.lines) {
    if (isArt(l)) { const k = `Articles|${l.name}|${l.unit === 'm2' ? 'm²' : 'pc'}`; agg.set(k, (agg.get(k) || 0) + l.qty); continue; }
    for (const r of CORE.bom(S.pb, l.cfg)) { const k = `${r.group}|${r.item}|${r.unit}`; agg.set(k, (agg.get(k) || 0) + r.qty * l.qty); }
  }
  const rows = [...agg.entries()].map(([k, v]) => { const [g, i, u] = k.split('|'); return [g, i, String(Math.round(v * 100) / 100).replace('.', ','), u]; });
  return [['group', 'item', 'quantity', 'unit'], ...rows].map(r => r.map(v => /[;"\n]/.test(v) ? '"' + String(v).replace(/"/g, '""') + '"' : v).join(';')).join('\n');
}

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act, q = S.q;
  switch (a) {
    case 'open-quote': case 'new-quote': case 'go': S.open = new Set(); S.art = false; break;
    case 'col-kind': {
      const c = S.cfg, k = b.dataset.k, first = S.pb.colours.find(x => x.material === c.material && CORE.kindOf(x) === b.dataset.v);
      if (first) { c[k] = first.id; if (k === 'colOut' && c.sameColour) { c.colIn = first.id; c.ralIn = c.ralOut; } }
      render(); break;
    }
    case 'col-ral': { const c = S.cfg; c[b.dataset.k] = b.dataset.v; if (b.dataset.k === 'ralOut' && c.sameColour) c.ralIn = b.dataset.v; render(); break; }
    case 'line-details': S.open.has(b.dataset.id) ? S.open.delete(b.dataset.id) : S.open.add(b.dataset.id); render(); break;
    case 'art-open': S.art = true; S.quick = null; render(); break;
    case 'art-close': S.art = false; render(); break;
    case 'quick-open': S.art = false; break;
    case 'article-add': {
      const ar = byId(S.pb.articles, b.dataset.id), inp = document.getElementById('artq-' + ar.id), n = Math.max(ar.unit === 'm2' ? 0.5 : 1, +(inp && inp.value) || 1);
      q.lines.push({ id: uid(), kind: 'article', articleId: ar.id, name: ar.name, code: 'ART', label: '', qty: n, unit: ar.unit, unitPrice: ar.price, discount: 0, hours: 0, desc: [ar.cat], W: null, H: null, pricedAt: new Date().toISOString() });
      await Store.saveQuote(q); render(); toast(`Added ${ar.name}.`); break;
    }
    case 'variant-copy': { const n = (document.getElementById('variant-name') || {}).value || ''; await makeVariant('COPY', n.trim() || 'Variant'); break; }
    case 'variant-choose': {
      for (const v of variantsOf(q)) { const st = v.id === b.dataset.id ? 'accepted' : 'lost'; if (v.id === q.id) { q.status = st; await Store.saveQuote(q); } else { const f = S.quotes.find(x => x.id === v.id); if (f) { f.status = st; await Store.saveQuote(clone(f)); } } }
      render(); toast('Choice saved: the other variants are marked lost.'); break;
    }
    case 'dl-bom': download(`${q.number} BOM.csv`, bomCsv(q)); break;
    case 'quick-parse': { const t = document.getElementById('quick-paste'); S.quick.paste = t ? t.value : ''; addParsed(parseList(S.quick.paste), 'from the list'); break; }
    case 'quick-ai': {
      const t = document.getElementById('quick-paste'); S.quick.paste = t ? t.value : ''; if (!S.quick.paste.trim()) { toast('Paste a list first.'); break; }
      S.aiBusy = true; S.quick.pasteOpen = true; render();
      try { const rows = await aiParse(S.quick.paste); S.aiBusy = false; if (rows == null) { addParsed(parseList(S.quick.paste), 'with the built-in reader (AI is not available here)'); } else addParsed(rows, 'with AI'); }
      catch (err) { S.aiBusy = false; addParsed(parseList(S.quick.paste), err && err.code === 'not_granted' ? 'with the built-in reader' : 'with the built-in reader (AI did not answer)'); }
      break;
    }
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'quick-paste' && S.quick) { S.quick.paste = t.value; return; }
  if (t.dataset.ral && S.cfg) { const v = t.value.replace(/\D/g, '').slice(0, 4); S.cfg[t.dataset.ral] = v; if (t.dataset.ral === 'ralOut' && S.cfg.sameColour) S.cfg.ralIn = v; refreshSide(); return; }
  if (t.dataset.lacq) { S.pb.lacquer = S.pb.lacquer || {}; S.pb.lacquer[t.dataset.lacq] = +String(t.value).replace(',', '.') || 1; return; }
  if (t.dataset.pbroot) { S.pb[t.dataset.pbroot] = +String(t.value).replace(',', '.') || 0; return; }
});
document.addEventListener('toggle', e => { if (e.target.classList && e.target.classList.contains('paste') && S.quick) S.quick.pasteOpen = e.target.open; }, true);
