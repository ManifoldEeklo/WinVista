# WinVista

PVC and ALU window and door CPQ for Winsol: client → configure → price → offer, in English, Dutch and French.

## Run locally

```bash
npm run build      # writes public/ (web app) and dist/ (stand-alone + claude.ai versions)
npm start          # builds and serves public/ on http://localhost:3000
```

## Deploy on Vercel via GitHub

1. Create an empty GitHub repository, for example `winsol/winvista`, then push this folder:
   ```bash
   git init && git add . && git commit -m "WinVista 0.9.0"
   git branch -M main
   git remote add origin https://github.com/<your-org>/winvista.git
   git push -u origin main
   ```
2. In Vercel: **Add New… → Project → Import** the repository. Vercel reads `vercel.json`:
   - no framework, no install step;
   - build `node build.mjs`;
   - output folder `public`.

   Leave the other settings as they are and click **Deploy**.
3. Every push to `main` deploys to production; every pull request gets a preview URL. GitHub Actions runs the Playwright smoke test on each push (`.github/workflows/test.yml`).
4. Optional:
   - add a custom domain, such as `winvista.winsol.be`, under Project → Settings → Domains;
   - restrict access under Settings → Deployment Protection (Vercel Authentication or password).

On Vercel, offers and the price book are stored in each browser's local storage. They are not shared between users or devices yet; a shared backend is the next step (see `CLAUDE.md`). Use Price book → Import / export to move a price book between devices.

## Tests

```bash
npm i && npx playwright install chromium
npm test           # smoke test, desktop and phone
npm run test:i18n  # English texts still visible in NL/FR
```

Read `CLAUDE.md` before changing code.
