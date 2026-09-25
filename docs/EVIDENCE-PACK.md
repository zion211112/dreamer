# APT-LABS — Core Evidence Pack

**This is the human evidence record.** `lib/company.ts` is the runtime source of
truth for what the public site may claim. `scripts/audit-company.js` cross-checks
the two in CI — they may not disagree.

**Rule of the pack:** unknown ≠ zero · planned ≠ completed · prototype ≠ deployed ·
demo data ≠ impact data · intention ≠ evidence.

Every entry carries one of seven states:

| State | Meaning |
| --- | --- |
| `VERIFIED` | Evidence exists in this repo or is documented and citable |
| `DEMONSTRATION` | Ships as sample data so a reviewer can inspect the interface |
| `PROTOTYPE` | Built and running locally; not deployed to an institution |
| `TARGET` | Intended outcome, not yet achieved |
| `PLANNED` | Designed but not yet built |
| `UNKNOWN` | Not known. Never render as zero, never omit silently |
| `DECLARED` | Stated by APT-LABS but not independently verified |

---

## 1. Company

APT-LABS is a Kenyan technology and infrastructure company building locally owned, resilient institutional systems for schools, training centres, creative facilities and other organizations operating under connectivity, cost and supply-chain constraints. It combines four capabilities: offline-first software, locally fabricated hardware, creative-computing infrastructure, and transparent technical documentation.

- **Operating geography:** Kirinyaga, Kenya — `DECLARED` (stated by the organisation; not an independently verified field presence).
- **Organisation legal status:** `UNKNOWN` — not published until documented. Do not invent registration numbers, PBO/company numbers or founding dates.
- **Contact record:** `VERIFIED` in the current project record — `aptlabske@gmail.com` and WhatsApp `+254 704 260 906`.
- **Doctrine (internal only):** *Sovereign Infrastructure*. Never rendered on a public route.

## 2. Founder / Team

`UNKNOWN` — not yet documented in this pack. No names, titles, bios or photographs
may appear on public routes until they are recorded here with evidence.

## 3. Problem

> Institutions increasingly depend on technology they cannot fully own, repair,
> reproduce or afford to maintain.

Response:

> APT-LABS converts locally available technical capacity into institutional systems
> that can be deployed, operated, repaired and reproduced locally.

State: `VERIFIED` as the organisation's stated problem framing — it is a framing,
not a measured statistic. No market size, no enrolment figures and no
cost-of-failure numbers are claimed anywhere, because none are yet sourced.

## 4. APT-LABS Architecture

One infrastructure system, four faces, one intake layer, one evidence model.

```text
                 APT-LABS
                    │
        ┌───────────┼───────────┐
        │           │           │
      DEPLOY       FAB        STUDIO
        │           │           │
        └───────────┼───────────┘
                    │
                 THE ROLL
          ┌─────────┴─────────┐
       PEOPLE               ASSETS
          ▲                   ▲
          └──── BENBEN / ────┘
               THE FLOOR
```

Operating loop:

```text
imported / subscription-dependent → APT-LABS architecture → bounded pilot
→ measured cost / performance / adoption → documented local production
→ replication kit → institutional scale
```

Status ledger — this table is machine-checked against `lib/company.ts`:

| Face | Status | Public route | Application route |
| --- | --- | --- | --- |
| APT Deploy | PROTOTYPE | /deploy | /console |
| APT Fab | PLANNED | /fab | — |
| APT Studio | PLANNED | /studio | — |
| The Roll | PROTOTYPE | /roll | /ledger, /roll/assets |

## 5. APT Deploy

Offline-capable institutional software for schools and training institutions.

**What exists today (`PROTOTYPE`, verifiable by running the build):**

- Nine modules and ten tools: Content Studio, Auto-Marking, My Day, Timetable,
  Roster, Reports, Fees, Inspection, Comms (`lib/console.ts`).
- Local-first by construction: the session, favourites and records live on the
  device (`localStorage`); nothing typed in the console leaves the browser.
- Honest network line in My Day — the UI reports `Online` / `Offline` and today's
  record count (`components/console/MyDay.tsx`).
- Assessment craft: a CBC-grounded content audit — traceability, cognitive
  demand, hooks, marking keys, budgets (`lib/audit.ts`) — plus marking,
  timetable, fee and inspection engines in `lib/`.
- CSV roster in and out, plus a one-file school backup.

**What does not exist:** any verified school deployment. The console is a local prototype with no account or credential gate; anything entered stays in the browser unless exported.

## 6. APT Fab

Locally designed and fabricated institutional equipment — documented design →
bill of materials → sourcing → fabrication → installation → repair.

**State: `PLANNED`.** No fabrication record exists in this repository yet.

Doctrine for sourcing, quoted verbatim wherever this face appears:

> **Local where practical. Import where necessary. Document the difference.**

Do not claim "100% local". Do not describe imported components as failures.

## 7. APT Studio

Local creative-computing infrastructure: workstations, media production,
animation, AI-assisted production where applicable, and technical skills work.

**State: `PLANNED`.** The Mwea Animation Box is carried as a **module /
demonstration node** of this face — not an independent venture.

