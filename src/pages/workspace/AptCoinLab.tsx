import { useState, useMemo, useEffect } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead, type PageHeadMetric } from '../../components/PageHead';
import { useClock } from '../../hooks/useClock';

interface Distinction {
  id: string;
  term: string;
  category: 'ontology' | 'economics' | 'governance' | 'evidence' | 'risk';
  description: string;
  evidence: { source: string; claim: string; strength: 'strong' | 'moderate' | 'weak'; link?: string }[];
  counterarguments: string[];
  status: 'established' | 'contested' | 'hypothesis' | 'rejected';
  related: string[];
  lastUpdated: string;
}

interface DecisionAxis {
  id: string;
  label: string;
  description: string;
  poles: { label: string; description: string; evidence: string }[];
  currentPosition: number; // -1 to 1
  rationale: string;
}

const DISTINCTIONS: Distinction[] = [
  {
    id: 'productive-value',
    term: 'Productive Value',
    category: 'economics',
    description: 'Value comes from useful work, goods, knowledge, and services — not from minting units. A coin cannot create productive capacity; it can only coordinate or claim it.',
    evidence: [
      { source: 'Field Desk Ontology v0.3', claim: 'Tender → Crew → Asset → Evidence chain shows value originates in coordinated labor and accepted outcomes, not token issuance.', strength: 'strong' },
      { source: 'Roll Verification Protocol', claim: 'SHA-256 anchors commit to undertaking fields (title, scope, deliverables, acceptance) — no token balance field exists in canonical JSON.', strength: 'strong' },
      { source: 'Commons Patterns', claim: 'Solar Commons, Land Trust, Code Commons all operate on contribution accounting, not token balances.', strength: 'moderate' },
    ],
    counterarguments: [
      'Tokens can bootstrap liquidity for early-stage productive work',
      'Token incentives aligned with productive output (e.g., proof-of-useful-work)',
      'Network effects require initial coordination mechanism',
    ],
    status: 'established',
    related: ['evidence', 'rights-and-capital', 'coordination-vs-extraction'],
    lastUpdated: '2026-11-05',
  },
  {
    id: 'evidence',
    term: 'Evidence',
    category: 'evidence',
    description: 'The Roll records contributions and accepted outcomes. A coin cannot prove that work happened — only attested evidence with provenance chains can. Evidence layers (public/participant/restricted) carry the burden of proof.',
    evidence: [
      { source: 'Roll Verification Dialog', claim: 'Canonical fields committed to hash: undertaking ID/type, title, scope, deliverables, commissioner, participants, acceptance. No evidence files, no token balances.', strength: 'strong' },
      { source: 'Annals Chronology Model', claim: 'Recorded sequence: Reference → Proposal → Disposition → Outcome. Each step requires attributable evidence, not token transfers.', strength: 'strong' },
      { source: 'Evidence Storage Spec', claim: 'Three-layer evidence model (public/participant/restricted) with signed URLs and metadata — coins have no equivalent structure.', strength: 'moderate' },
    ],
    counterarguments: [
      'Onchain attestations can serve as evidence (e.g., EAS, Gitcoin Passport)',
      'Zero-knowledge proofs can verify work without revealing details',
      'Token-gated access can protect evidence integrity',
    ],
    status: 'established',
    related: ['productive-value', 'rights-and-capital', 'annals-chain'],
    lastUpdated: '2026-11-07',
  },
  {
    id: 'rights-and-capital',
    term: 'Rights and Capital',
    category: 'ontology',
    description: 'A token can represent a specific, established right (access, governance, revenue share, redemption); it cannot create that right or the wealth behind it. The right must exist independently — in law, contract, or social consensus.',
    evidence: [
      { source: 'Tender Lifecycle', claim: 'Tender authoring creates rights (scope, deliverables, acceptance criteria) before any token could represent them.', strength: 'strong' },
      { source: 'Commons Governance', claim: 'Land Trust stewards hold legal title; Energy Cooperative members hold meter rights. Tokens would be derivative representations.', strength: 'strong' },
      { source: 'Legal Review (Kenya Pilot)', claim: 'KES-denominated obligations remain primary; any token representation requires explicit legal wrapper.', strength: 'moderate' },
    ],
    counterarguments: [
      'Tokens can encode rights natively (ERC-721 for access, ERC-20 for revenue share)',
      'Smart contracts can enforce rights without external legal system',
      'Programmable rights enable new coordination patterns',
    ],
    status: 'contested',
    related: ['productive-value', 'evidence', 'governance-token'],
    lastUpdated: '2026-10-28',
  },
  {
    id: 'coordination-vs-extraction',
    term: 'Coordination vs Extraction',
    category: 'governance',
    description: 'Tokens that coordinate (align incentives, signal demand, enable participation) are distinct from tokens that extract (rent-seeking, speculation, value capture without contribution). The Field Desk only admits coordination tokens with explicit sunset clauses.',
    evidence: [
      { source: 'APT Coin Lab Boundary', claim: 'No coin balances, transfers, rewards, wages, gated access, voting, or work authorization. Project compensation remains explicit KES terms.', strength: 'strong' },
      { source: 'Workbench Simulation', claim: 'Simulations test coordination mechanics without live tokens. Local-only, explicitly marked, never shared as events.', strength: 'strong' },
      { source: 'Commons Patterns', claim: 'Solar Commons uses metering + allocation, not tokens. Land Trust uses resident assembly, not token voting.', strength: 'moderate' },
    ],
    counterarguments: [
      'Coordination tokens inevitably develop secondary markets',
      'Speculation can provide liquidity for coordination',
      'Governance tokens align long-term incentives',
    ],
    status: 'hypothesis',
    related: ['productive-value', 'governance-token', 'sunset-clause'],
    lastUpdated: '2026-11-02',
  },
  {
    id: 'governance-token',
    term: 'Governance Token',
    category: 'governance',
    description: 'If a token governs, it must govern something specific with defined scope, quorum, and dispute resolution. Blanket "governance tokens" are category errors — governance is a process, not an asset.',
    evidence: [
      { source: 'Institution Governance Models', claim: 'MWEA uses sociocracy, Housing Trust uses resident assembly, Solar Commons uses participant assembly + technical advisory. None use token voting.', strength: 'strong' },
      { source: 'Annals Disposition', claim: 'Disposition records who decided, under which rule/delegation, with what rationale. Token weight ≠ authority.', strength: 'strong' },
      { source: 'Workbench Stages', claim: 'Stage gates (Issuer → Crew → Tender → Deploy) are governed by role-based authority, not token holdings.', strength: 'moderate' },
    ],
    counterarguments: [
      'Token-weighted voting enables scalable governance',
      'Quadratic voting mitigates plutocracy',
      'Delegation mechanisms distribute token power',
    ],
    status: 'contested',
    related: ['rights-and-capital', 'coordination-vs-extraction', 'annals-chain'],
    lastUpdated: '2026-10-30',
  },
  {
    id: 'annals-chain',
    term: 'Annals Chain',
    category: 'evidence',
    description: 'The Annals provide the temporal backbone: Reference → Proposal → Disposition → Outcome. Any token system must anchor to this chain — not replace it. Fork glyph (↳) marks proposed changes that retain source.',
    evidence: [
      { source: 'Annals Chronology Model', claim: 'Four-step recorded sequence with explicit source trail. Proposed changes have separate four-step flow (Source → Draft → Review → Resolve).', strength: 'strong' },
      { source: 'Roll Hash Anchor', claim: 'Each Roll entry commits to canonical fields. Annals events reference Roll hashes for evidence.', strength: 'strong' },
      { source: 'Network Evidence', claim: 'Relationship kinds (membership, stewardship, contribution, attests, issues) form evidence graph — not token graph.', strength: 'moderate' },
    ],
    counterarguments: [
      'Blockchain provides immutable event ordering (natural Annals)',
      'Token transfers create automatic audit trail',
      'Smart contracts enforce disposition rules',
    ],
    status: 'established',
    related: ['evidence', 'rights-and-capital', 'governance-token'],
    lastUpdated: '2026-11-07',
  },
  {
    id: 'sunset-clause',
    term: 'Sunset Clause',
    category: 'risk',
    description: 'Any admitted coordination token must have an explicit expiration, redemption, or conversion mechanism. Permanent tokens become extraction vectors. The Field Desk requires sunset at protocol level.',
    evidence: [
      { source: 'APT Coin Lab Boundary', claim: 'No live coin exists. Research only. Any future admission requires sunset design review.', strength: 'strong' },
      { source: 'Tender Local BOM', claim: 'Local BOM in KES minor units — explicit ordinary money terms. No token denomination.', strength: 'strong' },
      { source: 'Commons Patterns', claim: 'Solar Commons metering expires per billing cycle. Land Trust stewardship renews annually.', strength: 'moderate' },
    ],
    counterarguments: [
      'Permanent tokens enable long-term alignment',
      'Sunset creates uncertainty for contributors',
      'Redemption mechanisms can be gamed',
    ],
    status: 'hypothesis',
    related: ['coordination-vs-extraction', 'governance-token', 'productive-value'],
    lastUpdated: '2026-11-01',
  },
];

