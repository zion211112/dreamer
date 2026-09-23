# APT-LABS — Fast Launch & Deploy

The app is static-friendly and Vercel-ready (`vercel.json` pins `npm ci` → `next build` → `.next`).
Launch is a **config** step, not a code step. Four tiers below; do as much as you need.

## Tier 0 · Ship now (~2 min)
1. Push the repo to GitHub/GitLab.
2. Vercel → **Add New → Project** → import the repo. Framework auto-detects Next.js and uses `vercel.json`.
3. Deploy. You get a live `https://apt-labs.vercel.app` (or your team URL) immediately.

CLI alternative:
```bash
npx vercel login
npx vercel --prod     # first run: name it, link the Git repo
```

## Tier 1 · Make it not look like a prototype
1. Point a real domain (e.g. `apt-labs.co.ke`) at Vercel: Project → **Domains** → add domain → set the
   `CNAME` (or `A`/`CNAME` to `cname.vercel-dns.com`). Vercel auto-provisions TLS.
2. Set the env var so public pages advertise the real address:
   - Vercel → Project → **Environment Variables** → `NEXT_PUBLIC_BASE_URL` = `https://your-domain`
     (add to Production **and** Preview).
   - Locally: copy `.env.example` → `.env.local`, set the value.
3. Redeploy (env vars are inlined at build). Verify: `/robots.txt`, `/sitemap.xml`, the OG tags, and
   the `/brief` QR all use your domain now.

## Tier 2 · The handout
`/brief` is a one-page, print-ready brief with a QR that deep-links to the live ledger. Print at A4 —
the nav/footer are stripped on `@media print`.

## Tier 3 · Before you hand a laptop to someone
- `/ledger` — open the roll, seal/verify a record, share the link.
- `/console` — the gate is `RUNPILOT` / `PILOTRUN` (case-insensitive). It's a **demo lock**, not a boundary.
- Mobile — confirm `/ledger` seal/verify and the console gate on a phone viewport.

## Local
```bash
npm install
npm run dev                 # http://localhost:3000
npm run build && npm start  # production build
npm run test               # node --test (tests/*.test.cjs)
```

## Notes
- `.env.example` documents the single required env var; leave `NEXT_PUBLIC_BASE_URL` unset for the Vercel fallback.
- The console gate credentials are a demo lock (`lib/console.ts`), not a security boundary.
