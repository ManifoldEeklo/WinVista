/* ---------- price book ---------- */
const PB_LISTS = {
  colours: { title: 'Colours', hint: 'Type std = standard, foil = foil, lacq = lacquer in any RAL code (priced with the coefficient above). Surcharge in % on the grid price, per side.', fields: [['name', 'Name', 'text'], ['material', 'Material', 'sel', ['PVC', 'ALU']], ['kind', 'Type', 'sel', ['std', 'foil', 'lacq']], ['hex', 'Colour', 'color'], ['pct', 'Surcharge %', 'num']] },
  glazing: { title: 'Glass', hint: 'Surcharge per m² of element size. Ug feeds the Uw estimate, kg/m² the sash weight check.', fields: [['name', 'Name', 'text'], ['perM2', '€/m²', 'num'], ['ug', 'Ug', 'num'], ['kg', 'kg/m²', 'num']] },
  handles: { title: 'Handles', hint: 'Price per opening sash.', fields: [['name', 'Name', 'text'], ['perSash', '€/sash', 'num']] },
  security: { title: 'Security', hint: 'Price per opening sash.', fields: [['name', 'Name', 'text'], ['perSash', '€/sash', 'num']] },
  hinges: { title: 'Hinges', hint: 'Price per opening sash.', fields: [['name', 'Name', 'text'], ['perSash', '€/sash', 'num']] },
  doorPanels: { title: 'Door panels', hint: 'Price per entrance door.', fields: [['name', 'Name', 'text'], ['price', '€', 'num']] },
  doorLocks: { title: 'Door locks', hint: 'Price per entrance door.', fields: [['name', 'Name', 'text'], ['price', '€', 'num']] },
  doorHandles: { title: 'Door handles', hint: 'Price per entrance door.', fields: [['name', 'Name', 'text'], ['price', '€', 'num']] },
  thresholds: { title: 'Thresholds', hint: 'Price per entrance door.', fields: [['name', 'Name', 'text'], ['price', '€', 'num']] },
  articles: { title: 'Articles', hint: 'Loose items sold with an offer: sun protection, controls, service. Unit pc or m2.', fields: [['name', 'Name', 'text'], ['cat', 'Category', 'text'], ['unit', 'Unit', 'sel', ['pc', 'm2']], ['price', 'Price', 'num']] },
  options: { title: 'Options', hint: 'Unit: pc = per piece, m = per metre of width, m2 = per m² of element. Options in the same group exclude each other.', fields: [['name', 'Name', 'text'], ['cat', 'Category', 'text'], ['group', 'Group', 'text'], ['unit', 'Unit', 'sel', ['pc', 'm', 'm2']], ['price', 'Price', 'num'], ['fixed', 'Start cost', 'num'], ['min', 'Minimum', 'num'], ['for', 'For (window,door,slide)', 'list']] },
};
const PB_TABS = [['grids', 'Price grids'], ['systems', 'Systems'], ['colours', 'Colours'], ['glazing', 'Glass'], ['hardware', 'Hardware'], ['door', 'Door parts'], ['options', 'Options'], ['install', 'Finish & placement'], ['articles', 'Articles'], ['import', 'Import / export']];