const DECISION_AXES: DecisionAxis[] = [
  {
    id: 'token-role',
    label: 'Token Role',
    description: 'What function — if any — should a token serve in the Field Desk ecosystem?',
    poles: [
      { label: 'No Token (Current)', description: 'All coordination via evidence, governance, and ordinary money (KES). Research only.', evidence: 'APT Coin Lab Boundary: "No coin balances or transfers; no token rewards or wages; no coin-gated access, voting, or work authorization."' },
      { label: 'Coordination Token', description: 'Limited-scope token for specific coordination tasks (demand signaling, priority queueing, reputation staking) with sunset.', evidence: 'Could signal demand for commons patterns, queue Workbench simulations, stake on Annals proposals.' },
      { label: 'Governance Token', description: 'Token-weighted voting on protocol parameters, treasury allocation, commons admission.', evidence: 'Risks plutocracy; requires quadratic voting, delegation, and explicit scope limits.' },
      { label: 'Asset-Backed Token', description: 'Token represents specific right (energy kWh, land access, compute credits) with 1:1 redemption.', evidence: 'Solar Commons metering → energy credits; Land Trust → access rights; Code Commons → compute credits.' },
    ],
    currentPosition: -0.75,
    rationale: 'Current research boundary explicitly excludes live tokens. Coordination token with sunset is the only plausible admission path, and only for specific, scoped functions.',
  },
  {
    id: 'denomination',
    label: 'Denomination',
    description: 'If a token exists, what unit of account?',
    poles: [
      { label: 'KES (Status Quo)', description: 'All tenders, BOMs, compensation in Kenyan Shillings. Explicit, regulated, familiar.', evidence: 'Tender local_bom_minor field uses KES minor units. Kenya pilot operates in KES.' },
      { label: 'Stablecoin (e.g., cKES)', description: 'KES-pegged stablecoin for onchain settlement. Requires regulated issuer, audit, redemption.', evidence: 'Central Bank of Kenya sandbox; requires full reserve audit.' },
      { label: 'Protocol-Native Unit', description: 'New unit defined by protocol (e.g., "compute credits", "energy credits"). Floating or pegged.', evidence: 'Requires oracle, redemption mechanism, and market adoption.' },
      { label: 'Multi-Denomination', description: 'Support KES, stablecoins, and protocol units simultaneously. User chooses per transaction.', evidence: 'Maximum flexibility; maximum complexity. Requires unified accounting layer.' },
    ],
    currentPosition: -1,
    rationale: 'KES is the only denomination with legal standing in the pilot jurisdiction. Stablecoin path requires regulatory approval. Protocol-native units lack redemption guarantees.',
  },
  {
    id: 'admission-criteria',
    label: 'Admission Criteria',
    description: 'What must be true for any token to be admitted to the Field Desk?',
    poles: [
      { label: 'Never Admit', description: 'Permanent research boundary. Coordination via evidence + governance + ordinary money only.', evidence: 'Current APT Coin Lab boundary. Simplest, safest, most aligned with Field Desk ontology.' },
      { label: 'Sunset + Scope + Evidence', description: 'Token must have: (1) explicit sunset clause, (2) narrowly defined scope, (3) evidence-backed coordination function.', evidence: 'Three-pillar test. Rejects governance tokens, asset tokens without redemption, perpetual coordination tokens.' },
      { label: 'Governance Review', description: 'Admit via institutional governance process (Institution Assembly → Annals Disposition → Roll Evidence).', evidence: 'Uses existing Annals chain. Slow but legitimate. Requires quorum, rationale, evidence.' },
      { label: 'Experimental Sandbox', description: 'Admit in isolated Workbench simulation with synthetic tokens, explicit "SIMULATION" marking, no cross-module leakage.', evidence: 'Workbench already supports simulations. Extend to token mechanics. Results inform but never authorize.' },
    ],
    currentPosition: -0.5,
    rationale: 'Sunset+Scope+Evidence is the minimum viable admission test. Governance Review adds legitimacy. Experimental Sandbox is already partially implemented in Workbench.',
  },
];

