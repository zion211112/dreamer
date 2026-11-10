import { useState, useEffect, useMemo } from 'preact/hooks';
import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';
import { RingedEvidenceMarker } from '../../components/RingedEvidenceMarker';
import { RollEntry, queryRollEntries } from '../../lib/db/roll';

type Lens = 'canon' | 'annals' | 'roll';

const LENSES: { id: Lens; label: string; hint: string }[] = [
  { id: 'roll', label: 'Roll', hint: 'Close-out ledger' },
  { id: 'canon', label: 'Canon', hint: 'Qualified state' },
  { id: 'annals', label: 'Annals', hint: 'Claims & evidence' },
];

const TIME_AXIS_LABELS = ['2026-09', '2026-10', '2026-11', '2026-12'];

const PILOTS = [
  { id: 'kibera-workshop', name: 'Kibera Makerspace', place: 'Kibera, Nairobi', kind: 'physical-asset' },
  { id: 'kemotos-agi1', name: 'Kemetos AGI1', place: 'Distributed', kind: 'digital' },
  { id: 'thiba-hydro', name: 'Thiba Hydro', place: 'Thiba, Kenya', kind: 'hybrid' },
];

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function hashShort(hash: string): string {
  return `${hash.slice(0, 6)}…${hash.slice(-4)}`;
}

type OutcomeKind = 'accepted' | 'partial' | 'disputed' | 'cancelled' | 'unresolved' | 'proposed' | 'not-recorded';

interface RollCloseOutRow {
  id: string;
  title: string;
  undertakingId: string;
  undertakingType: string;
  undertakingPlace: string;
  outcome: string;
  outcomeKind: OutcomeKind;
  acceptedAt: string | null;
  acceptedBy: string | null;
  hashAnchor: string;
  hashStatus: 'anchored' | 'none' | 'review';
  evidenceLayers: Array<{ layer: string; count: number }>;
  pilotId: string | null;
  disclosure: 'public' | 'participant' | 'restricted';
}

const OUTCOME_BY_ID: Record<string, { label: string; kind: OutcomeKind }> = {
  'roll-2026-10-17-03': { label: 'accepted', kind: 'accepted' },
  'roll-2026-10-20-01': { label: 'proposed', kind: 'proposed' },
  'roll-2026-11-01-07': { label: 'partial', kind: 'partial' },
  'roll-2026-11-05-02': { label: 'disputed', kind: 'disputed' },
  'roll-2026-11-07-09': { label: 'cancelled', kind: 'cancelled' },
};

const DISCLOSURE_LABELS: Record<string, string> = {
  public: 'Public',
  participant: 'Participant',
  restricted: 'Restricted',
};

function buildRollCloseOutRows(entries: RollEntry[], timeIndex: number): RollCloseOutRow[] {
  const monthKey = TIME_AXIS_LABELS[timeIndex];
  const monthStart = `${monthKey}-01`;

  return entries
    .filter((entry) => entry.recorded_at >= monthStart)
    .map((entry) => {
      const outcome = OUTCOME_BY_ID[entry.id] ?? { label: 'Not recorded', kind: 'not-recorded' };
      const publicEv = entry.evidence.filter((e) => e.layer === 'public').length;
      const participantEv = entry.evidence.filter((e) => e.layer === 'participant').length;
      const restrictedEv = entry.evidence.filter((e) => e.layer === 'restricted').length;

      const pilot = PILOTS.find((p) => entry.title.toLowerCase().includes(p.name.toLowerCase().split(' ')[0]));

      let disclosure: 'public' | 'participant' | 'restricted' = 'public';
      if (restrictedEv > 0) disclosure = 'restricted';
      else if (participantEv > 0) disclosure = 'participant';

      return {
        id: entry.id,
        title: entry.title,
        undertakingId: entry.undertaking_id,
        undertakingType: entry.undertaking_type,
        undertakingPlace: entry.commissioned_by.name,
        outcome: outcome.label,
        outcomeKind: outcome.kind,
        acceptedAt: entry.acceptance.accepted_at || null,
        acceptedBy: entry.acceptance.accepted_by || null,
        hashAnchor: entry.hash_anchor,
        hashStatus: entry.hash_anchor ? 'anchored' : 'none',
        evidenceLayers: [
          { layer: 'public', count: publicEv },
          { layer: 'participant', count: participantEv },
          { layer: 'restricted', count: restrictedEv },
        ],
        pilotId: pilot?.id ?? null,
        disclosure,
      };
    });
}

function OutcomeChip({ kind, label }: { kind: OutcomeKind; label: string }) {
  return (
    <span className={`outcome-chip outcome-${kind}`} title={label}>
      {label}
    </span>
  );
}

function DisclosureChip({ level }: { level: 'public' | 'participant' | 'restricted' }) {
  return (
    <span className={`disclosure-chip disclosure-${level}`} title={DISCLOSURE_LABELS[level]}>
      <RingedEvidenceMarker size={8} color="var(--state-canon)" filled={level === 'restricted'} />
      {level}
    </span>
  );
}

