# APT-LABS

The active app is a small Vite + Preact project. The current iteration scope is
the sign-in and sign-up experience; the historical Next.js and Supabase work is
kept under `bin/` and is not part of the build.

## Run locally

```sh
npm ci
npm run dev
```

Before shipping a change:

```sh
npm run build
```

## Fast iteration

Keep each pass to one visible outcome, reuse the existing controls and tokens,
and verify it with the production build. Avoid unrelated cleanup or new
dependencies. A small UI iteration should be ready to review in about ten
minutes; split anything larger into separately reviewable changes.

## Sign-in prototype

Email sign-in creates a demo-only browser-local identity so the existing
workspace screens can be previewed. It does not create an account, send a
password, or authenticate against a server. Passwords are not stored. Google
and GitHub sign-in are intentionally disabled until providers are implemented.

## Archive

`bin/` contains historical source and design work for reference only. Do not
import it into the active Vite build. Never archive or commit environment files,
credentials, access tokens, or generated dependency/build folders.