const STATUS_COLORS = {
  established: 'var(--state-canon)',
  contested: 'var(--state-risk)',
  hypothesis: 'var(--state-proposed)',
  rejected: 'var(--dim)',
};

const STATUS_LABELS = {
  established: 'ESTABLISHED',
  contested: 'CONTESTED',
  hypothesis: 'HYPOTHESIS',
  rejected: 'REJECTED',
};

const CATEGORY_COLORS = {
  ontology: 'var(--water)',
  economics: 'var(--state-caution)',
  governance: 'var(--state-risk)',
  evidence: 'var(--state-canon)',
  risk: 'var(--oxide)',
};

const CATEGORY_LABELS = {
  ontology: 'ONTOLOGY',
  economics: 'ECONOMICS',
  governance: 'GOVERNANCE',
  evidence: 'EVIDENCE',
  risk: 'RISK',
};

function StatusBadge({ status }: { status: Distinction['status'] }) {
  const color = STATUS_COLORS[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 'var(--radius-pill)',
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      border: `1px solid ${color}`,
      font: '500 var(--step--2) var(--mono)', color: color,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function CategoryBadge({ category }: { category: Distinction['category'] }) {
  const color = CATEGORY_COLORS[category];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 'var(--radius-pill)',
      background: `color-mix(in srgb, ${color} 12%, transparent)`,
      border: `1px solid ${color}`,
      font: '500 var(--step--2) var(--mono)', color: color,
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {CATEGORY_LABELS[category]}
    </span>
  );
}

function StrengthIndicator({ strength }: { strength: 'strong' | 'moderate' | 'weak' }) {
  const colors = { strong: 'var(--state-canon)', moderate: 'var(--state-caution)', weak: 'var(--state-risk)' };
  const labels = { strong: 'STRONG', moderate: 'MODERATE', weak: 'WEAK' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '1px 6px', borderRadius: 'var(--radius-1)',
      background: `color-mix(in srgb, ${colors[strength]} 15%, transparent)`,
      border: `1px solid ${colors[strength]}`,
      font: '500 var(--step--2) var(--mono)', color: colors[strength],
    }}>
      {labels[strength]}
    </span>
  );
}

