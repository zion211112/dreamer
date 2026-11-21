# Government Software Audit — Kenya

Catalogue of Kenyan government software systems: what they are, what they fail at, what capability is required to fix them, and how developers can responsibly propose replacements.

**Purpose:** Kenyans can audit these systems and propose developers who can outdo current providers. Kenyans post audit intentions in APT-LABS; developers match via the declarative matching engine and propose replacement or improvement builds.

**Evidence standard:** Provider attribution is deliberately conservative. Specific vendor names are not asserted as fact. Where public reporting exists, it is labelled "reported per public sources." Where unknown, the provider field is "UNKNOWN." No claim about any specific contract, procurement, vendor relationship, or procurement value is made without a verifiable source.

Evidence label: **PLANNED** — no systems registered in production yet.

---

## Systems list

| ID | System | Purpose | Sector | County | Provider attribution | Known issues | Capability required | Replacement opportunity |
|----|--------|---------|--------|--------|----------------------|--------------|---------------------|------------------------|
| gov-nhif-claims | NHIF e-Claims / portal | National Hospital Insurance Fund claims, membership, hospital reimbursement | Health | Nairobi | UNKNOWN | Claims processing speed; fraud detection gaps; hospital reimbursement delays; reimbursement transparency | claims-processing, fraud-detection, reimbursement-transparency | Faster claims adjudication with open audit trail |
| gov-kra-itax | KRA iTax | Tax filing, payment, and collection | Finance | Nairobi | KRA IT + systems integrators (stack elements reported per public sources) | Filing UX complexity; payment reconciliation; audit trail integrity; downtime during filing periods | tax-filing, payment-reconciliation, audit-trail | Simpler filing interface with real-time receipt verification |
| gov-ecitizen | eCitizen | Government services portal (passports, permits, business registration) | Public Administration | Nairobi | ICT Authority + various vendors | Service discoverability; payment integration; identity verification; service downtime | service-discovery, identity-verification, payment-integration | Community-built service directory with real-time status and user ratings |
| gov-ifmis | IFMIS | Integrated financial management — government accounting, budget execution, procurement | Finance | Nairobi | ERP vendors (SAP/Oracle implementations) + local systems integrators | Budget transparency; procurement audit; fund flow tracking; payment delay visibility | budget-transparency, procurement-audit, fund-flow-tracking | Open procurement ledger with verifiable bid evaluation and award records |
| gov-ardhisasa | Ardhisasa | Land registry digitization — title search, transfer, registration | Lands | Nairobi | Ministry of Lands + ICT Authority + vendors | Title search speed; fraud prevention; boundary verification; record digitization backlog | land-title-search, boundary-verification, fraud-prevention | Community land record verification with crowd-sourced boundary evidence |
| gov-nims | NIMS / Huduma Namba | National identity biometrics — enrolment, deduplication, verification | Home Affairs | Nairobi | UNKNOWN | Biometric data security; deduplication accuracy; enrolment access in rural areas | biometric-verification, deduplication, enrolment-access | Open identity verification API with local custody and audit |
| gov-helb | HELB portal | Higher education student loans — application, disbursement, repayment | Education | Nairobi | UNKNOWN | Loan disbursement tracking; repayment transparency; defaulter communication | loan-disbursement-tracking, repayment-transparency | Student loan dashboard with verifiable disbursement proof and repayment schedule |
| gov-tveta | TVETA accreditation system | Technical/vocational institution accreditation and quality assurance | Education | Nairobi | UNKNOWN | Provider quality data; audit trails; inspection records; graduate outcomes | provider-quality-tracking, inspection-records, graduate-outcomes | Public TVET provider scorecard with verified graduate placement data |
| gov-kncc | KNEC examination system | National exam management — registration, results, certificates | Education | Nairobi | UNKNOWN | Result integrity; exam leakage prevention; certificate verification; result release timing | result-integrity, exam-leakage-prevention, certificate-verification | Open examination integrity log with verifiable result anchors |
| gov-eprocurement | e-Procurement (IFMIS module) | Government tender management — bid publication, evaluation, award | Finance | Nairobi | National Treasury + ICT Authority + vendors | Tender transparency; bid evaluation audit; award justification; corruption risk | tender-transparency, bid-evaluation-audit, award-justification | Public tender observatory with verifiable bid evaluation and conflict-of-interest flags |
| gov-epermit | e-Permit / immigration | Immigration services — work permits, visas, citizenship | Home Affairs | Nairobi | Department of Immigration + vendors | Permit processing times; fee transparency; application status visibility | permit-processing, fee-transparency, status-visibility | Community permit tracking with verified processing time benchmarks |