function EvidenceLayerDots({ layers }: { layers: Array<{ layer: string; count: number }> }) {
  const layerColors: Record<string, string> = {
    public: 'var(--state-canon)',
    participant: 'var(--terrain)',
    restricted: 'var(--muted)',
  };
  const hasAny = layers.some((l) => l.count > 0);
  return (
    <div className="ev-layer-dots" title="Evidence layers">
      {layers.map((layer) => (
        <span
          key={layer.layer}
          className={`ev-dot ${layer.layer}${layer.count > 0 ? ' has' : ''}`}
          style={{ backgroundColor: layerColors[layer.layer] || 'var(--muted)' }}
          title={`${layer.layer}: ${layer.count}`}
        />
      ))}
      {!hasAny && <span className="ev-dot none" title="No evidence" />}
    </div>
  );
}

function AnchorCell({ hashAnchor, hashStatus }: { hashAnchor: string; hashStatus: 'anchored' | 'none' | 'review' }) {
  if (hashStatus === 'none') {
    return (
      <span className="anchor-cell anchor-none" title="No hash anchor stored">
        <RingedEvidenceMarker size={10} color="var(--muted)" filled={false} />
        <span className="anchor-label">none</span>
      </span>
    );
  }
  if (hashStatus === 'review') {
    return (
      <span className="anchor-cell anchor-review" title="Hash under review">
        <RingedEvidenceMarker size={10} color="var(--brass)" filled={false} />
        <span className="anchor-label">review</span>
      </span>
    );
  }
  return (
    <span className="anchor-cell anchor-verified" title={`SHA-256 anchor: ${hashAnchor}`}>
      <RingedEvidenceMarker size={10} color="var(--state-canon)" filled={true} />
      <span className="anchor-label mono">{hashShort(hashAnchor)}</span>
    </span>
  );
}

function RollCloseOutView({ entries, timeIndex, onSelect }: {
  entries: RollEntry[];
  timeIndex: number;
  onSelect: (entry: RollEntry) => void;
}) {
  const rows = buildRollCloseOutRows(entries, timeIndex);
  const acceptedCount = rows.filter((r) => r.outcomeKind === 'accepted').length;
  const nonSuccessCount = rows.filter((r) => r.outcomeKind !== 'accepted' && r.outcomeKind !== 'proposed' && r.outcomeKind !== 'not-recorded').length;
  const proposedCount = rows.filter((r) => r.outcomeKind === 'proposed').length;
  const hashAnchoredCount = rows.filter((r) => r.hashStatus === 'anchored').length;

  return (
    <section className="records-lens records-lens-roll" aria-labelledby="roll-closeout-title">
      <div className="lens-head">
        <div className="lens-identity">
          <p className="kicker">APT-LABS <span className="sep">/</span> RECORDS <span className="sep">/</span> ROLL</p>
          <h1 className="lens-title" id="roll-closeout-title">Close-out ledger</h1>
          <p className="lens-subtitle">Institutional memory: every undertaking's outcome, acceptance, and hash anchor across the pilot network.</p>
        </div>
        <div className="lens-metrics">
          <div className="metric metric-primary">
            <span className="metric-label">Close-out records</span>
            <div className="metric-value mono">{rows.length}</div>
            <span className="metric-tag">undertakings closed</span>
          </div>
          <div className="metric metric-primary">
            <span className="metric-label">Accepted</span>
            <div className="metric-value">{acceptedCount}</div>
            <span className="metric-tag">of {rows.length} closed</span>
          </div>
          <div className="metric">
            <span className="metric-label">Non-success</span>
            <div className="metric-value">{nonSuccessCount}</div>
            <span className="metric-tag">partial · disputed · cancelled</span>
          </div>
          <div className="metric metric-primary">
            <span className="metric-label">Hash-anchored</span>
            <div className="metric-value mono">{hashAnchoredCount}</div>
            <span className="metric-tag">SHA-256</span>
          </div>
          <div className="metric">
            <span className="metric-label">Proposed</span>
            <div className="metric-value">{proposedCount}</div>
            <span className="metric-tag">not yet settled</span>
          </div>
        </div>
      </div>
      <hr className="lens-rule" />
      <table role="grid" aria-label="Roll close-out records">
        <thead>
          <tr>
            <th style={{ width: '24%' }}>Record</th>
            <th style={{ width: '20%' }}>Pilot · undertaking</th>
            <th style={{ width: '14%' }}>Outcome</th>
            <th style={{ width: '12%' }}>Evidence</th>
            <th style={{ width: '12%' }}>Disclosure</th>
            <th style={{ width: '10%' }}>Accepted at</th>
            <th style={{ width: '8%' }}>Hash</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} onClick={() => onSelect(entries.find((e) => e.id === row.id)!)} className="row-selectable" role="row" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') onSelect(entries.find((e) => e.id === row.id)!); }}>
              <td>
                <div className="cell-title serif">{row.title}</div>
                <div className="cell-id mono dim">{row.id}</div>
                {row.pilotId && <span className="pilot-chip">{PILOTS.find((p) => p.id === row.pilotId)?.name}</span>}
              </td>
              <td>
                <div className="cell-mono mono">{row.undertakingId}</div>
                <div className="cell-place dim">{row.undertakingPlace}</div>
              </td>
              <td><OutcomeChip kind={row.outcomeKind} label={row.outcome} /></td>
              <td><EvidenceLayerDots layers={row.evidenceLayers} /></td>
              <td><DisclosureChip level={row.disclosure} /></td>
              <td>{row.acceptedAt ? <div className="cell-date mono">{formatDateShort(row.acceptedAt)}</div> : <span className="cell-empty dim">—</span>}</td>
              <td><AnchorCell hashAnchor={row.hashAnchor} hashStatus={row.hashStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ontology-panel">
        <span className="ontology-label">Ontology in this view</span>
        <p><strong>Outcome vocabulary preserved:</strong> accepted · partial · disputed · cancelled · unresolved · proposed · not recorded. A non-success record is institutional knowledge — not a participant judgment.</p>
        <p><strong>Hashing establishes integrity of covered content, not truth or validity.</strong> Acceptance does not prove settlement; a contribution is preserved independently of the outcome.</p>
        <p><strong>Disclosure is not evidence quality.</strong> Public, participant, and restricted are access classifications. A restricted artifact may be the strongest evidence in the record.</p>
      </div>
      <p className="lens-note">Browser-local demo. Synthetic records stay in this browser. Sample acceptance and visibility labels are not authoritative.</p>
    </section>
  );
}

