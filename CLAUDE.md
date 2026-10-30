# WinVista – handover for Claude Code

WinVista is Winsol's CPQ (configure, price, quote) for PVC and ALU windows and doors. A salesperson starts from the client, configures products, and produces a priced offer. There is no ordering yet. This file is the handover from the Claude (Cowork) session that built version 0.8 (29–30 Oct 2026).

## Where things live

| What | Where |
|---|---|
| Source | `src/` – one HTML head with CSS, plus seven plain JS files (no framework, no bundler) |
| Build | `node build.mjs` (no dependencies) → `public/` (web app for Vercel) and `dist/` |
| Hosting | Vercel via GitHub: `vercel.json` (build `node build.mjs`, output `public/`), CI test in `.github/workflows/test.yml` |
| Live version (claude.ai Artifact, shared database) | https://claude.ai/artifact/G9NBgc1JeGuDqa7Bj1YoNu |
| Stand-alone version | `dist/WinVista.html` – open in any browser, saves in localStorage |
| Web app (Vercel) | `public/index.html` + `manifest.webmanifest` + icons; installable on tablet/phone (Add to Home Screen) |
| Competitor review and proposal (doc) | https://claude.ai/artifact/P7bYRqH4JRJf8GjgZ1p6ZL |
| Deck "How the Eko4u CPQ works" | https://claude.ai/artifact/2A751TZxQDaLE3Q8233oUG |
| Eko4u price analysis data (73 lines, 6 quotes) | `docs/eko4u_price_lines.csv` |

## Commands

```bash
npm run build                 # node build.mjs → public/ + dist/
npm start                     # build and serve public/ locally
npm i && npx playwright install chromium
npm test                      # build + Playwright smoke test (desktop 1360px and phone 400px)
npm run test:i18n             # lists English texts still visible in NL and FR
```

To deploy, push to `main` and Vercel builds and publishes `public/` (see README). To republish the claude.ai Artifact, publish `dist/winvista-artifact.html` to the Artifact URL above with the capabilities in "Storage". The Artifact tool adds the `<html>/<head>` skeleton itself, so that file has none.

**Build outputs:**

| Output | Use | Downloads | Storage |
|---|---|---|---|
| `public/index.html` | Vercel | blob links | localStorage |
| `dist/WinVista.html` | open from disk | blob links | localStorage |
| `dist/winvista-artifact.html` | claude.ai | `downloads` capability | shared `db` |

`build.mjs` swaps the download fallback for the first two (see `DL_OLD` / `DL_NEW`).

## Architecture

All files are concatenated, in this order, into one `<script>` (see `JS_ORDER` in `build.mjs`):

| File | Role |
|---|---|
| `core.js` | Pure logic, no DOM, runs in Node too (`module.exports`). Product types, sample price book, grid lookup, pricing, SVG drawing, geometry, technical checks, bill of materials, material conversion, totals. |
| `ui.js` | State `S`, storage (`Store`, `LS`), download helper, top bar, router `render()`, client step, totals block, tabbed configurator `viewConfig()`, site card, offer document `offerDoc()`, CSV. |
| `speed.js` | Speed tools: selection and bulk edit, quick entry, copy, qty steppers, PVC⇄ALU variants. |
| `hive.js` | Pro features inspired by Hive CPQ: technical checks in the side panel, line details with BOM, articles, list paste parsing (+ AI via `sample`), named variants, compare variants, BOM CSV, colour picker (standard / foil / lacquer RAL). |
| `i18n.js` | Language engine (EN/NL/FR) and the Settings page. |
| `dict.js` | Translation dictionary and regex patterns. |
| `ui2.js` | Price book screens, CSV/JSON import, main event handlers, then boot: `render(); i18nBoot(); Store.boot();` |
| `splash.html`, `splash.css`, `assets/winvista-logo.png` | 4-second splash: logo, popping "PVC & ALU CPQ" text and a loader bar. `build.mjs` inlines the logo as a data URI and the CSS into the head. |