11 systems. Sectors: Health (1), Finance (3), Public Administration (1), Lands (1), Home Affairs (2), Education (4).

---

## Audit angles

Every system can be audited against these dimensions:

1. **Processing speed** — how long does the core transaction take?
2. **Transparency** — can a citizen see status, cost basis, and decision rationale?
3. **Access** — is it reachable from rural and low-bandwidth areas?
4. **Integrity** — is there an immutable audit trail of who did what and when?
5. **Fraud** — what known fraud vectors exist, and how are they controlled?
6. **Cost** — what does the system cost to run per transaction? Who pays?
7. **Interoperability** — can it exchange data with other government systems?

---

## Audit protocol

A rigorous audit of any listed system follows these steps:

1. **Identify the system** by official name and ID from the list above.
2. **Observe the failure mode** — document the specific problem with date, location, and affected users. Do not generalize from a single observation.
3. **Cite public sources** — where a vendor name is mentioned, ground it in public reporting, not assumption.
4. **Propose capability** — state which capability category from the "Capability required" column the replacement would address.
5. **State limitations** — acknowledge what the audit does not establish (contract values, procurement decisions, vendor relationships).
6. **Submit audit intention** — post via `postAuditIntention` in APT-LABS, gated by `intention:write`.

---

## Developer matching

A developer matches to an audit intention when the developer offers a capability in one of the system's required capability categories. A need with no matching provider is surfaced as `isMissing` — the concrete, actionable gap.

The matching engine (`matchNeeds`) is declarative and inspectable: every match carries a `matchedOn` explanation, so a Kenyan citizen can see *why* a developer was matched to a particular system audit.

---

## How developers can responsibly propose replacements

1. **Register as a provider** — declare capabilities matching one or more required categories above.
2. **Post an audit proposal** — cite the system ID, failure modes observed, proposed capability, and evidence for claimed superiority (benchmarks, open-source references, prior deployments).
3. **Do not claim a contract** — proposing a replacement is not winning one. Procurement decisions remain with the responsible government body.
4. **Do not cite unverified vendors** — if you name an incumbent provider, ground it in public reporting, not assumption.
5. **Respect data sovereignty** — no Kenyan citizen data leaves local custody without explicit authorisation.

---

## Conflict-of-interest standards

- A developer proposing a replacement for a system must disclose any prior or current relationship with that system's operator.
- A government official serving as an institutional steward must recuse themselves from audit intentions involving their own ministry or department.
- APT-LABS administrators must not have financial interests in providers matched to audit intentions.

---

## Reproducibility standards

- Every audit intention must cite the specific failure mode observed.
- Every matching result must carry a `matchedOn` explanation.
- Every replacement proposal must identify the capability category it addresses.
- No claim about a vendor, contract, or procurement is reproducible without a public source.

---

## What this is NOT

- Not a procurement platform: developers propose; governments decide.
- Not a vendor directory with verified provider rankings.
- Not a claim that any listed system is defective beyond its listed known issues.
- Not a list of contract values, procurement dates, or vendor selections.
- Not an endorsement of any specific replacement approach.
- Not a substitute for formal procurement processes.

---

## Data protection and compliance

Kenya's Data Protection Act (2019) and Office of the Data Protection Commissioner (ODPC) obligations apply:

- Personal data remains under local custody.
- Audit intentions must not publish personal data about identified individuals.
- No blockchain anchoring of personal data (charter A8).
- Citizens retain rights to access, correct, and object to processing of their data.

---

## Deferred items

| Item | Reason |
|------|--------|
| Provider contact details | Not collected; no claim about procurement relationships |
| Contract values and award dates | Not verifiable from public sources |
| Live integration with government APIs | Production backend deferred |
| Third-party certification of audit results | External verification not in scope |
| Vendor verification program | Would require independent audit capacity |

---

*Last updated: 2026-11-21. Evidence label: PLANNED. Aligned with charter A1–A10 and decisions B1–B8.*