function CanonQualifiedView() {
  const relationships = [
    { role: 'commissions', target: 'Kibera workshop bench set', kind: 'undertaking', status: 'active' },
    { role: 'hosts crew', target: 'Kibera workshop crew', kind: 'crew', status: 'active' },
    { role: 'owns', target: 'Workbench bench set', kind: 'asset', status: 'built' },
    { role: 'governed by', target: 'Commons steward', kind: 'person', status: 'canonical' },
    { role: 'funded by', target: 'Treasury · operational savings', kind: 'instrument', status: 'open' },
    { role: 'performed by', target: 'Kibera workshop crew', kind: 'crew', status: 'active' },
  ];

  const entities = [
    { name: 'Kibera Makerspace', chip: 'institution', fields: [
      { lbl: 'Canonical ID', val: 'inst-04', mono: true },
      { lbl: 'Location', val: 'Kibera, Nairobi, Kenya' },
      { lbl: 'Record basis', val: 'qualified', mono: true },
      { lbl: 'Qualified', val: '2026-10-17', mono: true },
      { lbl: 'Steward', val: <span><strong>Commons steward · person-09</strong></span> },
    ]},
    { name: 'Josephine Wanjiru', chip: 'person', fields: [
      { lbl: 'Canonical ID', val: 'person-09', mono: true },
      { lbl: 'Role', val: 'Anchor · master tradesperson' },
      { lbl: 'Record basis', val: 'qualified', mono: true },
      { lbl: 'Affiliation', val: 'Kibera Makerspace' },
      { lbl: 'Capability', val: 'Fabrication verification' },
    ]},
    { name: 'Samuel Otieno', chip: 'person', fields: [
      { lbl: 'Canonical ID', val: 'person-12', mono: true },
      { lbl: 'Role', val: 'Builder' },
      { lbl: 'Record basis', val: 'qualified', mono: true },
      { lbl: 'Affiliation', val: 'Kibera workshop crew' },
      { lbl: 'Capability', val: 'Bench fabrication' },
    ]},
    { name: 'Amina Jomo', chip: 'person', fields: [
      { lbl: 'Canonical ID', val: 'person-21', mono: true },
      { lbl: 'Role', val: 'Apprentice' },
      { lbl: 'Record basis', val: 'qualified', mono: true },
      { lbl: 'Affiliation', val: 'Kibera workshop crew' },
      { lbl: 'Capability', val: 'Assembly support' },
    ]},
    { name: 'Workbench bench set', chip: 'asset', fields: [
      { lbl: 'Canonical ID', val: 'asset-07', mono: true },
      { lbl: 'Work kind', val: 'physical-asset' },
      { lbl: 'Record basis', val: 'built', mono: true },
      { lbl: 'Quantity', val: <span><strong>4 benches</strong> · 4 vices · 2 cabinets · 1 signage</span> },
      { lbl: 'Owned by', val: <span><strong>Kibera Makerspace</strong></span> },
    ]},
    { name: 'Kibera workshop bench set', chip: 'undertaking', fields: [
      { lbl: 'Canonical ID', val: 'undert-2026-10-14', mono: true },
      { lbl: 'Work kind', val: 'physical-asset' },
      { lbl: 'Record basis', val: 'qualified', mono: true },
      { lbl: 'Commissioner', val: <span><strong>Kibera Makerspace</strong></span> },
      { lbl: 'Roll entry', val: 'roll-2026-10-17-03', mono: true },
    ]},
  ];

  return (
    <section className="records-lens records-lens-canon" aria-labelledby="canon-qualified-title">
      <div className="lens-head">
        <div className="lens-identity">
          <p className="kicker">APT-LABS <span className="sep">/</span> RECORDS <span className="sep">/</span> CANON</p>
          <h1 className="lens-title" id="canon-qualified-title">Qualified state</h1>
          <p className="lens-subtitle">Canon — current authoritative representation within a defined domain. What is structurally recorded right now, not universal truth.</p>
        </div>
        <div className="lens-metrics">
          <div className="metric metric-primary">
            <span className="metric-label">Entities</span>
            <div className="metric-value">{entities.length}</div>
            <span className="metric-tag">qualified</span>
          </div>
          <div className="metric">
            <span className="metric-label">Institutions</span>
            <div className="metric-value">1</div>
            <span className="metric-tag">canonical</span>
          </div>
          <div className="metric">
            <span className="metric-label">Persons</span>
            <div className="metric-value">3</div>
            <span className="metric-tag">qualified</span>
          </div>
          <div className="metric">
            <span className="metric-label">Assets</span>
            <div className="metric-value">1</div>
            <span className="metric-tag">built</span>
          </div>
          <div className="metric metric-primary">
            <span className="metric-label">Undertakings</span>
            <div className="metric-value">1</div>
            <span className="metric-tag">qualified</span>
          </div>
        </div>
      </div>
      <hr className="lens-rule" />
      <div className="entity-grid">
        {entities.map((entity, i) => (
          <article key={i} className="entity-card">
            <div className="entity-head">
              <div className="entity-name-wrapper">
                <span className="entity-name serif">{entity.name}</span>
                <span className={`entity-chip ${entity.chip}`}>{entity.chip}</span>
              </div>
            </div>
            <div className="entity-body">
              {entity.fields.map((field, j) => (
                <div key={j} className="entity-field">
                  <span className="field-label">{field.lbl}</span>
                  <div className={`field-val ${field.mono ? 'mono' : ''}`}>{field.val}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
      <section className="relations-panel">
        <div className="relations-head">
          <span className="section-label serif">Typed relationships</span>
          <span className="relations-count mono dim">{relationships.length} directed, typed relations</span>
        </div>
        <div className="relations-body">
          {relationships.map((rel, i) => (
            <div key={i} className="relation-row">
              <span className="rel-role">{rel.role}</span>
              <span className="rel-arrow mono dim">→</span>
              <span className="rel-target">{rel.target}</span>
              <span className="rel-kind mono dim">{rel.kind}</span>
              <span className={`rel-status-chip ${rel.status}`}>{rel.status}</span>
            </div>
          ))}
        </div>
      </section>
      <div className="distinction-panel">
        <span className="section-label">Distinctions kept visible</span>
        <p><b className="distinction-type">Person</b> ≠ Asset · <b className="distinction-type">Capability</b> ≠ Credential · <b className="distinction-type">Claim</b> ≠ Evidence · Approval ≠ Authorization ≠ Execution ≠ Acceptance ≠ Settlement.</p>
        <p>Canon is a current authoritative representation within a defined domain — not universal truth. Annals records what happened; Roll holds the substantiating evidence. A record is not automatically a fact.</p>
      </div>
      <p className="lens-note">Browser-local demo. Synthetic records stay in this browser. Sample acceptance and visibility labels are not authoritative.</p>
    </section>
  );
}

function ClaimsEvidenceView({ entries }: { entries: RollEntry[] }) {
  const entry = entries[0];
  if (!entry) return (
    <section className="records-lens records-lens-annals" aria-labelledby="claims-evidence-title">
      <div className="lens-head">
        <div className="lens-identity">
          <p className="kicker">APT-LABS <span className="sep">/</span> RECORDS <span className="sep">/</span> CLAIMS</p>
          <h1 className="lens-title" id="claims-evidence-title">Claims & evidence</h1>
          <p className="lens-subtitle">How a claim is substantiated — subject, predicate, evidence, method, review, and challenge history.</p>
        </div>
      </div>
      <div className="empty-state">
        <span className="empty-icon">—</span>
        <h2 className="empty-title serif">No claims recorded</h2>
        <p className="empty-sub">A claim appears here when evidence is linked to a bounded assertion.</p>
      </div>
    </section>
  );

  const publicEv = entry.evidence.filter((e) => e.layer === 'public').length;
  const participantEv = entry.evidence.filter((e) => e.layer === 'participant').length;
  const restrictedEv = entry.evidence.filter((e) => e.layer === 'restricted').length;

  return (
    <section className="records-lens records-lens-annals" aria-labelledby="claims-evidence-title">
      <div className="lens-head">
        <div className="lens-identity">
          <p className="kicker">APT-LABS <span className="sep">/</span> RECORDS <span className="sep">/</span> CLAIMS</p>
          <h1 className="lens-title" id="claims-evidence-title">Claims & evidence</h1>
          <p className="lens-subtitle">How a claim is substantiated — subject, predicate, evidence, method, review, and challenge history. Claim is not evidence.</p>
        </div>
        <div className="lens-metrics">
          <div className="metric metric-primary">
            <span className="metric-label">Claim</span>
            <div className="metric-value mono">clm-2026-10-17-01</div>
            <span className="metric-tag">bounded assertion</span>
          </div>
          <div className="metric">
            <span className="metric-label">Verdict</span>
            <div className="metric-value">Substantiated</div>
            <span className="metric-tag">evidence-based</span>
          </div>
          <div className="metric">
            <span className="metric-label">Basis</span>
            <div className="metric-value mono">{entry.id}</div>
            <span className="metric-tag">Roll entry</span>
          </div>
        </div>
      </div>
      <hr className="lens-rule" />
      <div className="claim-card">
        <div className="claim-head">
          <div className="claim-meta-row">
            <span className="verdict-badge verdict-substantiated">Substantiated</span>
            <span className="claim-type mono dim">claim · evidence-based</span>
          </div>
          <h2 className="claim-title serif">{entry.title}</h2>
        </div>
        <div className="claim-grid">
          <div className="claim-body">
            <div className="claim-field">
              <span className="field-label">Subject</span>
              <div className="field-val serif">{entry.title} · {entry.undertaking_id}</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Predicate</span>
              <div className="field-val">Delivered and accepted on-site per undertaking scope</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Assertion</span>
              <div className="field-val strong">{entry.scope}</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Claimant</span>
              <div className="field-val"><strong>Commons steward · person-09</strong></div>
            </div>
            <div className="claim-field">
              <span className="field-label">Effective time</span>
              <div className="field-val mono">{formatDateTime(entry.recorded_at)} EAT</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Recorded time</span>
              <div className="field-val mono">{formatDateTime(entry.recorded_at)} EAT</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Method & basis</span>
              <div className="field-val">On-site inspection + delivery photo + anchor attestation (public + participant layers)</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Reviewer</span>
              <div className="field-val">Roll steward · person-14</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Review result</span>
              <div className="field-val"><strong>Substantiated</strong> — evidence supports the claim within stated scope</div>
            </div>
          </div>
          <aside className="claim-rail" aria-label="Claim inspector">
            <div className="rail-head">
              <span className="section-label">Claim metadata</span>
              <span className="rail-cap mono dim">Governed claim record</span>
            </div>
            <div className="rail-body">
              <div className="rail-item">
                <span className="field-label">Claim ID</span>
                <div className="field-val mono">clm-2026-10-17-01</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Schema version</span>
                <div className="field-val mono">v1</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Origin</span>
                <div className="field-val">Roll entry · {entry.id}</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Subject org</span>
                <div className="field-val">{entry.commissioned_by.name} · inst-04</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Disclosure</span>
                <div className="field-val">Public · participant</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Consent basis</span>
                <div className="field-val">Undertaking terms</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Retention</span>
                <div className="field-val">Institutional memory</div>
              </div>
            </div>
          </aside>
        </div>
        <div className="evidence-panel">
          <div className="evidence-head">
            <span className="section-label">Supporting evidence</span>
            <span className="evidence-count mono dim">{entry.evidence.length} artifacts · 3 layers</span>
          </div>
          <div className="evidence-list">
            {entry.evidence.map((ev) => (
              <div key={ev.id} className="evidence-item">
                <div className="evidence-role">
                  <RingedEvidenceMarker size={10} color={ev.layer === 'public' ? 'var(--state-canon)' : ev.layer === 'participant' ? 'var(--terrain)' : 'var(--muted)'} filled={ev.layer === 'restricted'} />
                  <span className="evidence-role-label">{ev.title}</span>
                </div>
                <span className="evidence-description">{ev.description || 'No description recorded'}</span>
                <span className="evidence-layer-tag mono dim">{ev.layer.charAt(0).toUpperCase() + ev.layer.slice(1)} · {ev.layer}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ontology-panel">
        <span className="ontology-label">Ontology in this view</span>
        <p><b className="distinction-type">Claim</b> ≠ Evidence: the assertion is bounded by subject, predicate, and scope; each artifact is linked as evidence explaining how and within what scope it supports the claim.</p>
        <p>Origin, claim basis, verification method, lifecycle, and disclosure are separate. A record-level badge is not universal evidence of truth.</p>
      </div>
      <p className="lens-note">Browser-local demo. Synthetic records stay in this browser. Sample acceptance and visibility labels are not authoritative.</p>
    </section>
  );
}

function RecordDetailView({ entry, onClose }: { entry: RollEntry; onClose: () => void }) {
  const publicEv = entry.evidence.filter((e) => e.layer === 'public').length;
  const participantEv = entry.evidence.filter((e) => e.layer === 'participant').length;
  const restrictedEv = entry.evidence.filter((e) => e.layer === 'restricted').length;
  const hasAcceptance = !!entry.acceptance.accepted_by;
  const hasCost = !!entry.acceptance.cost_disclosed;
  const hasInspection = !!entry.acceptance.inspection_report_id;

  return (
    <section className="record-detail-view" aria-labelledby="record-detail-title">
      <div className="record-detail-head">
        <button className="detail-back" onClick={onClose} aria-label="Back to ledger">
          <span className="back-arrow mono">←</span> Back to ledger
        </button>
        <div className="detail-meta-strip">
          <span className="detail-id mono">{entry.id}</span>
          <span className="detail-sep mono dim">·</span>
          <span className="detail-version mono">v{entry.version}</span>
          <span className="detail-sep mono dim">·</span>
          <span className="detail-recorded mono">{formatDateShort(entry.recorded_at)} EAT</span>
        </div>
      </div>
      <h1 id="record-detail-title" className="detail-title serif">{entry.title}</h1>
      <p className="detail-scope">{entry.scope}</p>

      <div className="detail-grid">
        <section className="detail-card">
          <h2 className="card-title serif">Undertaking</h2>
          <div className="card-field">
            <span className="field-label">Undertaking ID</span>
            <div className="field-val mono">{entry.undertaking_id}</div>
          </div>
          <div className="card-field">
            <span className="field-label">Work kind</span>
            <div className="field-val">{entry.undertaking_type}</div>
          </div>
          <div className="card-field">
            <span className="field-label">Commissioned by</span>
            <div className="field-val"><strong>{entry.commissioned_by.name}</strong></div>
          </div>
          <div className="card-field">
            <span className="field-label">Deliverables</span>
            <div className="field-val">{entry.deliverables.join(' · ')}</div>
          </div>
        </section>

        <section className="detail-card">
          <h2 className="card-title serif">Participants</h2>
          <div className="participant-list">
            {entry.participants.map((p) => (
              <div key={p.person_id} className="participant-row">
                <div className="participant-info">
                  <div className="participant-name">{p.name}</div>
                  <div className="participant-role mono dim">{p.role_type}</div>
                </div>
                <div className="participant-claims">
                  {p.capability_claims.map((c) => (
                    <span key={c} className="claim-chip">{c}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-card">
          <h2 className="card-title serif">Evidence layers</h2>
          <div className="evidence-layers-summary">
            <div className="ev-layer-summary">
              <span className="ev-dot-summary public" />
              <span className="ev-layer-label">Public</span>
              <span className="ev-layer-count mono">{publicEv}</span>
            </div>
            <div className="ev-layer-summary">
              <span className="ev-dot-summary participant" />
              <span className="ev-layer-label">Participant</span>
              <span className="ev-layer-count mono">{participantEv}</span>
            </div>
            <div className="ev-layer-summary">
              <span className="ev-dot-summary restricted" />
              <span className="ev-layer-label">Restricted</span>
              <span className="ev-layer-count mono">{restrictedEv}</span>
            </div>
          </div>
          <div className="evidence-files-list">
            {entry.evidence.map((ev) => (
              <div key={ev.id} className="evidence-file-row">
                <span className="evidence-file-role">{ev.title}</span>
                <span className="evidence-file-layer mono dim">{ev.layer}</span>
                <span className="evidence-file-desc dim">{ev.description || '—'}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-card">
          <h2 className="card-title serif">Acceptance</h2>
          <div className="card-field">
            <span className="field-label">Accepted by</span>
            <div className="field-val">{entry.acceptance.accepted_by || '—'}</div>
          </div>
          <div className="card-field">
            <span className="field-label">Accepted at</span>
            <div className="field-val mono">{entry.acceptance.accepted_at ? formatDateShort(entry.acceptance.accepted_at) : '—'}</div>
          </div>
          <div className="card-field">
            <span className="field-label">Inspection report</span>
            <div className="field-val">{entry.acceptance.inspection_report_id || '—'}</div>
          </div>
          <div className="card-field">
            <span className="field-label">Cost disclosed</span>
            <div className="field-val">{hasCost ? `${entry.acceptance.cost_disclosed!.amount} ${entry.acceptance.cost_disclosed!.currency}` : '—'}</div>
          </div>
        </section>

        <section className="detail-card">
          <h2 className="card-title serif">Integrity</h2>
          <div className="card-field">
            <span className="field-label">Hash anchor</span>
            <div className="field-val mono hash-anchor">{hashShort(entry.hash_anchor)}</div>
          </div>
          <div className="card-field">
            <span className="field-label">Hash status</span>
            <div className="field-val"><span className={`status-chip ${entry.hash_anchor ? 'anchored' : 'none'}`}>{entry.hash_anchor ? 'anchored' : 'none'}</span></div>
          </div>
          <div className="card-field">
            <span className="field-label">Recorded by</span>
            <div className="field-val">{entry.recorded_by}</div>
          </div>
          <div className="card-field">
            <span className="field-label">Version</span>
            <div className="field-val mono">{entry.version}</div>
          </div>
        </section>
      </div>

      <div className="ontology-panel">
        <span className="ontology-label">Ontology in this view</span>
        <p><strong>Acceptance does not prove settlement.</strong> A contribution is preserved independently of the outcome. Hashing establishes integrity of covered content, not truth or validity.</p>
        <p><strong>Disclosure levels:</strong> public · participant · restricted. Access classification does not indicate evidence strength.</p>
      </div>
    </section>
  );
}

export function Records() {
  const [lens, setLens] = useState<Lens>('roll');
  const [timeIndex, setTimeIndex] = useState(TIME_AXIS_LABELS.length - 1);
  const [rollEntries, setRollEntries] = useState<RollEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<RollEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    queryRollEntries()
      .then((data) => {
        setRollEntries(data);
        setLoading(false);
      })
      .catch((error) => {
        setLoadError(error instanceof Error ? error.message : 'Failed to load Roll entries');
        setLoading(false);
      });
  }, []);

  const filteredEntries = useMemo(() => {
    return rollEntries.filter((entry) => {
      const monthKey = TIME_AXIS_LABELS[timeIndex];
      const monthStart = `${monthKey}-01`;
      return entry.recorded_at >= monthStart;
    });
  }, [rollEntries, timeIndex]);

  return (
    <WorkspaceLayout currentContext={`records:${lens}` as const}>
      <div className="records-page">
        {selectedEntry ? (
          <RecordDetailView entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
        ) : (
          <>
            <PageHead
              eyebrow="Records"
              title="Records"
              subtitle="Three lenses on the same evidence: Canon (qualified state), Annals (event chronology), Roll (evidence ledger)"
            />
            <nav className="records-lens-nav" role="tablist" aria-label="Records lenses">
              {LENSES.map((l) => (
                <button key={l.id} id={`records-tab-${l.id}`} role="tab" aria-selected={lens === l.id} aria-controls={`records-panel-${l.id}`} className={`records-lens-tab${lens === l.id ? ' is-active' : ''}`} onClick={() => setLens(l.id)} type="button">
                  <span className="tab-label">{l.label}</span>
                  <span className="tab-hint mono dim">{l.hint}</span>
                </button>
              ))}
            </nav>
            <div className="records-time-axis-global" role="group" aria-label="Global time axis (scrubs all lenses)">
              <span className="time-axis-label">Time axis</span>
              <div className="time-axis-track">
                {TIME_AXIS_LABELS.map((label, i) => (
                  <button key={label} className={`time-axis-tick${i === timeIndex ? ' is-active' : ''}`} onClick={() => setTimeIndex(i)} type="button" aria-label={label} aria-pressed={i === timeIndex}>{label}</button>
                ))}
              </div>
            </div>
            <div id={`records-panel-${lens}`} role="tabpanel" aria-labelledby={`records-tab-${lens}`}>
              {loading ? (
                <div className="records-loading" role="status">
                  <span className="loading-icon mono">···</span> Loading Roll entries…
                </div>
              ) : loadError ? (
                <div className="records-query-error" role="alert">
                  <strong>Roll entries could not be loaded.</strong>
                  <p>{loadError}</p>
                </div>
              ) : lens === 'roll' ? (
                <RollCloseOutView entries={filteredEntries} timeIndex={timeIndex} onSelect={setSelectedEntry} />
              ) : lens === 'canon' ? (
                <CanonQualifiedView />
              ) : (
                <ClaimsEvidenceView entries={filteredEntries} />
              )}
            </div>
            <aside className="records-cross-lens" aria-label="Cross-lens navigation">
              <h3 className="cross-lens-title serif">Cross-lens paths</h3>
              <ul className="cross-lens-list">
                <li><Link href="/workspace/network/people">Entity in Network</Link> then Annals events then Roll evidence</li>
                <li><Link href="/workspace/records/roll">Roll entry</Link> then Annals timeline then Canon state</li>
              </ul>
            </aside>
          </>
        )}
      </div>
    </WorkspaceLayout>
  );
}
  const publicEv = entry.evidence.filter((e) => e.layer === 'public').length;
  const participantEv = entry.evidence.filter((e) => e.layer === 'participant').length;
  const restrictedEv = entry.evidence.filter((e) => e.layer === 'restricted').length;

  return (
    <section className="records-lens records-lens-annals" aria-labelledby="claims-evidence-title">
      <div className="lens-head">
        <div className="lens-identity">
          <p className="kicker">APT-LABS <span className="sep">/</span> RECORDS <span className="sep">/</span> CLAIMS</p>
          <h1 className="lens-title" id="claims-evidence-title">Claims & evidence</h1>
          <p className="lens-subtitle">How a claim is substantiated — subject, predicate, evidence, method, review, and challenge history. Claim is not evidence.</p>
        </div>
        <div className="lens-metrics">
          <div className="metric metric-primary">
            <span className="metric-label">Claim</span>
            <div className="metric-value mono">clm-2026-10-17-01</div>
            <span className="metric-tag">bounded assertion</span>
          </div>
          <div className="metric">
            <span className="metric-label">Verdict</span>
            <div className="metric-value">Substantiated</div>
            <span className="metric-tag">evidence-based</span>
          </div>
          <div className="metric">
            <span className="metric-label">Basis</span>
            <div className="metric-value mono">{entry.id}</div>
            <span className="metric-tag">Roll entry</span>
          </div>
        </div>
      </div>
      <hr className="lens-rule" />
      <div className="claim-card">
        <div className="claim-head">
          <div className="claim-meta-row">
            <span className="verdict-badge verdict-substantiated">Substantiated</span>
            <span className="claim-type mono dim">claim · evidence-based</span>
          </div>
          <h2 className="claim-title serif">{entry.title}</h2>
        </div>
        <div className="claim-grid">
          <div className="claim-body">
            <div className="claim-field">
              <span className="field-label">Subject</span>
              <div className="field-val serif">{entry.title} · {entry.undertaking_id}</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Predicate</span>
              <div className="field-val">Delivered and accepted on-site per undertaking scope</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Assertion</span>
              <div className="field-val strong">{entry.scope}</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Claimant</span>
              <div className="field-val"><strong>Commons steward · person-09</strong></div>
            </div>
            <div className="claim-field">
              <span className="field-label">Effective time</span>
              <div className="field-val mono">{formatDateTime(entry.recorded_at)} EAT</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Recorded time</span>
              <div className="field-val mono">{formatDateTime(entry.recorded_at)} EAT</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Method & basis</span>
              <div className="field-val">On-site inspection + delivery photo + anchor attestation (public + participant layers)</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Reviewer</span>
              <div className="field-val">Roll steward · person-14</div>
            </div>
            <div className="claim-field">
              <span className="field-label">Review result</span>
              <div className="field-val"><strong>Substantiated</strong> — evidence supports the claim within stated scope</div>
            </div>
          </div>
          <aside className="claim-rail" aria-label="Claim inspector">
            <div className="rail-head">
              <span className="section-label">Claim metadata</span>
              <span className="rail-cap mono dim">Governed claim record</span>
            </div>
            <div className="rail-body">
              <div className="rail-item">
                <span className="field-label">Claim ID</span>
                <div className="field-val mono">clm-2026-10-17-01</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Schema version</span>
                <div className="field-val mono">v1</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Origin</span>
                <div className="field-val">Roll entry · {entry.id}</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Subject org</span>
                <div className="field-val">{entry.commissioned_by.name} · inst-04</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Disclosure</span>
                <div className="field-val">Public · participant</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Consent basis</span>
                <div className="field-val">Undertaking terms</div>
              </div>
              <div className="rail-item">
                <span className="field-label">Retention</span>
                <div className="field-val">Institutional memory</div>
              </div>
            </div>
          </aside>
        </div>
        <div className="evidence-panel">
          <div className="evidence-head">
            <span className="section-label">Supporting evidence</span>
            <span className="evidence-count mono dim">{entry.evidence.length} artifacts · 3 layers</span>
          </div>
          <div className="evidence-list">
            {entry.evidence.map((ev) => (
              <div key={ev.id} className="evidence-item">
                <div className="evidence-role">
                  <RingedEvidenceMarker size={10} color={ev.layer === 'public' ? 'var(--state-canon)' : ev.layer === 'participant' ? 'var(--terrain)' : 'var(--muted)'} filled={ev.layer === 'restricted'} />
                  <span className="evidence-role-label">{ev.title}</span>
                </div>
                <span className="evidence-description">{ev.description || 'No description recorded'}</span>
                <span className="evidence-layer-tag mono dim">{ev.layer.charAt(0).toUpperCase() + ev.layer.slice(1)} · {ev.layer}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ontology-panel">
        <span className="ontology-label">Ontology in this view</span>
        <p><b className="distinction-type">Claim</b> ≠ Evidence: the assertion is bounded by subject, predicate, and scope; each artifact is linked as evidence explaining how and within what scope it supports the claim.</p>
        <p>Origin, claim basis, verification method, lifecycle, and disclosure are separate. A record-level badge is not universal evidence of truth.</p>
      </div>
      <p className="lens-note">Browser-local demo. Synthetic records stay in this browser. Sample acceptance and visibility labels are not authoritative.</p>
    </section>
  );
}
