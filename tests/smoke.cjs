// End-to-end smoke test: client → quick entry from a pasted list → article → bulk edit → ALU variant → checks → offer.
// Run: npm test
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../dist/test.html');
(async () => {
  const b = await chromium.launch(); const errs = []; let fail = 0;
  const ok = (cond, msg) => { if (!cond) { fail++; console.log('FAIL', msg); } else console.log('ok  ', msg); };
  for (const [w, h] of [[1360, 900], [400, 860]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    p.on('pageerror', e => errs.push(e.message));
    await p.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('wscpq.prefs', JSON.stringify({ lang: 'en' })); } catch (e) {} });
    await p.goto(URL);
    await p.click('[data-act=new-quote]'); await p.fill('#c\\.name', 'Test client'); await p.click('[data-act=client-next]');
    await p.click('[data-act=quick-open]'); await p.click('.paste summary');
    await p.fill('#quick-paste', 'Keuken 1000 x 1200 2 st\nLiving vast 2400x1500\nTerrasdeur 90 x 215 cm\nSchuifraam 3000x2300');
    await p.click('[data-act=quick-parse]');
    ok(await p.locator('table.qt tbody tr').count() >= 4, `${w}px: list parsed into rows`);
    await p.click('[data-act=quick-add]');
    ok(await p.locator('.line').count() === 4, `${w}px: 4 lines added`);
    await p.click('[data-act=art-open]'); await p.click('[data-act=article-add][data-id=ar-zip]'); await p.click('[data-act=art-close]');
    await p.check('[data-selall]'); await p.click('[data-act=bulk-open][data-v=colour]'); await p.click('[data-act=bulk-set][data-k=colOut][data-v=p-7016]');
    const pvc = await p.textContent('.tot .r.big');
    await p.uncheck('[data-selall]'); await p.click('[data-act=make-variant][data-v=ALU]');
    const alu = await p.textContent('.tot .r.big');
    ok(pvc !== alu, `${w}px: ALU variant has its own total (${pvc.trim()} vs ${alu.trim()})`);
    await p.click('[data-act=add-line]'); await p.click('.ctabs [data-v=dims]');
    await p.fill('#cfg-W', '1600'); await p.fill('#cfg-H', '2400'); await p.dispatchEvent('#cfg-H', 'change');
    ok((await p.locator('.chk li').count()) > 0, `${w}px: technical checks shown`);
    await p.click('[data-act=cancel-line] >> visible=true');
    await p.click('[data-act=step][data-view=offer] >> nth=0');
    ok(await p.locator('.compare').count() === 1, `${w}px: compare variants shown`);
    ok(await p.evaluate(() => document.documentElement.scrollWidth) <= w, `${w}px: no horizontal scroll`);
  }
  ok(errs.length === 0, 'no page errors ' + JSON.stringify(errs));
  await b.close(); process.exit(fail ? 1 : 0);
})();
