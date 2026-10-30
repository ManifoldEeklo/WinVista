/* ===== Languages (EN / NL / FR) and personal settings ===== */
const LANGS = { en: 'English', nl: 'Nederlands', fr: 'Français' };
const navLang = (() => { try { const l = (navigator.language || 'en').slice(0, 2).toLowerCase(); return LANGS[l] ? l : 'en'; } catch (e) { return 'en'; } })();
S.prefs = Object.assign({ lang: navLang, offerLang: '', vat: 21, material: 'PVC' }, LS.get('prefs', {}));
if (!CORE.MATS.includes(S.prefs.material)) S.prefs.material = 'PVC';
const savePrefs = () => LS.set('prefs', S.prefs);
const I18N = { nl: {}, fr: {} };   // filled by the dictionary block
const I18P = [];                   // [regex, {nl: fn, fr: fn}]
const I18L = { nl: {}, fr: {} };   // lower-case index
const FRAG = { nl: [], fr: [] };   // word fragments inside price and number strings
function T(s, lang) {
  lang = lang || S.prefs.lang;
  if (s == null || lang === 'en') return s;
  const str = String(s), k = str.trim(); if (!k || !/[A-Za-zÀ-ÿ]/.test(k)) return s;
  const v = T1(k, lang); return v == null ? s : str.replace(k, v);
}
function T1(k, lang) {
  const d = I18N[lang] || {}; if (d[k] != null) return d[k];
  const low = I18L[lang] && I18L[lang][k.toLowerCase()];
  if (low != null) return /^[a-z]/.test(k) ? low.charAt(0).toLowerCase() + low.slice(1) : low;
  for (const [re, m] of I18P) { const mm = k.match(re); if (mm && m[lang]) { T.lang = lang; const r = m[lang](...mm.slice(1).map(x => x == null ? '' : x)); if (r !== k) return r; } }
  for (const sep of [' · ', ' — ', ' / ', ', ']) if (k.includes(sep)) {
    const parts = k.split(sep), tr = parts.map(p => { const r = p.trim() ? T1(p.trim(), lang) : null; return r == null ? p : r; });
    if (tr.some((x, i) => x !== parts[i])) return tr.join(sep);
  }
  if (/\d/.test(k) && FRAG[lang].length) { let out = k; for (const [re, rep] of FRAG[lang]) out = out.replace(re, rep); if (out !== k) return out; }
  return null;
}
const tt = x => { const r = T1(String(x).trim(), T.lang); return r == null ? x : r; };
const ORIG = new WeakMap(), OUT = new WeakMap(), AORIG = new WeakMap();
const SKIP = new Set(['SCRIPT', 'STYLE', 'svg', 'SVG']);
function langOf(el) { const h = el && el.closest && el.closest('[data-i18n-lang]'); return h ? h.dataset.i18nLang : S.prefs.lang; }
function trText(n) {
  const p = n.parentElement; if (!p || p.closest('svg, textarea, script, style, [data-noi18n]')) return;
  if (!ORIG.has(n) || (OUT.has(n) && n.nodeValue !== OUT.get(n))) ORIG.set(n, n.nodeValue);
  const out = T(ORIG.get(n), langOf(p)); OUT.set(n, out);
  if (n.nodeValue !== out) n.nodeValue = out;
}
function trAttrs(el) {
  if (el.closest('svg, [data-noi18n]')) return;
  if (el.tagName === 'INPUT' && el.type !== 'search' && el.type !== 'text' && !el.hasAttribute('placeholder') && !el.hasAttribute('aria-label')) return;
  let o = AORIG.get(el); if (!o) { o = {}; AORIG.set(el, o); }
  for (const a of ['placeholder', 'aria-label', 'title']) {
    if (!el.hasAttribute(a)) continue;
    const cur = el.getAttribute(a); if (o[a] == null || (o['_' + a] != null && cur !== o['_' + a])) o[a] = cur;
    const out = T(o[a], langOf(el)); o['_' + a] = out; if (cur !== out) el.setAttribute(a, out);
  }
}
function trTree(root) {
  if (!root) return;
  if (root.nodeType === 3) { trText(root); return; }
  if (root.nodeType !== 1 || SKIP.has(root.tagName)) return;
  trAttrs(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, { acceptNode: n => (n.nodeType === 1 && SKIP.has(n.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
  let n; while ((n = w.nextNode())) { if (n.nodeType === 3) trText(n); else trAttrs(n); }
}
let i18nBusy = false;
const i18nObs = new MutationObserver(muts => {
  if (i18nBusy) return; i18nBusy = true;
  try { for (const m of muts) { if (m.type === 'childList') m.addedNodes.forEach(trTree); else if (m.type === 'characterData') trText(m.target); else if (m.type === 'attributes') trAttrs(m.target); } }
  finally { i18nBusy = false; }
});
function setLang(l) {
  S.prefs.lang = LANGS[l] ? l : 'en'; savePrefs();
  document.documentElement.lang = S.prefs.lang;
  render(); trTree(document.body);
  const sel = document.getElementById('lang-sel'); if (sel) sel.value = S.prefs.lang;
}
function translateDocString(html, lang) {
  if (lang === 'en') return html;
  const d = new DOMParser().parseFromString(html, 'text/html');
  const w = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT); let n;
  while ((n = w.nextNode())) { if (n.parentElement && n.parentElement.closest('svg')) continue; n.nodeValue = T(n.nodeValue, lang); }
  d.title = T(d.title, lang); d.documentElement.lang = lang;
  return '<!doctype html>\n' + d.documentElement.outerHTML;
}

/* ---------- settings page ---------- */
function viewSettings() {
  const p = S.prefs, seg = (act, cur, list) => `<div class="seg three">${list.map(([v, l]) => `<button class="opt-card" data-act="${act}" data-v="${v}" aria-pressed="${String(cur) === String(v)}"><b>${l}</b></button>`).join('')}</div>`;
  return `<section class="page-head"><div><p class="eyebrow">Settings</p><h1>Settings</h1></div></section>
    <div class="two"><div style="display:flex;flex-direction:column;gap:12px">
      <div class="card panel"><div><h2>Language</h2><p class="muted" style="font-size:13px">The language of the app on this device.</p></div>${seg('set-lang', p.lang, Object.entries(LANGS))}</div>
      <div class="card panel"><div><h2>Offer language</h2><p class="muted" style="font-size:13px">Default language of new offers for the client. You can still change it per offer on the Offer step.</p></div>${seg('set-offerlang', p.offerLang || p.lang, Object.entries(LANGS))}</div>
      <div class="card panel"><div><h2>New offers</h2></div>
        <div class="grid2"><div class="field"><label for="pref-vat">Default VAT rate</label><select class="inp" id="pref-vat" data-pref="vat">${[[21, '21 %'], [6, '6 %'], [0, '0 %']].map(([v, l]) => `<option value="${v}" ${+p.vat === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
        <div class="field"><label for="pref-mat">Default material</label><select class="inp" id="pref-mat" data-pref="material">${CORE.MATS.map(m => `<option value="${m}" ${p.material === m ? 'selected' : ''}>${vLabel(m)}</option>`).join('')}</select></div></div></div>
    </div>
    <aside class="card panel sticky"><p class="eyebrow">Shared settings</p><p class="muted" style="font-size:13px">Prices, systems, colours, the lacquer coefficient and company details are shared with everyone and live in the price book.</p><button class="btn" data-act="go" data-view="pricebook">Open price book</button></aside></div>`;
}

/* ---------- hooks ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
  const a = b.dataset.act;
  if (a === 'set-lang') { setLang(b.dataset.v); return; }
  if (a === 'set-offerlang') { S.prefs.offerLang = b.dataset.v; savePrefs(); render(); return; }
  if (a === 'dl-offer' && S.q) {
    e.stopImmediatePropagation(); e.preventDefault();
    const q = S.q, lang = q.lang || S.prefs.offerLang || S.prefs.lang;
    download(`${q.number} ${q.client.name}.html`.replace(/[\\/:*?"<>|]/g, ''), translateDocString(offerDoc(q, true), lang));
    return;
  }
}, true);
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'lang-sel') { setLang(t.value); return; }
  if (t.dataset.pref) { S.prefs[t.dataset.pref] = t.dataset.pref === 'vat' ? +t.value : t.value; savePrefs(); return; }
  if (t.dataset.q === 'lang' && S.q) { S.q.lang = t.value; saveQuoteSoon(); render(); }
});
function i18nBoot() {
  document.documentElement.lang = S.prefs.lang;
  const sel = document.getElementById('lang-sel'); if (sel) sel.value = S.prefs.lang;
  trTree(document.body);
  i18nObs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'aria-label', 'title'] });
}
