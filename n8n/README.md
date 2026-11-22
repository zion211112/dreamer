# APT-LABS n8n Workflows

## Workflows

| File | Purpose |
|------|---------|
| `commons-intake.json` | Register new inquiries from Commons, notify steward |
| `workbench-commitment.json` | Track commitments and deadlines from Workbench |
| `evidence-verification.json` | Verify evidence records and notify DSH orchestrator |

## Usage

Import each JSON file into n8n via **Import → From File**, then activate each workflow.

## Connections

- **Commons Intake**: Webhook → MongoDB insert → Notification record
- **Workbench Commitment**: Webhook → Commitment record → Need update → Deadline (conditional)
- **Evidence Verification**: Webhook → Evidence lookup → Verification update → Audit log → DSH notify