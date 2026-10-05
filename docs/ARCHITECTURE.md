# APT-LABS System Architecture

## What this codebase represents

APT-LABS is a company building sovereign infrastructure. Its central idea is
that institutions and communities should retain custody over records,
contribution, physical infrastructure and allocation decisions. Products are
applications of that system; no single vertical or application defines the
company. This is not an agent-building platform.

The system has a software layer and an intended physical layer. Its public
model distinguishes what is implemented from what is designed. At the current
repository state, Record has one locally openable prototype. Identity, Build,
Infrastructure and Allocation remain planned.

## Three distinct models

These models describe different things and must not be collapsed into one
five-step diagram.

### Sovereignty stack

`STACK` in `lib/system.ts` describes the layers of control, ordered by
dependency:

| Layer | Instrument | Purpose | Repository state |
| --- | --- | --- | --- |
| Record | — | What happened, recorded where it happened and kept there | `PROTOTYPE` |
| Identity | The Roll | Who contributed and what work supports their standing | `PLANNED` |
| Build | The Studio | Work developed in the open with its record visible | `PLANNED` |
| Infrastructure | The Fab | Physical power, water and connectivity at a node | `PLANNED` |
| Allocation | BenBen | Community decisions under rules visible before a decision | `PLANNED` |

The School Console is one application of Record. It does not represent the
other layers and it does not define the company.

### Inspection topology

`PLANE` is the five-node inspection model used by the topology and system
register routes:

| Node | Route | Role |
| --- | --- | --- |
| Field | `/console` | Capture activity at the point it occurs |
| Register | `/register` | Give claims identifiers, sources and evidence states |
| Intelligence | `/intelligence` | Derive traceable signals from records |
| Control | `/control` | Apply explicit rules through human decisions |
| Evidence | `/evidence` | Define what claims and states permit |

The company homepage (`/`) is not a topology node. It introduces APT-LABS,
the sovereignty stack and its products. `app/sitemap.ts` lists it separately;
the device-local Console is omitted from indexing.

### Operational value chain

`VALUE_CHAIN` describes seven transformations that connect activity to
accountable learning: Observe, Record, Structure, Interpret, Decide, Execute
and Measure. It is a process model, not a second stack. The final measure
returns to observation, closing the loop. `components/site/ValueChain.tsx`
renders the chain and connects stages to the inspection node each one uses;
`components/site/lattice/Lattice.tsx` renders the interactive topology.

## Product facts and boundaries

- **School Console** is a school operations management system and the only
  openable application in this repository. Its interface and tools run
  locally. Its seeded school records are invented and labeled
  `DEMONSTRATION`; the prototype is not deployed and has no customer or
  outcome claim.
- **Tender System** is a product line named by APT-LABS. This repository does
  not document its scope, implementation, adoption or results. The product
  identity is named; its delivery state remains unestablished here.
- **Commissioned MVP** and **Build Studio** are catalogued build tracks at
  `PLANNED`; they are not launched product surfaces.

`CONSOLE` and `TENDER_SYSTEM` live in `lib/system.ts`. Console module and tool
details live in `lib/console.ts`. Product-specific detail belongs on
`/product`; architecture routes must not turn demonstration data into claims
about real institutions.

## Claim and data contract

Every public claim has an evidence state. The state is structural, not a badge
that can be upgraded by styling:

| State | Meaning |
| --- | --- |
| `VERIFIED` | An inspectable evidence path exists |
| `PROTOTYPE` | Built and openable locally; not necessarily deployed |
| `DEMONSTRATION` | Working surface populated with invented data |
| `TARGET` | Intended outcome, not current performance |
| `PLANNED` | Designed, not built |
| `UNKNOWN` | The value is not established; it is not zero |

The contract and its permitted language are defined by `EvidenceState`,
`STATE_RULES` and `UNKNOWN_FACTS` in `lib/system.ts`. `StateTag` renders the
state as text with a redundant visual mark. Unknowns remain explicit;
prototype status must not imply deployment; demonstration data must not be
presented as real activity.

## Public routes

| Route | Responsibility |
| --- | --- |
| `/` | Company, stack, portfolio and operating thesis |
| `/stack` | Five-layer sovereignty model and Identity constraints |
| `/lattice` | Interactive topology, products and value-chain visualization |
| `/register` | Register definitions and record grammar |
| `/intelligence` | Derived signals and methods |
| `/control` | Decision, contribution, allocation and execution rules |
| `/evidence` | Evidence-state contract and declared unknowns |
| `/product` | School Console product facts and capabilities |
| `/console` | Local School Console prototype |
| `/console/[id]` | Individual Console tool |

## Code map

| Path | Responsibility |
| --- | --- |
| `app/(site)/` | Public company and system routes |
| `app/(console)/console/` | Device-local product prototype and tools |
| `components/site/` | Company presentation, stack, topology and registers |
| `components/console/` | School Console modules, tools and local interactions |
| `components/epistem/` | Structured evidence, claim review and human-judgment surfaces |
| `lib/system.ts` | Canonical company, stack, node, value-chain, product and claim-state data |
| `lib/console.ts` | Console-specific product catalogue |
| `lib/proto-school.ts` | Invented seed data for the Console demonstration only |
| `lib/epistemic/` | Claim, source, inference, guard and trace domain logic |
| `lib/lattice.ts` | Topology layout and derived graph data |
| `scripts/` | Type, scale, contrast, vocabulary and epistemic checks |

The public site imports system-level data from `lib/system.ts`. Console
implementation details remain in the Console domain; the lexicon audit checks
that Console vocabulary does not leak into architecture claims.

## Development and verification

Requirements: Node.js 18.17 or later.

```sh
npm install
npm run dev
```

Useful checks:

| Command | Checks |
| --- | --- |
| `npm run typecheck` | TypeScript project |
| `npm run lint` | Next.js ESLint rules |
| `npm run check:scale` | Typography, spacing and drift invariants |
| `npm run check:contrast` | WCAG contrast and evidence-state ordering |
| `npm run check:lexicon` | Public vocabulary and import boundaries |
| `npm run check:epistemic` | Runtime evidence and claim-guard behavior |
| `npm run check` | All checks plus production build |

Before changing homepage framing, verify the stack, topology, value chain and
product state in `lib/system.ts`. Before publishing a product capability,
check its owning product module and distinguish implementation from adoption.