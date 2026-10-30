#!/usr/bin/env node
// Build WinVista from src/. No dependencies: runs on Vercel, GitHub Actions or locally with Node 18+.
//
// public/                      the web app Vercel deploys (index.html + manifest + icons)
// dist/winvista-artifact.html  page body for the claude.ai Artifact (the Artifact tool adds the <html>/<head> skeleton)
// dist/WinVista.html           single stand-alone file to open from disk
// dist/test.html               artifact body in a skeleton, used by the Playwright tests
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src'), DIST = join(ROOT, 'dist'), PUB = join(ROOT, 'public');
// Load order matters: later files redeclare some functions (see CLAUDE.md, "Override chain").
const JS_ORDER = ['core.js', 'ui.js', 'speed.js', 'hive.js', 'i18n.js', 'dict.js', 'ui2.js'];
const read = f => readFileSync(join(SRC, f), 'utf8');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const HEADER = `<header class="topbar"><div class="wrap"><div class="brand"><b>WV</b>WinVista <small>by Winsol</small></div><nav class="nav" id="nav" aria-label="Main"></nav><select id="lang-sel" class="lang" aria-label="Language"><option value="en">EN</option><option value="nl">NL</option><option value="fr">FR</option></select><span class="store-pill" id="store">This browser only</span></div></header>
<main id="main" class="wrap"></main>
`;
const BASE_STYLE = '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>';
const SKELETON_HEAD = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n<meta name="theme-color" content="#132029">\n${BASE_STYLE}\n</head>\n<body>\n`;

// Outside claude.ai the page cannot use the Artifact download capability: save files with a blob link instead.
const DL_OLD = "  if (!d) { S.dl = { filename, data }; render(); toast('Downloads are not available here. Copy the content instead.'); return; }";
const DL_NEW = "  if (!d && !window.claude) { try { const url = URL.createObjectURL(new Blob([data], { type: /\\.html$/.test(filename) ? 'text/html' : /\\.json$/.test(filename) ? 'application/json' : 'text/csv' })); "
  + "const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 4000); return; } catch (e) {} }\n" + DL_OLD;
const standaloneJs = js => {
  if (!js.includes(DL_OLD)) throw new Error('download fallback line changed: update DL_OLD in build.mjs');
  return js.replace(DL_OLD, DL_NEW).replace("Shared · saved online' : 'This browser only'", "Shared · saved online' : 'Saved on this device'");
};

// splash: logo inlined as data URI so every output is self-contained
const logo = readFileSync(join(SRC, 'assets', 'winvista-logo.png')).toString('base64');
const splashHtml = read('splash.html').replace('{{LOGO}}', `data:image/png;base64,${logo}`);
const head = read('head.html').replace('</style>', read('splash.css') + '\n</style>');
const js = JS_ORDER.map(read).join('\n');

// 1. claude.ai Artifact body + test page + stand-alone file
mkdirSync(DIST, { recursive: true });
const artifactBody = head + splashHtml + HEADER + '<script>\n' + js + '\n</script>\n';
writeFileSync(join(DIST, 'winvista-artifact.html'), artifactBody);
writeFileSync(join(DIST, 'test.html'), SKELETON_HEAD + artifactBody + '</body>\n</html>\n');
writeFileSync(join(DIST, 'WinVista.html'), SKELETON_HEAD + head + splashHtml + HEADER + '<script>\n' + standaloneJs(js) + '\n</script>\n</body>\n</html>\n');

// 2. Web app for Vercel: proper <head> (title, fonts, styles, manifest, icons) and the same app body
const headParts = head.replace('<meta name="claude:viewport-fit-sides" content="cover">\n', '');
const webHead = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0D161B">
<meta name="description" content="WinVista – PVC and ALU window and door CPQ by Winsol">
<meta name="application-name" content="WinVista">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="WinVista">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="generator" content="WinVista ${pkg.version}">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="icon" href="/icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
${BASE_STYLE}
${headParts}
</head>
<body>
`;
mkdirSync(join(PUB, 'icons'), { recursive: true });
writeFileSync(join(PUB, 'index.html'), webHead + splashHtml + HEADER + '<script>\n' + standaloneJs(js) + '\n</script>\n</body>\n</html>\n');
for (const f of ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png']) {
  const p = join(SRC, 'assets', 'icons', f); if (existsSync(p)) copyFileSync(p, join(PUB, 'icons', f));
}
writeFileSync(join(PUB, 'manifest.webmanifest'), JSON.stringify({
  name: 'WinVista – PVC & ALU CPQ', short_name: 'WinVista', description: 'Window and door configurator and quotes by Winsol',
  start_url: '/', scope: '/', display: 'standalone', orientation: 'any', background_color: '#0D161B', theme_color: '#0D161B',
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
}, null, 2));
writeFileSync(join(PUB, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log(`WinVista ${pkg.version} built: public/index.html, dist/WinVista.html, dist/winvista-artifact.html, dist/test.html`);