function DecisionSlider({ axis }: { axis: DecisionAxis }) {
  return (
    <div style={{ marginBottom: 'var(--space-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', font: 'var(--step-0) var(--sans)' }}>
        <strong>{axis.label}</strong>
        <span style={{ color: axis.currentPosition < -0.5 ? 'var(--state-canon)' : axis.currentPosition > 0.5 ? 'var(--state-risk)' : 'var(--state-caution)' }}>
          {axis.currentPosition < -0.5 ? '← Status Quo' : axis.currentPosition > 0.5 ? 'Admit Token →' : '⋯ Deliberating'}
        </span>
      </div>
      <div style={{ position: 'relative', height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border)' }}>
        <div style={{
          position: 'absolute', top: '50%', left: `${(axis.currentPosition + 1) * 50}%`,
          transform: 'translate(-50%, -50%)', width: '16px', height: '16px',
          borderRadius: '50%', background: 'var(--bg)', border: '2px solid var(--state-canon)',
          boxShadow: 'var(--shadow-1)', cursor: 'ew-resize',
        }} />
        {axis.poles.map((pole, i) => (
          <div key={i} style={{
            position: 'absolute', top: '-20px', left: `${i / (axis.poles.length - 1) * 100}%`,
            transform: 'translateX(-50%)', font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)',
            whiteSpace: 'nowrap', textAlign: 'center',
          }}>
            {pole.label}
          </div>
        ))}
      </div>
      <p style={{ margin: 'var(--space-2) 0 0', font: 'var(--step--1) var(--mono)', color: 'var(--text-muted)' }}>
        {axis.rationale}
      </p>
    </div>
  );
}