### Override chain (important)

Some functions are declared twice. In one script the **last** declaration wins, so the later file is the live one:

| Function | Live version | Dead older copy |
|---|---|---|
| `viewLines`, `bulkPanel`, `quickPanel`, `makeVariant` | `hive.js` | `speed.js` |
| `sideHtml`, `mbarHtml`, `viewOffer` | `hive.js` | `ui.js` |

Always edit the version in `hive.js`. First refactor to do: delete the dead copies.

### Events

Several `document` listeners handle `click` / `input` / `change` on `[data-act]`, `[data-q]`, `[data-cfg]` and similar attributes, one per file. `i18n.js` adds a capture-phase click listener that intercepts `dl-offer` to translate the downloaded offer. Async handlers swallow errors silently: when a button "does nothing", check the console. That is how the article-line crash was found.

### Rendering

`render()` rebuilds `#main` from template strings. The configurator side panel updates through `refreshSide()` so typed inputs keep focus. Escape all user data with `esc()`.

## Data model

```
Quote  { id, number, status: draft|sent|accepted|lost, date, validityDays, lang: en|nl|fr,
         client{ name, company, email, phone, street, zip, city, vatNo }, reference, site,
         vat, discount, notes, lines[], inst{ crew, hours, days, items{id:qty} },
         group?, variant? }            // variants share `group`; variant = 'PVC' | 'ALU' | free label
Line   { id, cfg, label, qty, discount, unitPrice, items[], hours, err, code, name, W, H, desc[] }
       | { id, kind:'article', articleId, name, unit: pc|m2, qty, unitPrice, desc[] }
Cfg    { material: PVC|ALU, system, type, W, H, topH, mirror,
         colOut, colIn, sameColour, ralOut, ralIn,       // ralX used when the colour kind is 'lacq'
         glazing, handle, security, hinges, doorPanel, doorLock, doorHandle, threshold,
         options{ id: qty }, finishIn, finishOut, place, breakout, oldFrame, hours|null }
Pricebook (CORE.samplePricebook)  systems, colours{kind: std|foil|lacq}, lacquer{PVC,ALU} coefficients,
         bicolourPct, uwTarget, glazing{perM2, ug, kg}, handles, security, hinges, door*, options,
         articles, finishIn/Out{perM}, labour, oldFrames, siteItems, company
Grids    grids[systemId][typeId] = { w:[mm], h:[mm], p:[[price per h row][per w col]] }
```

Product types are in `CORE.TYPES` (14 types, codes WS-W10 … WS-S20; PSK is PVC only).

## Pricing rules

1. Grid price at the next width and height step up. A size outside the grid is an error.
2. Colour per side: standard or foil adds `pct`% of the grid price; lacquer adds `grid × (coefficient − 1)`. The coefficient lives in `pb.lacquer` and is never shown to the client. Different inside/outside colours add `bicolourPct`.
3. Glass `perM2 × area`; handles, security and hinges per opening sash; door parts per entrance door.
4. Options per piece, per metre of width, or per m² of element, with `fixed` start cost and `min` charge. Options in the same `group` exclude each other.
5. Finishing per metre of reveal (2 × H + W); breakout adds a disposal cost.
6. Offer level: person-hours (sum of line hours × qty, overridable) × hourly rate, plus site items (container, crane with minimum, lift, travel that follows the days on site).
7. Line discount on the product; offer discount on everything; then VAT (21 / 6 / 0 %).

**All prices, limits and coefficients are samples.** Grids come from a formula fitted on Eko4u dealer prices: PVC about −62 + 273 €/m², ALU about 85 + 356 €/m².

## Technical checks and BOM

`CORE.checks()` compares, per opening sash, width, height and weight (glass kg/m² × area + profile kg/m × perimeter) with the system limits. It also flags glass panes over `maxGlassM2`, Uw over `uwTarget`, and RC2 without safety glass. An `err` blocks "Add to offer"; a `warn` does not. `CORE.geometry()` and `CORE.bom()` are approximations (frame 70, mullion 80, glass inset 55 / 15 mm), not production data.

