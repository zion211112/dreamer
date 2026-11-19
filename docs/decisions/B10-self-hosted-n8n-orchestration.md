# B10 — Self-Hosted n8n Quality Orchestration

| Field | Value |
|-------|-------|
| Decision ID | B10 |
| Date | 2026-11-19 |
| Rationale | APT-LABS AUTONOMOUS TRANSFORMATION MANDATE §10 specifies self-hosted n8n for quality orchestration. n8n coordinates kinetic actions (commit, assign, verify, settle, produce) by calling back into the APT-LABS API. Self-hosted (Docker) keeps orchestration within APT-LABS infrastructure. |
| Scope | `n8n/workflows/` — five APT-LABS action workflows; `n8n/nodes/` — custom APT-LABS action nodes if needed; n8n Docker deployment configuration |
| Status | Accepted |
| Dependencies | n8n (self-hosted, Docker), APT-LABS API endpoints for action callbacks |
| Supersedes | None (new capability) |

## Five n8n workflows

| Workflow | Kinetic action | Trigger | APT-LABS API callback |
|----------|---------------|---------|----------------------|
| W1 | Commit | Proposal approved in Commons | POST /api/commit |
| W2 | Assign | Crew assigned in Workbench | POST /api/assign |
| W3 | Verify | Evidence submitted in Records | POST /api/verify |
| W4 | Settle | Settlement recorded in Workbench | POST /api/settle |
| W5 | Produce | Output/outcome recorded | POST /api/produce |

## Security constraints (mandate §3)

- n8n must not directly execute unreviewed arbitrary model-generated shell commands.
- All n8n action calls must validate authorization before writing to the event ledger.
- n8n callbacks write event-ledger records (append-only, per P6 in CAPABILITY_PRESERVATION_REGISTER.md).
- Production deployment of n8n requires an explicit human approval gate (mandate security constraint).

## Implementation approach

1. Create `n8n/workflows/` with workflow definitions (JSON) for W1–W5.
2. Each workflow validates the incoming payload, calls the corresponding APT-LABS API endpoint, and records the result in the event ledger.
3. Custom n8n nodes (if needed) go in `n8n/nodes/`.
4. Docker deployment configuration for self-hosted n8n.
5. Workflows are reviewed and approved before activation (human approval gate for production).

## Verification

- Each workflow definition validates against n8n workflow schema.
- API callbacks return success/failure that the workflow handles.
- Event-ledger records are append-only with hash anchors (per roll.ts pattern).