function viewPricebook() {
  const pb = S.pb, ro = !S.canEdit;
  const tabs = `<div class="pb-tabs" role="tablist">${PB_TABS.map(([k, l]) => `<button role="tab" data-act="pb-tab" data-v="${k}" aria-current="${S.pbTab === k}">${l}</button>`).join('')}</div>`;
  let body = '';
  if (S.pbTab === 'grids') body = pbGrids(ro);
  else if (S.pbTab === 'systems') body = pbList('systems', { title: 'Systems', hint: 'Rename systems to your final product names. Factor scales the sample grids only.', fields: [['name', 'Name', 'text'], ['supplier', 'Supplier / series', 'text'], ['material', 'Material', 'sel', ['PVC', 'ALU']], ['depth', 'Depth mm', 'num'], ['uw', 'Uw', 'num'], ['maxSashW', 'Max sash W', 'num'], ['maxSashH', 'Max sash H', 'num'], ['maxSashKg', 'Max sash kg', 'num'], ['maxSlideKg', 'Max slide kg', 'num'], ['maxGlassM2', 'Max glass m²', 'num'], ['factor', 'Sample factor', 'num'], ['enabled', 'Active', 'bool']] }, ro, true)
    + `<div class="card panel"><h2>Technical targets</h2><div class="grid3"><div class="field"><label for="pb-uw">Uw target for the checks</label><div class="unit-inp"><input class="inp num" id="pb-uw" data-pbroot="uwTarget" type="number" step="0.1" value="${S.pb.uwTarget}" ${ro ? 'disabled' : ''}><span>W/m²K</span></div></div></div><p class="muted" style="font-size:13px">Sash limits and the Uw target drive the technical checks in the configurator. All values are samples until set from the supplier documentation.</p>${ro ? '' : '<div class="row-actions"><button class="btn small primary" data-act="pb-save-list">Save changes</button></div>'}</div>`;
  else if (S.pbTab === 'hardware') body = ['handles', 'security', 'hinges'].map(k => pbList(k, PB_LISTS[k], ro)).join('');
  else if (S.pbTab === 'door') body = ['doorPanels', 'doorLocks', 'doorHandles', 'thresholds'].map(k => pbList(k, PB_LISTS[k], ro)).join('');
  else if (S.pbTab === 'install') body = pbInstall(ro);
  else if (S.pbTab === 'import') body = pbImport(ro);
  else if (S.pbTab === 'colours') body = lacquerCard(ro) + pbList('colours', PB_LISTS.colours, ro);
  else body = pbList(S.pbTab, PB_LISTS[S.pbTab], ro);
  return `<section class="page-head"><div><p class="eyebrow">Settings</p><h1>Price book</h1></div>
      <div class="row-actions">${pb.sample ? '<span class="chip sample">Sample prices</span>' : `<span class="chip accepted">Updated ${fmtDate(pb.updatedAt)}</span>`}</div></section>
    ${ro ? '<div class="notice info" style="margin-bottom:14px">You can view the price book. Only editors of this page can change it.</div>' : ''}
    ${tabs}${body}`;
}

