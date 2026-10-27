<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Treat the Tender as the primary domain entity. Keep lifecycle validation and Roll generation consistent between `src/lib/tender.ts` and the Supabase migration.
- Keep illustrative market records distinct from shared Supabase records. Never present a demo quote, funding figure, or completion as a live transaction.
- Keep School Console records local to the device; do not send student records to Supabase or imply that local storage is encrypted or multi-user.
- Preserve server-side authentication and authorization checks alongside database row-level security for school publication and crew Assembly.
- Keep design tokens and visual roles in `src/styles.css`; use shared controls for interactive UI.
- Funding remains contact-only until an approved payment and compliance design exists. Do not imply connected AI, OCR, or message delivery without an implemented provider.

- **NEVER STOP UNTIL DONE IS DONE** — This is a long-horizon task. Continue working through all implementation steps (component creation, integration, styling, testing, commit, push) without pausing or asking for confirmation unless genuinely blocked. The task is complete only when the new Field Desk workspace is live, verified, and pushed to the remote repository.
