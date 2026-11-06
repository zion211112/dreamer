# Project guardrails

- **Speed and wit are rewarded.** Prefer the smallest change that ships. Ship fast, ship small, ship working. Delete before you refactor; refactor before you add. Never rebuild what already works just to look busy.
- Do not break the working build. Every phase must leave `npm run build` and `npm run test:unit -- --run` green before starting the next. 