function DistinctionCard({ distinction, onSelect, selected }: { distinction: Distinction; onSelect: () => void; selected: boolean }) {
  return (
    <article
      onClick={onSelect}
      style={{
        border: `1px solid ${selected ? CATEGORY_COLORS[distinction.category] : 'var(--border)'}`,
        borderRadius: 'var(--radius-3)',
        padding: 'var(--space-4)',
        background: selected ? `color-mix(in srgb, ${CATEGORY_COLORS[distinction.category]} 6%, var(--bg-elev))` : 'var(--bg-elev)',
        cursor: 'pointer', transition: 'all var(--fast)',
        boxShadow: selected ? 'var(--shadow-2)' : 'none',
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <CategoryBadge category={distinction.category} />
          <StatusBadge status={distinction.status} />
        </div>
        <span style={{ font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)' }}>
          {distinction.id}
        </span>
      </div>

      <h3 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-1) var(--serif)', color: 'var(--text)', lineHeight: 1.2 }}>
        {distinction.term}
      </h3>

      <p style={{ margin: '0 0 var(--space-3)', font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
        {distinction.description}
      </p>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div style={{ font: 'var(--step--1) var(--mono)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase' }}>Evidence</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {distinction.evidence.slice(0, 2).map((e, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-2)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)' }}>
              <StrengthIndicator strength={e.strength} />
              <div style={{ flex: 1, font: 'var(--step--1) var(--sans)', color: 'var(--text)', lineHeight: 1.4 }}>
                <span style={{ color: 'var(--text-muted)', font: 'var(--step--2) var(--mono)' }}>{e.source}: </span>
                {e.claim}
              </div>
            </div>
          ))}
          {distinction.evidence.length > 2 && (
            <div style={{ font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)', textAlign: 'right' }}>
              +{distinction.evidence.length - 2} more evidence items
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <span style={{ font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)' }}>
          Updated {new Date(distinction.lastUpdated).toLocaleDateString()}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          {distinction.related.slice(0, 3).map(r => (
            <span key={r} style={{ padding: '1px 6px', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-1)', font: 'var(--step--2) var(--mono)', color: 'var(--text-muted)' }}>
              {r}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function DistinctionDetailPanel({ distinction, onClose }: { distinction: Distinction | null; onClose: () => void }) {
  if (!distinction) return null;
  const color = CATEGORY_COLORS[distinction.category];

  return (
    <div style={{
      position: 'fixed', top: '80px', right: '24px', bottom: '50px',
      width: '480px', maxWidth: 'calc(100vw - 48px)',
      background: 'var(--bg-elev)', border: `1px solid ${color}`,
      borderRadius: 'var(--radius-4)', boxShadow: 'var(--shadow-3)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      zIndex: 100, animation: 'slideIn 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: 'var(--space-4)', borderBottom: '1px solid var(--border)', background: 'var(--bg-subtle)' }}>
        <div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <CategoryBadge category={distinction.category} />
            <StatusBadge status={distinction.status} />
          </div>
          <h2 style={{ margin: 0, font: '400 var(--step-2) var(--serif)', color: 'var(--text)' }}>
            {distinction.term}
          </h2>
        </div>
        <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '18px', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Definition</h4>
          <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', lineHeight: 1.6, color: 'var(--text)' }}>{distinction.description}</p>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Evidence ({distinction.evidence.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {distinction.evidence.map((e, i) => (
              <details key={i} style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', padding: 'var(--space-3)' }}>
                <summary style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', font: '500 var(--step-0) var(--sans)', color: 'var(--text)' }}>
                  <StrengthIndicator strength={e.strength} />
                  <span style={{ color: 'var(--text-muted)', font: 'var(--step--1) var(--mono)' }}>{e.source}</span>
                </summary>
                <div style={{ marginTop: 'var(--space-2)', paddingLeft: 'var(--space-3)', borderLeft: '2px solid var(--border)', font: 'var(--step-0) var(--sans)', color: 'var(--text)', lineHeight: 1.6 }}>
                  <p>{e.claim}</p>
                  {e.link && <a href={e.link} target="_blank" rel="noopener" style={{ color: 'var(--water)', font: 'var(--step--1) var(--mono)' }}>→ Source</a>}
                </div>
              </details>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Counterarguments</h4>
          <ul style={{ margin: 0, paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {distinction.counterarguments.map((c, i) => (
              <li key={i} style={{ font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)', lineHeight: 1.5, position: 'relative', paddingLeft: 'var(--space-3)' }}>
                <span style={{ position: 'absolute', left: 0, color: 'var(--state-risk)' }}>▸</span>
                {c}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Related Distinctions</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {distinction.related.map(r => {
              const related = DISTINCTIONS.find(d => d.id === r);
              return (
                <span key={r} style={{ padding: '4px 10px', background: related ? `color-mix(in srgb, ${CATEGORY_COLORS[related.category]} 12%, var(--bg-subtle))` : 'var(--bg-subtle)', border: related ? `1px solid ${CATEGORY_COLORS[related.category]}` : '1px solid var(--border)', borderRadius: 'var(--radius-1)', font: 'var(--step--1) var(--mono)', color: related ? CATEGORY_COLORS[related.category] : 'var(--text-muted)' }}>
                  {related?.term || r}
                </span>
              );
            })}
          </div>
        </section>

        <section>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Meta</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', font: 'var(--step--1) var(--mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>ID</span>
              <span>{distinction.id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Category</span>
              <span>{CATEGORY_LABELS[distinction.category]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span style={{ color: STATUS_COLORS[distinction.status] }}>{STATUS_LABELS[distinction.status]}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last Updated</span>
              <span>{new Date(distinction.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
        </section>
      </div>

      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', gap: 'var(--space-2)' }}>
        <button style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', background: color, color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius-2)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>Open in Annals</button>
        <button style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>View Evidence</button>
      </div>
    </div>
  );
}

function FilterBar({ filter, setFilter, filterCategory, setFilterCategory, filterStatus, setFilterStatus, categories, statuses }: {
  filter: string; setFilter: (v: string) => void;
  filterCategory: Distinction['category'] | 'all'; setFilterCategory: (v: Distinction['category'] | 'all') => void;
  filterStatus: Distinction['status'] | 'all'; setFilterStatus: (v: Distinction['status'] | 'all') => void;
  categories: Distinction['category'][];
  statuses: Distinction['status'][];
}) {
  return (
    <div style={{ position: 'fixed', top: '160px', left: '24px', right: '24px', maxWidth: '1440px', margin: '0 auto', zIndex: 50, display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
        <input type="text" placeholder="Filter distinctions…" value={filter} onChange={(e: Event) => setFilter((e.target as HTMLInputElement).value)} style={{ width: '100%', padding: 'var(--space-2) var(--space-3) var(--space-2) 40px', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }} />
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '16px' }}>🔍</span>
      </div>
      <select value={filterCategory} onChange={(e: Event) => setFilterCategory((e.target as HTMLSelectElement).value as Distinction['category'] | 'all')} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }}>
        <option value="all">All Categories</option>
        {categories.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
      </select>
      <select value={filterStatus} onChange={(e: Event) => setFilterStatus((e.target as HTMLSelectElement).value as Distinction['status'] | 'all')} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }}>
        <option value="all">All Status</option>
        {statuses.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
      </select>
    </div>
  );
}

function StatsHeader({ distinctions, filteredCount }: { distinctions: Distinction[]; filteredCount: number }) {
  const establishedCount = distinctions.filter(d => d.status === 'established').length;
  const contestedCount = distinctions.filter(d => d.status === 'contested').length;
  const hypothesisCount = distinctions.filter(d => d.status === 'hypothesis').length;
  const totalEvidence = distinctions.reduce((s, d) => s + d.evidence.length, 0);

  return (
    <div style={{ position: 'fixed', top: '80px', left: '24px', right: '24px', maxWidth: '1440px', margin: '0 auto', zIndex: 50, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
      {[
        { label: 'DISTINCTIONS', value: filteredCount, total: distinctions.length, color: 'var(--text)' },
        { label: 'ESTABLISHED', value: establishedCount, color: 'var(--state-canon)' },
        { label: 'CONTESTED', value: contestedCount, color: 'var(--state-risk)' },
        { label: 'HYPOTHESIS', value: hypothesisCount, color: 'var(--state-proposed)' },
        { label: 'EVIDENCE ITEMS', value: totalEvidence, color: 'var(--water)' },
      ].map((stat, i) => (
        <div key={i} style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)' }}>
          <div style={{ font: '500 var(--step--1) var(--mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
          <div style={{ font: '700 var(--step-2) var(--mono)', color: stat.color }}>{stat.value}</div>
          {stat.total !== undefined && <div style={{ font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)' }}>/{stat.total}</div>}
        </div>
      ))}
    </div>
  );
}

export function AptCoinLab() {
  useClock();
  const [filter, setFilter] = useState('');
  const [filterCategory, setFilterCategory] = useState<Distinction['category'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Distinction['status'] | 'all'>('all');
  const [selected, setSelected] = useState<Distinction | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredDistinctions = useMemo(() => {
    let result = DISTINCTIONS;
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter(d => d.term.toLowerCase().includes(f) || d.description.toLowerCase().includes(f) || d.id.toLowerCase().includes(f));
    }
    if (filterCategory !== 'all') result = result.filter(d => d.category === filterCategory);
    if (filterStatus !== 'all') result = result.filter(d => d.status === filterStatus);
    return result;
  }, [filter, filterCategory, filterStatus]);

  const categories = useMemo(() => Array.from(new Set(DISTINCTIONS.map(d => d.category))) as Distinction['category'][], []);
  const statuses = useMemo(() => Array.from(new Set(DISTINCTIONS.map(d => d.status))) as Distinction['status'][], []);

  const metrics: PageHeadMetric[] = [
    { label: 'Total', value: DISTINCTIONS.length, state: 'canon' },
    { label: 'Established', value: DISTINCTIONS.filter(d => d.status === 'established').length, state: 'canon' },
    { label: 'Contested', value: DISTINCTIONS.filter(d => d.status === 'contested').length, state: 'risk' },
    { label: 'Evidence Items', value: DISTINCTIONS.reduce((s, d) => s + d.evidence.length, 0), state: 'caution' },
  ];

  useEffect(() => { window.addEventListener('keydown', e => { if (e.key === 'Escape') setSelected(null); }); return () => window.removeEventListener('keydown', e => { if (e.key === 'Escape') setSelected(null); }); }, []);

  return (
    <WorkspaceLayout currentContext="intelligence:coin-lab">
      <div className="apt-coin-lab-page" style={{ position: 'relative', minHeight: '100vh' }}>
        <PageHead
          eyebrow="APT-LABS / RESEARCH"
          title="APT Coin Lab"
          subtitle="Research notebook: distinctions, evidence, and decision axes. No live coin — this is ontology work, not a financial product."
          metrics={metrics}
          quietActions={[
            { label: 'Export research notebook', onClick: () => {} },
            { label: 'New distinction entry', onClick: () => {} },
          ]}
        />

        <section style={{ position: 'fixed', top: '80px', left: '24px', right: '24px', maxWidth: '1440px', margin: '0 auto', zIndex: 50, padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <span style={{ padding: '4px 10px', background: 'var(--state-risk-wash)', border: '1px solid var(--state-risk)', borderRadius: 'var(--radius-1)', font: '500 var(--step--1) var(--mono)', color: 'var(--state-risk)', textTransform: 'uppercase' }}>RESEARCH ONLY</span>
            <span style={{ font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
              No coin balances or transfers; no token rewards or wages; no coin-gated access, voting, or work authorization. Project compensation and costs remain explicit ordinary-money terms (KES for Kenya pilot).
            </span>
          </div>
        </section>

        <StatsHeader distinctions={DISTINCTIONS} filteredCount={filteredDistinctions.length} />
        <FilterBar filter={filter} setFilter={setFilter} filterCategory={filterCategory} setFilterCategory={setFilterCategory} filterStatus={filterStatus} setFilterStatus={setFilterStatus} categories={categories} statuses={statuses} />

        <div style={{ marginTop: '230px', padding: '0 var(--space-4) var(--space-6)', maxWidth: '1440px', margin: '230px auto var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
              {filteredDistinctions.length} of {DISTINCTIONS.length} distinctions
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'is-active' : ''} style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', background: viewMode === 'grid' ? 'var(--state-canon-wash)' : 'var(--bg-elev)', color: viewMode === 'grid' ? 'var(--state-canon)' : 'var(--text)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>Grid</button>
              <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'is-active' : ''} style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', background: viewMode === 'list' ? 'var(--state-canon-wash)' : 'var(--bg-elev)', color: viewMode === 'list' ? 'var(--state-canon)' : 'var(--text)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>List</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(400px, 1fr))' : '1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
            {filteredDistinctions.map(distinction => (
              <DistinctionCard key={distinction.id} distinction={distinction} onSelect={() => setSelected(distinction)} selected={selected?.id === distinction.id} />
            ))}
          </div>

          {filteredDistinctions.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <p style={{ font: 'var(--step-1) var(--serif)', margin: '0 0 var(--space-2)' }}>No distinctions match your filters</p>
              <p style={{ font: 'var(--step-0) var(--sans)', margin: 0 }}>Adjust your search or filters to find what you need.</p>
            </div>
          )}

          <section style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)' }}>
            <h2 style={{ margin: '0 0 var(--space-2)', font: '400 var(--step-2) var(--serif)', color: 'var(--text)' }}>Decision Axes</h2>
            <p style={{ margin: '0 0 var(--space-5)', font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
              Adjust positions to record your current stance. Positions persist locally.
            </p>
            {DECISION_AXES.map(axis => (
              <DecisionSlider key={axis.id} axis={axis} />
            ))}
          </section>
        </div>

        <DistinctionDetailPanel distinction={selected} onClose={() => setSelected(null)} />

        <div style={{ position: 'fixed', bottom: '16px', right: '24px', zIndex: 50, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--step--2)', fontFamily: 'var(--mono)', color: 'var(--text-faint)', textAlign: 'right' }}>
          <div>ESC — Clear selection</div>
          <div>CLICK — Open detail</div>
          <div style={{ marginTop: '4px', color: 'var(--state-canon)', fontWeight: 500 }}>
            {DISTINCTIONS.filter(d => d.status === 'established').length} established · {DISTINCTIONS.filter(d => d.status === 'contested').length} contested · {DISTINCTIONS.filter(d => d.status === 'hypothesis').length} hypothesis
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