function pbGrids(ro) {
  const pb = S.pb, sys = byId(pb.systems, S.pbSys) || pb.systems[0];
  S.pbSys = sys.id;
  const types = CORE.TYPES.filter(t => !t.materials || t.materials.includes(sys.material));
  if (!types.find(t => t.id === S.pbType)) S.pbType = types[0].id;
  const g = S.grids[sys.id] && S.grids[sys.id][S.pbType];
  const table = g ? `<div class="scroll-x" style="max-height:520px"><table class="gt"><thead><tr><th>H \\ W</th>${g.w.map((w, i) => `<th><input aria-label="Width column ${i + 1}" data-gw="${i}" value="${w}" ${ro ? 'disabled' : ''}></th>`).join('')}</tr></thead>
    <tbody>${g.h.map((h, r) => `<tr><th><input aria-label="Height row ${r + 1}" data-gh="${r}" value="${h}" ${ro ? 'disabled' : ''}></th>${g.w.map((w, c) => `<td><input aria-label="Price ${w} by ${h}" data-gc="${r},${c}" value="${g.p[r] && g.p[r][c] != null ? g.p[r][c] : ''}" ${ro ? 'disabled' : ''}></td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    : '<p class="muted">No grid for this combination.</p>';
  return `<div class="card panel">
    <div class="grid3"><div class="field"><label for="pb-sys">System</label><select class="inp" id="pb-sys" data-pbsel="pbSys">${pb.systems.map(s => `<option value="${s.id}" ${s.id === sys.id ? 'selected' : ''}>${esc(s.name)} (${s.material})</option>`).join('')}</select></div>
      <div class="field"><label for="pb-type">Product type</label><select class="inp" id="pb-type" data-pbsel="pbType">${types.map(t => `<option value="${t.id}" ${t.id === S.pbType ? 'selected' : ''}>${t.code} · ${esc(t.name)}</option>`).join('')}</select></div>
      <div class="field"><span class="lbl">Grid</span><span class="num" style="padding-top:9px">${g ? `${g.w.length} widths × ${g.h.length} heights` : '—'}</span></div></div>
    <p class="muted" style="font-size:13px">Base price in € excl. VAT for the outer frame size, white or standard colour, standard glass and hardware. A size is priced at the next width and height step up. Leave a cell empty where the size cannot be made.</p>
    ${table}
    <div class="row-actions">
      ${ro ? '' : `<button class="btn primary" data-act="pb-save-grid">Save grid</button>
      <label class="btn" for="grid-file">Import CSV…</label><input class="sr" type="file" id="grid-file" accept=".csv,.txt,text/csv">
      <button class="btn ghost" data-act="pb-reset-grid">Reset to sample</button>`}
      <button class="btn ghost" data-act="pb-export-grid">Download CSV</button></div>
    <p class="muted" style="font-size:12.5px">CSV layout: first row <span class="num">H\\W;400;600;…</span> with the widths, then one row per height: <span class="num">600;210;245;…</span>. Separator ; , or tab.</p></div>`;
}

function pbList(key, def, ro, noAdd) {
  const list = S.pb[key] || [];
  const cell = (row, i, [f, , type, opts]) => {
    const v = row[f], dis = ro ? 'disabled' : '';
    if (type === 'sel') return `<select data-pbl="${key}" data-i="${i}" data-f="${f}" ${dis}>${opts.map(o => `<option ${v === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
    if (type === 'bool') return `<input type="checkbox" data-pbl="${key}" data-i="${i}" data-f="${f}" data-t="bool" ${v !== false ? 'checked' : ''} ${dis} style="width:18px;min-width:0">`;
    if (type === 'color') return `<input type="color" data-pbl="${key}" data-i="${i}" data-f="${f}" value="${esc(v || '#ffffff')}" ${dis} style="min-width:44px;height:32px;padding:2px">`;
    if (type === 'list') return `<input data-pbl="${key}" data-i="${i}" data-f="${f}" data-t="list" value="${esc((v || []).join(','))}" ${dis}>`;
    return `<input ${type === 'num' ? 'class="n" inputmode="decimal"' : ''} data-pbl="${key}" data-i="${i}" data-f="${f}" data-t="${type}" value="${esc(v == null ? '' : v)}" ${dis}>`;
  };
  return `<div class="card panel" style="margin-bottom:12px"><div><h2>${def.title}</h2><p class="muted" style="font-size:13px">${def.hint}</p></div>
    <div class="scroll-x" style="border:0"><table class="lt"><thead><tr>${def.fields.map(f => `<th>${f[1]}</th>`).join('')}${ro || noAdd ? '' : '<th></th>'}</tr></thead>
    <tbody>${list.map((row, i) => `<tr>${def.fields.map(f => `<td>${cell(row, i, f)}</td>`).join('')}${ro || noAdd ? '' : `<td><button class="btn small ghost danger" data-act="pb-del-row" data-k="${key}" data-i="${i}" aria-label="Remove row">✕</button></td>`}</tr>`).join('')}</tbody></table></div>
    ${ro ? '' : `<div class="row-actions">${noAdd ? '' : `<button class="btn small" data-act="pb-add-row" data-k="${key}">+ Add row</button>`}<button class="btn small primary" data-act="pb-save-list">Save changes</button></div>`}</div>`;
}

function lacquerCard(ro) {
  const L = S.pb.lacquer || {};
  return `<div class="card panel" style="margin-bottom:12px"><div><h2>Lacquer coefficient</h2><p class="muted" style="font-size:13px">Multiplier on the grid price for each lacquered side (any RAL code). 1.22 means +22%. Used in the background; the client only sees the resulting amount.</p></div>
    <div class="grid3">${CORE.MATS.map(m => `<div class="field"><label for="lacq-${m}">${vLabel(m)}</label><div class="unit-inp"><input class="inp num" id="lacq-${m}" data-lacq="${m}" type="number" step="0.01" min="1" value="${L[m] || 1}" ${ro ? 'disabled' : ''}><span>×</span></div></div>`).join('')}</div>
    ${ro ? '' : '<div class="row-actions"><button class="btn small primary" data-act="pb-save-list">Save changes</button></div>'}</div>`;
}

function pbInstall(ro) {
  const L = S.pb.labour, f = (k, label, v, unit) => `<div class="field"><label for="lab-${k}">${label}</label><div class="unit-inp"><input class="inp num" id="lab-${k}" data-lab="${k}" type="number" step="0.05" value="${v}" ${ro ? 'disabled' : ''}><span>${unit}</span></div></div>`;
  const labour = `<div class="card panel" style="margin-bottom:12px"><div><h2>Labour</h2><p class="muted" style="font-size:13px">Person-hours per element = base hours + hours per m² (placement) + breakout hours × old frame factor. Labour is charged per offer at the hourly rate.</p></div>
    <div class="grid3">${f('rate', 'Hourly rate', L.rate, '€/h')}${f('crew', 'Default fitters', L.crew, 'pers.')}${f('hoursPerDay', 'Hours per day', L.hoursPerDay, 'h')}</div>
    <div class="grid3">${f('base.window', 'Base hours window', L.base.window, 'h')}${f('base.door', 'Base hours door', L.base.door, 'h')}${f('base.slide', 'Base hours sliding door', L.base.slide, 'h')}</div>
    <div class="grid3">${f('breakout.window', 'Breakout window', L.breakout.window, 'h')}${f('breakout.door', 'Breakout door', L.breakout.door, 'h')}${f('breakout.slide', 'Breakout sliding door', L.breakout.slide, 'h')}</div>
    <div class="grid3">${f('perM2', 'Extra hours per m²', L.perM2, 'h')}${f('disposal', 'Disposal per old frame', L.disposal, '€')}</div>
    ${ro ? '' : '<div class="row-actions"><button class="btn small primary" data-act="pb-save-list">Save changes</button></div>'}</div>`;
  return labour
    + pbList('finishIn', { title: 'Inside finishing', hint: 'Price per metre of reveal (2 × height + width).', fields: [['name', 'Name', 'text'], ['perM', '€/m', 'num']] }, ro)
    + pbList('finishOut', { title: 'Outside finishing', hint: 'Price per metre of reveal (2 × height + width).', fields: [['name', 'Name', 'text'], ['perM', '€/m', 'num']] }, ro)
    + pbList('oldFrames', { title: 'Old frame materials', hint: 'Factor on the breakout hours.', fields: [['name', 'Name', 'text'], ['factor', 'Factor', 'num']] }, ro)
    + pbList('siteItems', { title: 'Site costs', hint: 'Per offer. Unit pc, h or day. Minimum = lowest charge. Follows days = quantity defaults to the days on site.', fields: [['name', 'Name', 'text'], ['unit', 'Unit', 'sel', ['pc', 'h', 'day']], ['price', 'Price', 'num'], ['min', 'Minimum', 'num'], ['perDay', 'Follows days', 'bool']] }, ro);
}

function pbImport(ro) {
  return `<div class="card panel"><h2>Full price book</h2>
    <p class="muted">Download the complete price book (systems, grids, colours, glass, hardware and options) as JSON, edit it or generate it from your ERP, and upload it again. An upload replaces the current price book for everyone using this page.</p>
    <div class="row-actions"><button class="btn" data-act="pb-export-all">Download price book (.json)</button>
    ${ro ? '' : `<label class="btn primary" for="pb-file">Upload price book (.json)…</label><input class="sr" type="file" id="pb-file" accept=".json,application/json">
    <button class="btn ghost danger" data-act="${S.confirm === 'pb-reset' ? 'pb-reset-all' : 'ask-pb-reset'}">${S.confirm === 'pb-reset' ? 'Confirm: restore sample prices' : 'Restore sample prices'}</button>`}</div>
    <h2 style="margin-top:8px">Company on offers</h2>
    <div class="grid3"><div class="field"><label for="co-name">Company name</label><input class="inp" id="co-name" data-co="name" value="${esc(S.pb.company.name)}" ${ro ? 'disabled' : ''}></div>
    <div class="field"><label for="co-line">Tagline</label><input class="inp" id="co-line" data-co="line" value="${esc(S.pb.company.line)}" ${ro ? 'disabled' : ''}></div>
    <div class="field"><label for="co-val">Default validity (days)</label><input class="inp num" id="co-val" data-co="validityDays" type="number" value="${S.pb.company.validityDays}" ${ro ? 'disabled' : ''}></div></div>
    ${ro ? '' : '<div class="row-actions"><button class="btn small primary" data-act="pb-save-list">Save company details</button></div>'}</div>`;
}

function parseGridCsv(text) {
  const lines = text.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error('The file needs a header row with widths and at least one row of prices.');
  const sep = lines[0].includes(';') ? ';' : lines[0].includes('\t') ? '\t' : ',';
  const num = v => { v = String(v).trim().replace(/[€\s]/g, ''); if (!v) return null; if (sep !== ',') v = v.replace(/\./g, '').replace(',', '.'); const n = parseFloat(v); return isNaN(n) ? null : n; };
  const head = lines[0].split(sep).slice(1).map(num);
  if (head.some(v => v == null)) throw new Error('The first row must list widths in mm after the first cell.');
  const h = [], p = [];
  for (const l of lines.slice(1)) { const parts = l.split(sep); const hv = num(parts[0]); if (hv == null) continue; h.push(hv); p.push(head.map((_, i) => num(parts[i + 1]))); }
  const ok = arr => arr.every((v, i) => i === 0 || v > arr[i - 1]);
  if (!ok(head) || !ok(h)) throw new Error('Widths and heights must increase from left to right and top to bottom.');
  return { w: head, h, p };
}
function gridCsv(g) { return [['H\\W', ...g.w].join(';'), ...g.h.map((h, r) => [h, ...g.p[r].map(v => v == null ? '' : String(v).replace('.', ','))].join(';'))].join('\n'); }

/* ---------- events ---------- */
let saveT;
function saveQuoteSoon() { clearTimeout(saveT); saveT = setTimeout(() => { if (S.q && S.q.client.name) Store.saveQuote(S.q); }, 700); }

document.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act, id = b.dataset.id;
  const q = S.q;
  switch (a) {
    case 'go': S.view = b.dataset.view; S.confirm = null; if (S.view === 'quotes') S.q = null; render(); scrollTo(0, 0); break;
    case 'new-quote': S.q = newQuote(); S.view = 'client'; render(); scrollTo(0, 0); setTimeout(() => { const i = document.getElementById('c.name'); if (i) i.focus(); }, 30); break;
    case 'open-quote': { const f = S.quotes.find(x => x.id === id); if (!f) return; S.q = clone(f); S.view = f.lines.length ? 'lines' : 'client'; render(); scrollTo(0, 0); break; }
    case 'step': case 'client-next': {
      const to = a === 'client-next' ? 'lines' : b.dataset.view;
      if (to !== 'client' && !q.client.name.trim()) { S.view = 'client'; render(); toast('Enter the client name first.'); const i = document.getElementById('c.name'); if (i) i.focus(); return; }
      await Store.saveQuote(q); S.view = to; S.confirm = null; render(); scrollTo(0, 0); break;
    }
    case 'add-line': { const last = q.lines.filter(l => l.cfg).pop(); S.cfg = CORE.defaultConfig(S.pb, last ? last.cfg.material : S.prefs.material); if (last) Object.assign(S.cfg, { system: last.cfg.system, colOut: last.cfg.colOut, colIn: last.cfg.colIn, sameColour: last.cfg.sameColour, glazing: last.cfg.glazing }); S.editIdx = -1; S.cfgTab = 'type'; S.view = 'config'; render(); scrollTo(0, 0); break; }
    case 'edit-line': { const i = q.lines.findIndex(l => l.id === id); S.cfg = clone(q.lines[i].cfg); Object.assign(S.cfg, { label: q.lines[i].label, qty: q.lines[i].qty, discount: q.lines[i].discount }); S.editIdx = i; S.cfgTab = 'type'; S.view = 'config'; render(); scrollTo(0, 0); break; }
    case 'dup-line': { const i = q.lines.findIndex(l => l.id === id); const c = clone(q.lines[i]); c.id = uid(); q.lines.splice(i + 1, 0, c); await Store.saveQuote(q); render(); toast('Line duplicated.'); break; }
    case 'ask-del-line': S.confirm = 'line:' + id; render(); break;
    case 'cancel-confirm': S.confirm = null; render(); break;
    case 'del-line': q.lines = q.lines.filter(l => l.id !== id); S.confirm = null; await Store.saveQuote(q); render(); toast('Line removed.'); break;
    case 'reprice': { const i = q.lines.findIndex(l => l.id === id); const l = q.lines[i]; q.lines[i] = lineFromCfg({ ...l.cfg, label: l.label, qty: l.qty, discount: l.discount }, l); await Store.saveQuote(q); render(); toast('Price updated.'); break; }
    case 'cfg-set': setCfg(b.dataset.k, b.dataset.v); render(); break;
    case 'cfg-type': setType(b.dataset.v); render(); break;
    case 'cfg-tab': { S.cfgTab = b.dataset.v; render(); const tp = document.querySelector('.ctabs'); if (tp && tp.getBoundingClientRect().top < 0) tp.scrollIntoView({ block: 'start' }); const sel = document.querySelector('.ctabs [aria-selected="true"]'); if (sel) sel.scrollIntoView({ block: 'nearest', inline: 'center' }); break; }
    case 'save-line': {
      const line = lineFromCfg(S.cfg, S.editIdx >= 0 ? q.lines[S.editIdx] : null);
      if (S.editIdx >= 0) q.lines[S.editIdx] = line; else q.lines.push(line);
      await Store.saveQuote(q); const was = S.editIdx; S.editIdx = -1; S.view = 'lines'; render(); scrollTo(0, 0); toast(was >= 0 ? 'Line updated.' : 'Added to the offer.'); break;
    }
    case 'cancel-line': S.editIdx = -1; S.view = 'lines'; render(); scrollTo(0, 0); break;
    case 'dl-offer': download(`${q.number} ${q.client.name}.html`.replace(/[\\/:*?"<>|]/g, ''), offerDoc(q, true)); break;
    case 'dl-csv': download(`${q.number}.csv`, offerCsv(q)); break;
    case 'dl-copy': { const t = document.getElementById('dl-text'); try { await navigator.clipboard.writeText(S.dl.data); toast('Copied.'); } catch (err) { t.select(); toast('Press Ctrl+C to copy.'); } break; }
    case 'dl-close': S.dl = null; render(); break;
    case 'pb-tab': S.pbTab = b.dataset.v; S.confirm = null; render(); break;
    case 'pb-save-grid': { const was = S.pb.sample; S.pb.sample = false; if (await Store.savePricebook([S.pbSys])) toast('Grid saved.'); else S.pb.sample = was; render(); break; }
    case 'pb-reset-grid': { const sys = byId(S.pb.systems, S.pbSys); S.grids[sys.id][S.pbType] = CORE.sampleGrid(sys, CORE.typeById(S.pbType)); render(); toast('Sample grid restored. Save to keep it.'); break; }
    case 'pb-export-grid': { const g = S.grids[S.pbSys][S.pbType]; download(`grid ${S.pbSys} ${S.pbType}.csv`, gridCsv(g)); break; }
    case 'pb-add-row': { const k = b.dataset.k, list = S.pb[k]; const tmpl = clone(list[list.length - 1] || {}); tmpl.id = k.slice(0, 2) + '-' + uid().slice(0, 5); tmpl.name = 'New item'; list.push(tmpl); render(); break; }
    case 'pb-del-row': S.pb[b.dataset.k].splice(+b.dataset.i, 1); render(); break;
    case 'pb-save-list': { const was = S.pb.sample; S.pb.sample = false; if (await Store.savePricebook([])) toast('Price book saved.'); else S.pb.sample = was; render(); break; }
    case 'pb-export-all': download('winsol-pricebook.json', JSON.stringify({ format: 'winsol-cpq-pricebook', version: 1, pricebook: S.pb, grids: S.grids }, null, 1)); break;
    case 'ask-pb-reset': S.confirm = 'pb-reset'; render(); break;
    case 'pb-reset-all': S.pb = CORE.samplePricebook(); S.grids = CORE.sampleGrids(S.pb); S.confirm = null; await Store.savePricebook(); render(); toast('Sample prices restored.'); break;
  }
});

document.addEventListener('input', e => {
  const t = e.target;
  if (t.id === 'q-search') { S.search = t.value; const pos = t.selectionStart; render(); const n = $('#q-search'); n.focus(); n.setSelectionRange(pos, pos); return; }
  if (t.dataset.q) {
    const k = t.dataset.q, v = t.value;
    if (k.startsWith('c.')) S.q.client[k.slice(2)] = v;
    else if (['vat', 'discount', 'validityDays'].includes(k)) S.q[k] = +v || 0;
    else S.q[k] = v;
    if (['discount', 'vat'].includes(k) && S.view === 'lines') { const aside = t.closest('aside'); const pos = t.selectionStart; render(); const n = document.getElementById(t.id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (err) {} } }
    if (S.view === 'offer' && k === 'notes') { const d = $('#doc'); if (d) d.innerHTML = offerDoc(S.q); }
    saveQuoteSoon(); return;
  }
  if (t.dataset.cfg && t.tagName === 'INPUT') {
    const k = t.dataset.cfg; S.cfg[k] = k === 'hours' ? (t.value === '' ? null : +t.value) : (t.type === 'number' || t.type === 'range') ? (+t.value || 0) : t.value;
    if (['W', 'H', 'topH'].includes(k)) {
      document.querySelectorAll(`[data-cfg="${k}"]`).forEach(el => { if (el !== t) el.value = S.cfg[k]; });
      const ts = document.querySelector('.ctabs [data-v="dims"] .ts'); if (ts) ts.textContent = `${S.cfg.W}×${S.cfg.H}`;
    }
    refreshSide(); return;
  }
  if (t.dataset.inst || t.dataset.institem) {
    const q = S.q; q.inst = q.inst || { items: {} }; q.inst.items = q.inst.items || {};
    const v = t.value === '' ? null : +t.value;
    if (t.dataset.inst) q.inst[t.dataset.inst] = v; else q.inst.items[t.dataset.institem] = v;
    const id = t.id, pos = t.value.length; render(); const n = document.getElementById(id) || document.querySelector(`[data-institem="${t.dataset.institem}"]`); if (n) { n.focus(); }
    saveQuoteSoon(); return;
  }
  if (t.dataset.lab) { const k = t.dataset.lab, v = +String(t.value).replace(',', '.') || 0; const L = S.pb.labour; if (k.includes('.')) { const [a, b] = k.split('.'); L[a][b] = v; } else L[k] = v; return; }
  if (t.dataset.optqty) { S.cfg.options[t.dataset.optqty] = Math.max(1, +t.value || 1); refreshSide(); return; }
  if (t.dataset.gc) { const [r, c] = t.dataset.gc.split(',').map(Number); const v = t.value.trim().replace(',', '.'); S.grids[S.pbSys][S.pbType].p[r][c] = v === '' ? null : +v; return; }
  if (t.dataset.gw) { S.grids[S.pbSys][S.pbType].w[+t.dataset.gw] = +t.value || 0; return; }
  if (t.dataset.gh) { S.grids[S.pbSys][S.pbType].h[+t.dataset.gh] = +t.value || 0; return; }
  if (t.dataset.pbl && t.type !== 'checkbox') pbFieldSet(t);
  if (t.dataset.co) { S.pb.company[t.dataset.co] = t.dataset.co === 'validityDays' ? (+t.value || 30) : t.value; }
});

function pbFieldSet(t) {
  const row = S.pb[t.dataset.pbl][+t.dataset.i], f = t.dataset.f, ty = t.dataset.t;
  if (ty === 'num') { const v = t.value.replace(',', '.'); row[f] = v === '' ? 0 : +v; }
  else if (ty === 'list') row[f] = t.value.split(',').map(s => s.trim()).filter(Boolean);
  else if (ty === 'bool') row[f] = t.checked;
  else row[f] = t.value;
}

document.addEventListener('change', async e => {
  const t = e.target;
  if (t.dataset.q && t.tagName === 'SELECT') { if (S.view === 'lines') render(); if (S.view === 'offer') saveQuoteSoon(); return; }
  if (t.dataset.cfg && t.tagName === 'SELECT') { S.cfg[t.dataset.cfg] = t.value; refreshSide(); return; }
  if (t.dataset.cfg && ['W', 'H', 'topH'].includes(t.dataset.cfg)) { if (t.type === 'number') { const id = t.id; render(); } else { const id = t.id; render(); const n = document.getElementById(id); if (n) n.focus(); } return; }
  if (t.dataset.cfgb) { S.cfg[t.dataset.cfgb] = t.checked; if (t.checked) { S.cfg.colIn = S.cfg.colOut; S.cfg.ralIn = S.cfg.ralOut; } render(); return; }
  if (t.dataset.opt) {
    const o = byId(S.pb.options, t.dataset.opt);
    if (t.checked) { for (const x of S.pb.options) if (x.group && x.group === o.group && x.id !== o.id) delete S.cfg.options[x.id]; S.cfg.options[o.id] = 1; }
    else delete S.cfg.options[o.id];
    render(); return;
  }
  if (t.dataset.pbsel) { S[t.dataset.pbsel] = t.value; render(); return; }
  if (t.dataset.pbl && (t.type === 'checkbox' || t.tagName === 'SELECT')) { pbFieldSet(t); return; }
  if (t.id === 'grid-file' && t.files[0]) {
    try { const g = parseGridCsv(await t.files[0].text()); S.grids[S.pbSys][S.pbType] = g; render(); toast(`Imported ${g.w.length} × ${g.h.length} grid. Save to keep it.`); }
    catch (err) { toast(err.message || 'Could not read that CSV file.'); }
    t.value = ''; return;
  }
  if (t.id === 'pb-file' && t.files[0]) {
    try {
      const j = JSON.parse(await t.files[0].text());
      if (!j.pricebook || !Array.isArray(j.pricebook.systems)) throw new Error('This file is not a price book export.');
      const base = CORE.samplePricebook();
      S.pb = Object.assign(base, j.pricebook, { sample: false });
      S.grids = mergeGrids(j.grids || {});
      await Store.savePricebook(); render(); toast('Price book uploaded.');
    } catch (err) { toast(err.message && err.message.length < 90 ? err.message : 'Could not read that file. Upload a price book exported from this page.'); }
    t.value = ''; return;
  }
});

/* ---------- boot ---------- */
render();
i18nBoot();
Store.boot();