No jobs, revenue, render counts or production volumes may be claimed: none are
evidenced.

## 8. The Roll

One ledger, two registers. Same seal, same hash machinery, same trust model.

| Register | Route | State | Contents |
| --- | --- | --- | --- |
| People | `/ledger` | `PROTOTYPE` | Names, skills, credentials, seals |
| Assets | `/roll/assets` | `PROTOTYPE` | Designed / purchased / fabricated / installed / repaired / trained / tested / accepted / documented |

Mechanics that exist in code (`VERIFIED`): a SHA-256 seal per entry
(`lib/hash.ts`), a rolling master seal over the register (`lib/ledger.ts`),
CSV and JSON export, and credential verification that returns existence and not
identity.

The register ships empty. Any local record created on the page is labelled and remains on that device until export.

## 9. BenBen / The Floor

**Intake layer — not a company face.**

```text
local capability → Floor → verification → APT Fab / APT Studio
                → The Roll evidence → reusable asset
```

State: `PROTOTYPE`. The Floor starts with empty slots. Build posts are organised by
 domain with needs, thresholds and expiry. The name is kept because users know it;
 the company-level framing is demoted.

## 10. Current Prototype State

`VERIFIED` — reproducible from a clean checkout:

- `npm run build` succeeds; all routes compile.
- `npm test` — 41 tests pass.
- `node scripts/audit-classes.js` — zero undefined class names.
- `node scripts/audit-funder.js` — route metadata, empty registers, no fake gates, legacy demo constants, and grant lenses are coherent.
- Public routes: `/`, `/deploy`, `/fab`, `/studio`, `/roll`, `/roll/assets`,
  `/about`, `/evidence`, `/ledger`, `/benben`, `/contact`, with the console
  application at `/console`.

## 11. Pilot Partner(s)

`UNKNOWN` — **no pilot partner is documented.** No school, county department,
training centre or cooperative may be named as a partner anywhere on the site or
in a submission built from this pack until the relationship and its scope are
recorded here.

## 12. Unit Economics

`UNKNOWN` — unit costs are not yet measured. No cost-per-learner, no
cost-per-school and no comparison against subscription alternatives may be
published until a measurement exists with a date and a method.

## 13. Local Procurement

`UNKNOWN` — no procurement has been recorded. Kagio fabrication capacity is a
stated focus area, not a documented supplier relationship.

## 14. Impact Metrics

No `VERIFIED` impact metrics exist.

Published metrics in `lib/company.ts` carry an explicit state. Currently:

| Metric | State | Provenance |
| --- | --- | --- |
| Public server-backed people register | `UNKNOWN` | No shared server-backed register is published; the local interface starts empty |

Runtime counts rendered by a page (entry totals, seal digests) are computed live
from the data on the device — they are readings, not claims, and must not be
quoted in a submission as reach.

## 15. Technical Evidence

`VERIFIED` within this repository:

- Sealing and hashing: `lib/hash.ts`, `lib/ledger.ts`.
- Content audit rules an education engineer can sign off on: `lib/audit.ts`.
- Marking, forecasting, timetable solving, fee reconciliation, inspection export:
  `lib/mark-engine.ts`, `lib/kcse.ts`, `lib/timetable.ts`, `lib/fees.ts`,
  `lib/inspection.ts`.
- Local-first data: `lib/db.ts`, console session and favourites on device.
- CI: tests, lint, typecheck, build, and the class / company / funder audits.

## 16. Photos / Media Evidence

`UNKNOWN` — there is no `public/` directory and no photograph on the site.
Nothing visual may be described as documentation of field work until it is added
and dated here.

## 17. BOMs

`PLANNED` — none published. The asset register accepts a BOM field per asset;
assets without one are marked accordingly.

## 18. Asset Register

Implemented at `/roll/assets` with states:

`PLANNED` → `PROTOTYPE` → `FABRICATED` → `INSTALLED` → `TESTED` → `ACCEPTED` → `VERIFIED`

**Initial content: none.** An empty register is correct. The register must never
be back-filled with assets that have no evidence; if an asset has no evidence it
is `PLANNED`, `PROTOTYPE`, `UNVERIFIED`, or omitted.

## 19. Replication Model

The claim is not "we built a thing". The claim is: *another institution should be
able to understand what was built, what it cost, why it worked or failed, and
what would be required to reproduce it.*

Delivered through `/evidence`: designs, BOMs, technical notes, licensing,
methodology and verification state. Currently `PLANNED` for the hardware side and
`PROTOTYPE` for the software side.

## 20. Known Unknowns

- Founder / team record not documented.
- Legal registration status not documented.
- No measured unit economics.
- No recorded procurement.
- No photographed field evidence.
- No dated deployment history.

## 21. Claims That Are Not Yet Verified

Explicitly prohibited on public routes and in every submission until the pack
records evidence:

- "APT-LABS is funded by…"
- "partnered with…"
- "serves N students…" / any beneficiary count
- "saved KES X…"
- "100% local…"
- "open source…" for any component whose licence does not say so
- any named school, county or partner as a deployment
- any registration number, award, certification or grant status
