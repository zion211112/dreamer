# APT-LABS Investor Deck

The deck is authored with Open Slide and deployed as static output under `/investor-memo/` in the root Vercel site. It is intentionally isolated from the root Preact/Vite application.

## Commands

Run from the repository root:

```bash
npm run dev --prefix investor-deck/open-slide
npm run build --prefix investor-deck
```

The root `npm install` lifecycle installs this nested workspace. The root production build copies `open-slide/dist/` into `dist/investor-memo/`.

## Content rules

Do not present draft fundraising terms, unverified project status, learning outcomes, or the supplied photographs as established facts. Keep MTO Works and Kemetos distinct; label the hydro context and learning-environment proposal as unverified until their release gates are cleared.
