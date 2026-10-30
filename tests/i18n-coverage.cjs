// Lists English texts still visible after switching to NL and FR. Run: npm run test:i18n
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const errs=[];
  for (const lang of ['nl','fr']) {
    const p = await b.newPage({ viewport: { width: 1360, height: 900 } }); p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript((l) => { try { localStorage.setItem('wscpq.prefs', JSON.stringify({lang:l, offerLang:l})); } catch(e){} }, lang);
    await p.goto('file://' + require('path').resolve(__dirname, '../dist/test.html'));
    const left = new Set();
    const grab = async () => { (await p.evaluate(() => { const out=[]; const w=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); let n; while((n=w.nextNode())){ const el=n.parentElement; if(!el||el.closest('svg,textarea,script,style')) continue; const t=n.nodeValue.trim(); if(t && /[A-Za-z]{3,}/.test(t)) out.push(t);} document.querySelectorAll('[placeholder],[aria-label],[title]').forEach(e=>{ if(e.closest('svg')) return; for (const a of ['placeholder','aria-label','title']) if(e.hasAttribute(a)) out.push(e.getAttribute(a)); }); return out; })).forEach(x=>left.add(x)); };
    const c = async s => { await p.click(s); await p.waitForTimeout(30); await grab(); };
    await grab();
    await c('[data-act=new-quote]'); await p.fill('#c\\.name','Jan'); await c('[data-act=client-next]');
    await c('[data-act=quick-open]'); await p.click('.paste summary'); await p.fill('#quick-paste','Keuken 1000x1200 2 st\nVoordeur 1000x2200\nSchuif 3000x2300'); await c('[data-act=quick-parse]'); await c('[data-act=quick-add]');
    await c('[data-act=art-open]'); await c('[data-act=article-add][data-id=ar-zip]'); await c('[data-act=art-close]');
    await p.check('[data-selall]'); await grab();
    for (const k of ['colour','glass','hardware','material','finish','place']) await c(`[data-act=bulk-open][data-v=${k}]`);
    await c('[data-act=bulk-open][data-v=colour]'); await c('[data-act=bulk-set][data-k=colOut][data-v=p-7016]');
    await c('[data-act=line-details] >> nth=0');
    await p.uncheck('[data-selall]'); await c('[data-act=make-variant][data-v=ALU]');
    await c('[data-act=add-line]');
    for (const tb of ['type','dims','colour','glass','options','finish','place']) await c(`.ctabs [data-v=${tb}]`);
    await c('.ctabs [data-v=colour]'); await c('[data-act=col-kind][data-k=colOut][data-v=lacq]'); await c('.ctabs [data-v=dims]'); await p.fill('#cfg-W','1600'); await p.dispatchEvent('#cfg-W','change'); await grab();
    
    await c('.side-actions [data-act=cancel-line]');
    await c('[data-act=step][data-view=offer] >> nth=0');
    
    await c('[data-act=go][data-view=pricebook]'); for (const k of ['grids','systems','colours','install','articles','import']) await c(`[data-act=pb-tab][data-v=${k}]`);
    await c('[data-act=go][data-view=settings]');
    const en = new Set(JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname,'en-strings.json'),'utf8')));
    const still = [...left].filter(x => en.has(x) && /[a-z]{3,}/.test(x) && !/^(WS-|Winsol|OF-|Jan|Keuken|Voordeur|Schuif|RAL|PVC|ALU|English|Nederlands|Français|WinVista|Status|Service|Minimum|Type|Details|Project|Description|Article|Options|Configuration|Dimensions|Sample|Aluminium|E-mail|Email|Copy|Import)/.test(x));
    console.log(lang, 'untranslated:', still.length); console.log(still.slice(0,80).join('\n'));
  }
  console.log('ERR', errs); await b.close();
})();