## Storage

- **In the claude.ai Artifact:** `claude.use('db')`. Paths: `quotes/<id>`, `settings/pricebook`, `pricegrids/<systemId>`.
- **Capabilities:**
  ```json
  {"db":{"rules":[{"path":"","read":"interact","write":"interact"},{"path":"settings","read":"interact","write":"admin"},{"path":"pricegrids","read":"interact","write":"admin"}]},"downloads":true,"user":{},"sample":{}}
  ```
  Only editors change prices. `sample` powers "Read with AI".
- **Anywhere else:** `localStorage` keys `wscpq.quotes`, `wscpq.pricebook`, `wscpq.grids`, `wscpq.prefs` (language, offer language, default VAT, default material).
- **Merging:** `fillPb()` adds missing top-level price-book keys from the sample, so older saved price books keep working.

## Languages

The UI is written in English. `i18n.js` translates the DOM after rendering through a MutationObserver: text nodes plus `placeholder`, `aria-label` and `title`. It keeps the original English in a WeakMap, so switching language re-translates in place.

- **Lookup order:** exact entry in `dict.js` → case-insensitive → regex patterns (`I18P`, for numbers and composed texts) → split on ` · `, ` — `, ` / `, `, ` → word fragments in price strings.
- **Offer language:** set per quote (`q.lang`). `#doc[data-i18n-lang]` and `translateDocString()` render the offer in the client's language.
- **Adding a UI text:** add one `EN|NL|FR` line to `dict.js`, or a pattern for dynamic text. Run `npm run test:i18n`.
- **Not translated:** user-typed names. Translations were not reviewed by native speakers. Check trade terms such as dagkant/ébrasement and draai-kip/oscillo-battant.

## Known limitations

- **Sample data:** prices, sash limits, glass weights, Uw target 1.5 and lacquer coefficients (PVC 1.22, ALU 1.06) are placeholders.
- **No users or roles** beyond the Artifact's edit rights; no backend; no ERP or order link.
- **Printing:** offers download as HTML; there is no PDF export (printing is blocked inside the Artifact frame).
- **Leftover wood code:** `WOOD` remains in `MAT_BASE`, `PROFILE_KG`, `MAT_NAME`, `MAT_DESC` and in regexes. It is harmless and can be removed.
- **Duplicate functions:** see "Override chain".

## Next steps (from the proposal doc, phase 1 → 2)

1. Load real price grids for two systems, through Price book → Price grids → Import CSV, or the full JSON.
2. Customer variant view without cost prices; branded PDF and e-signature.
3. Margin guard: minimum margin per offer, approval above a discount.
4. Refactor: Vite + TypeScript modules, remove the override chain, unit-test `core.js` (it already runs in Node).
5. Shared backend for the Vercel version: logins and roles plus a database for quotes and the price book. Vercel Functions in `api/` with a hosted Postgres from the Vercel Marketplace would fit. Move `Store` behind an interface so the Artifact db, localStorage and this backend are interchangeable. Until then each Vercel user's data lives only in their browser.
6. Supplier data import (profiles, limits), price from the BOM, order to ERP.

Open decisions for Winsol:
- build our own engine or license one (Hive CPQ already has Belgian supplier data);
- which ERP and format;
- who owns the price book;
- which two systems go first;
- the three pilot sales reps.

## Background: Eko4u analysis

Eko4u (eko4u.com) is Eko-Okna's dealer portal. Quotes there are built from WinPro-drawn products, and orders go through an account manager rather than straight from the dealer. The WINSOLA account had quoting disabled, so the analysis used saved quotes only, read-only. Hive CPQ (Belgian; Reynaers uses it for ReynaQuote) is the model for the pro features. No credentials or client data are stored in this repo.
