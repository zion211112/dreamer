# Project guardrails

- Keep the active application Vite + Preact. Do not reintroduce Next.js or a
  backend as part of a login-page iteration.
- Keep the current task limited to sign-in and sign-up unless the user expands
  the scope. Leave unrelated routes and behavior unchanged.
- Put shared visual tokens and auth-page styles in `src/styles.css`; reuse
  controls from `src/components/`.
- Be explicit that authentication is a browser-local demo. Do not store
  passwords or present demo identities, OAuth buttons, or workspace records as
  connected services or live transactions.
- Keep old implementation and design experiments in `bin/` only when they are
  useful for reference. Never put credentials, `.env` files, keys, dependency
  directories, or build output in the archive.
- Prefer one small, reviewable change at a time. Run `npm run build` before
  shipping; do not add tooling or dependencies without a concrete need.
