import { useState, useMemo, useEffect } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead, type PageHeadMetric } from '../../components/PageHead';
import { useClock } from '../../hooks/useClock';

type CommonsKind = 'shared-resources' | 'land-commons' | 'knowledge' | 'energy' | 'water' | 'infrastructure' | 'digital';
type CommonsStatus = 'active' | 'dormant' | 'seeding' | 'contested' | 'archived';

interface CommonsRecord {
  id: string;
  name: string;
  kind: CommonsKind;
  status: CommonsStatus;
  description: string;
  location: string;
  coordinates: [number, number];
  stewards: number;
  members: number;
  assets: number;
  evidenceCount: number;
  createdAt: string;
  lastActivity: string;
  tags: string[];
  evidenceLayers: { layer: 'public' | 'participant' | 'restricted'; count: number }[];
}

const KIND_LABELS: Record<CommonsKind, string> = {
  'shared-resources': 'Shared Resources',
  'land-commons': 'Land Commons',
  'knowledge': 'Knowledge Commons',
  'energy': 'Energy Commons',
  'water': 'Water Commons',
  'infrastructure': 'Infrastructure Commons',
  'digital': 'Digital Commons',
};

const KIND_COLORS: Record<CommonsKind, string> = {
  'shared-resources': 'var(--state-canon)',
  'land-commons': 'var(--state-caution)',
  'knowledge': 'var(--water)',
  'energy': 'var(--state-proposed)',
  'water': 'var(--water)',
  'infrastructure': 'var(--state-risk)',
  'digital': 'var(--state-canon)',
};

const STATUS_LABELS: Record<CommonsStatus, string> = {
  active: 'Active',
  dormant: 'Dormant',
  seeding: 'Seeding',
  contested: 'Contested',
  archived: 'Archived',
};

const STATUS_COLORS: Record<CommonsStatus, string> = {
  active: 'var(--state-canon)',
  dormant: 'var(--text-muted)',
  seeding: 'var(--state-proposed)',
  contested: 'var(--state-risk)',
  archived: 'var(--dim)',
};

const MOCK_COMMONS: CommonsRecord[] = [
  {
    id: 'open-design-library',
    name: 'Open Design Library',
    kind: 'shared-resources',
    status: 'active',
    description: 'A curated pattern library for cooperative infrastructure — from solar microgrids to governance templates. Each pattern carries its provenance, stewardship chain, and evidence of use.',
    location: 'Nairobi / Distributed',
    coordinates: [-1.2921, 36.8219],
    stewards: 12,
    members: 247,
    assets: 89,
    evidenceCount: 312,
    createdAt: '2022-03-15',
    lastActivity: '2026-11-02',
    tags: ['patterns', 'governance', 'infrastructure', 'open-source'],
    evidenceLayers: [
      { layer: 'public', count: 156 },
      { layer: 'participant', count: 112 },
      { layer: 'restricted', count: 44 },
    ],
  },
  {
    id: 'community-land-trust',
    name: 'Community Land Trust',
    kind: 'land-commons',
    status: 'active',
    description: '42 hectares held in permanent trust for cooperative housing, urban agriculture, and community facilities across three sites. Governance by resident assembly with external stewardship council.',
    location: 'Berlin / Oaxaca / Nairobi',
    coordinates: [52.5200, 13.4050],
    stewards: 8,
    members: 156,
    assets: 42,
    evidenceCount: 198,
    createdAt: '2019-07-22',
    lastActivity: '2026-10-28',
    tags: ['land', 'housing', 'agriculture', 'trust'],
    evidenceLayers: [
      { layer: 'public', count: 67 },
      { layer: 'participant', count: 89 },
      { layer: 'restricted', count: 42 },
    ],
  },
  {
    id: 'knowledge-repository',
    name: 'Knowledge Repository',
    kind: 'knowledge',
    status: 'active',
    description: '1,200+ field guides, technical manuals, and oral histories documented by practitioners. Versioned with attribution chains; each entry links to evidence in the Roll.',
    location: 'Digital / MWEA Studio',
    coordinates: [-1.2921, 36.8219],
    stewards: 24,
    members: 892,
    assets: 1247,
    evidenceCount: 2103,
    createdAt: '2021-11-08',
    lastActivity: '2026-11-05',
    tags: ['documentation', 'guides', 'oral-history', 'versioned'],
    evidenceLayers: [
      { layer: 'public', count: 892 },
      { layer: 'participant', count: 756 },
      { layer: 'restricted', count: 455 },
    ],
  },
  {
    id: 'solar-commons-initiative',
    name: 'Solar Commons Initiative',
    kind: 'energy',
    status: 'seeding',
    description: 'Cooperatively owned solar arrays feeding a shared energy pool. Metering, allocation, and maintenance governed by participant assembly with technical advisory board.',
    location: 'Oaxaca / Kibera',
    coordinates: [17.0732, -96.7266],
    stewards: 6,
    members: 78,
    assets: 14,
    evidenceCount: 67,
    createdAt: '2023-05-12',
    lastActivity: '2026-09-14',
    tags: ['solar', 'energy', 'cooperative', 'metering'],
    evidenceLayers: [
      { layer: 'public', count: 34 },
      { layer: 'participant', count: 28 },
      { layer: 'restricted', count: 5 },
    ],
  },
  {
    id: 'watershed-stewardship',
    name: 'Watershed Stewardship Collective',
    kind: 'water',
    status: 'active',
    description: 'Community-managed watershed protection across 3 catchments. Monitoring, restoration, and allocation rules encoded in local bylaws with satellite verification.',
    location: 'Addis Ababa / Kigali',
    coordinates: [9.0320, 38.7469],
    stewards: 11,
    members: 203,
    assets: 7,
    evidenceCount: 145,
    createdAt: '2020-09-30',
    lastActivity: '2026-10-15',
    tags: ['water', 'watershed', 'monitoring', 'restoration'],
    evidenceLayers: [
      { layer: 'public', count: 89 },
      { layer: 'participant', count: 42 },
      { layer: 'restricted', count: 14 },
    ],
  },
  {
    id: 'mesh-infrastructure-commons',
    name: 'Mesh Infrastructure Commons',
    kind: 'infrastructure',
    status: 'contested',
    description: 'Community wireless mesh spanning 4 neighborhoods. Spectrum access disputed; governance forked into parallel assemblies. Evidence collection ongoing for Annals disposition.',
    location: 'Lagos / Cape Town',
    coordinates: [6.5244, 3.3792],
    stewards: 5,
    members: 134,
    assets: 23,
    evidenceCount: 89,
    createdAt: '2022-11-18',
    lastActivity: '2026-11-01',
    tags: ['wireless', 'mesh', 'spectrum', 'governance'],
    evidenceLayers: [
      { layer: 'public', count: 45 },
      { layer: 'participant', count: 34 },
      { layer: 'restricted', count: 10 },
    ],
  },
  {
    id: 'code-commons',
    name: 'Code Commons',
    kind: 'digital',
    status: 'active',
    description: 'Shared codebase repository for cooperative tooling — governance clients, evidence wallets, simulation engines. Licensed under reciprocal public license with contribution covenant.',
    location: 'Distributed',
    coordinates: [0, 0],
    stewards: 18,
    members: 412,
    assets: 67,
    evidenceCount: 534,
    createdAt: '2021-02-14',
    lastActivity: '2026-11-07',
    tags: ['code', 'tooling', 'reciprocal-license', 'covenant'],
    evidenceLayers: [
      { layer: 'public', count: 312 },
      { layer: 'participant', count: 189 },
      { layer: 'restricted', count: 33 },
    ],
  },
];

function StatusChip({ status }: { status: CommonsStatus }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      background: `color-mix(in srgb, ${STATUS_COLORS[status]} 12%, transparent)`,
      border: `1px solid ${STATUS_COLORS[status]}`,
      borderRadius: 'var(--radius-pill)',
      font: '500 var(--step--2) var(--mono)',
      color: STATUS_COLORS[status],
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function KindChip({ kind }: { kind: CommonsKind }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      background: `color-mix(in srgb, ${KIND_COLORS[kind]} 12%, transparent)`,
      border: `1px solid ${KIND_COLORS[kind]}`,
      borderRadius: 'var(--radius-pill)',
      font: '500 var(--step--2) var(--mono)',
      color: KIND_COLORS[kind],
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
    }}>
      {KIND_LABELS[kind]}
    </span>
  );
}

function EvidenceBands({ layers }: { layers: CommonsRecord['evidenceLayers'] }) {
  const total = layers.reduce((sum, l) => sum + l.count, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {layers.map(l => (
        <div key={l.layer} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            width: '100%',
            height: '6px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-pill)',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${total > 0 ? (l.count / total) * 100 : 0}%`,
              background: l.layer === 'public' ? 'var(--state-canon)' : l.layer === 'participant' ? 'var(--state-proposed)' : 'var(--state-risk)',
              borderRadius: 'var(--radius-pill)',
            }} />
          </span>
          <span style={{
            font: 'var(--step--2) var(--mono)',
            color: l.layer === 'public' ? 'var(--state-canon)' : l.layer === 'participant' ? 'var(--state-proposed)' : 'var(--state-risk)',
            width: '50px',
            textAlign: 'right',
          }}>
            {l.count}
          </span>
          <span style={{
            font: 'var(--step--2) var(--mono)',
            color: 'var(--text-muted)',
            textTransform: 'capitalize',
            width: '70px',
          }}>
            {l.layer}
          </span>
        </div>
      ))}
    </div>
  );
}

function CommonsCard({ record, onSelect, selected }: { record: CommonsRecord; onSelect: () => void; selected: boolean }) {
  const color = KIND_COLORS[record.kind];
  return (
    <article
      onClick={onSelect}
      style={{
        border: `1px solid ${selected ? color : 'var(--border)'}`,
        borderRadius: 'var(--radius-3)',
        padding: 'var(--space-4)',
        background: selected ? `color-mix(in srgb, ${color} 6%, var(--bg-elev))` : 'var(--bg-elev)',
        cursor: 'pointer',
        transition: 'all var(--fast)',
        boxShadow: selected ? 'var(--shadow-2)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <KindChip kind={record.kind} />
            <StatusChip status={record.status} />
          </div>
          <h3 style={{ margin: '0 0 var(--space-1)', font: '500 var(--step-1) var(--serif)', color: 'var(--text)', lineHeight: 1.2 }}>
            {record.name}
          </h3>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%',
          background: `color-mix(in srgb, ${color} 18%, transparent)`,
          border: `1px solid ${color}`,
          display: 'grid', placeItems: 'center',
          font: '700 14px var(--mono)',
          color: color,
        }}>
          {record.id.slice(0, 3).toUpperCase()}
        </div>
      </div>

      <p style={{ margin: '0 0 var(--space-3)', font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
        {record.description}
      </p>

      <div style={{ marginBottom: 'var(--space-3)', font: 'var(--step--1) var(--mono)', color: 'var(--text-faint)' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginRight: 'var(--space-3)' }}>
          <span style={{ color: 'var(--text-muted)' }}>📍</span>
          {record.location}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: 'var(--text-muted)' }}>📅</span>
          {new Date(record.createdAt).getFullYear()}
        </span>
      </div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <EvidenceBands layers={record.evidenceLayers} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', font: 'var(--step--1) var(--mono)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--state-canon)' }}>●</span>
            {record.stewards} stewards
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--state-proposed)' }}>●</span>
            {record.members} members
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--state-caution)' }}>●</span>
            {record.assets} assets
          </span>
        </div>
        <span style={{ color: 'var(--text-faint)' }}>
          {record.evidenceCount} evidence
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'auto' }}>
        {record.tags.slice(0, 4).map(tag => (
          <span key={tag} style={{
            padding: '2px 8px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-1)',
            font: 'var(--step--2) var(--mono)',
            color: 'var(--text-muted)',
          }}>
            #{tag}
          </span>
        ))}
        {record.tags.length > 4 && (
          <span style={{
            padding: '2px 8px',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-1)',
            font: 'var(--step--2) var(--mono)',
            color: 'var(--text-faint)',
          }}>
            +{record.tags.length - 4} more
          </span>
        )}
      </div>
    </article>
  );
}

function CommonsDetailPanel({ record, onClose }: { record: CommonsRecord | null; onClose: () => void }) {
  if (!record) return null;
  const color = KIND_COLORS[record.kind];

  return (
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '24px',
      bottom: '50px',
      width: '420px',
      maxWidth: 'calc(100vw - 48px)',
      background: 'var(--bg-elev)',
      border: `1px solid ${color}`,
      borderRadius: 'var(--radius-4)',
      boxShadow: 'var(--shadow-3)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: 100,
      animation: 'slideIn 0.2s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: 'var(--space-4)', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <KindChip kind={record.kind} />
            <StatusChip status={record.status} />
          </div>
          <h2 style={{ margin: 0, font: '400 var(--step-2) var(--serif)', color: 'var(--text)' }}>
            {record.name}
          </h2>
          <p style={{ margin: 'var(--space-1) 0 0', font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
            {record.location}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: '1px solid var(--border)', background: 'var(--bg)',
            color: 'var(--text-muted)', cursor: 'pointer',
            display: 'grid', placeItems: 'center', fontSize: '18px', lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Description
          </h4>
          <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', lineHeight: 1.6, color: 'var(--text)' }}>
            {record.description}
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Evidence Layers
          </h4>
          <EvidenceBands layers={record.evidenceLayers} />
          <p style={{ margin: 'var(--space-2) 0 0', font: 'var(--step--1) var(--mono)', color: 'var(--text-faint)' }}>
            Total: {record.evidenceLayers.reduce((s, l) => s + l.count, 0)} records
          </p>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Capacity
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
            {[
              { label: 'Stewards', value: record.stewards, color: 'var(--state-canon)' },
              { label: 'Members', value: record.members, color: 'var(--state-proposed)' },
              { label: 'Assets', value: record.assets, color: 'var(--state-caution)' },
              { label: 'Evidence', value: record.evidenceCount, color: 'var(--water)' },
            ].map(item => (
              <div key={item.label} style={{
                padding: 'var(--space-3)',
                background: `color-mix(in srgb, ${item.color} 8%, var(--bg-subtle))`,
                border: `1px solid color-mix(in srgb, ${item.color} 25%, var(--border))`,
                borderRadius: 'var(--radius-2)',
                textAlign: 'center',
              }}>
                <div style={{ font: '700 var(--step-2) var(--mono)', color: item.color }}>
                  {item.value}
                </div>
                <div style={{ font: 'var(--step--1) var(--mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Timeline
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', font: 'var(--step--1) var(--mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Created</span>
              <span>{new Date(record.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last Activity</span>
              <span>{new Date(record.lastActivity).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coordinates</span>
              <span>{record.coordinates[0].toFixed(4)}, {record.coordinates[1].toFixed(4)}</span>
            </div>
          </div>
        </section>

        <section>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Tags
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {record.tags.map(tag => (
              <span key={tag} style={{
                padding: '4px 10px',
                background: `color-mix(in srgb, ${color} 12%, var(--bg-subtle))`,
                border: `1px solid ${color}`,
                borderRadius: 'var(--radius-1)',
                font: 'var(--step--1) var(--mono)',
                color: color,
              }}>
                #{tag}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div style={{
        padding: 'var(--space-3) var(--space-4)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
        display: 'flex', gap: 'var(--space-2)',
      }}>
        <button style={{
          flex: 1, padding: 'var(--space-2) var(--space-3)',
          background: color, color: 'var(--bg)', border: 'none',
          borderRadius: 'var(--radius-2)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer',
        }}>Open in Network</button>
        <button style={{
          flex: 1, padding: 'var(--space-2) var(--space-3)',
          background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-2)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer',
        }}>View Roll</button>
      </div>
    </div>
  );
}

function StatsHeader({ records, filteredCount }: { records: CommonsRecord[]; filteredCount: number }) {
  const activeCount = records.filter(r => r.status === 'active').length;
  const seedingCount = records.filter(r => r.status === 'seeding').length;
  const contestedCount = records.filter(r => r.status === 'contested').length;
  const totalStewards = records.reduce((s, r) => s + r.stewards, 0);
  const totalMembers = records.reduce((s, r) => s + r.members, 0);
  const totalEvidence = records.reduce((s, r) => s + r.evidenceCount, 0);

  return (
    <div style={{
      position: 'fixed', top: '80px', left: '24px', right: '24px',
      maxWidth: '1440px', margin: '0 auto', zIndex: 50,
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-3)',
    }}>
      {[
        { label: 'COMMONS', value: filteredCount, total: records.length, color: 'var(--text)' },
        { label: 'ACTIVE', value: activeCount, color: 'var(--state-canon)' },
        { label: 'SEEDING', value: seedingCount, color: 'var(--state-proposed)' },
        { label: 'CONTESTED', value: contestedCount, color: 'var(--state-risk)' },
        { label: 'STEWARDS', value: totalStewards, color: 'var(--state-canon)' },
        { label: 'MEMBERS', value: totalMembers, color: 'var(--state-proposed)' },
        { label: 'EVIDENCE', value: totalEvidence, color: 'var(--water)' },
      ].map((stat, i) => (
        <div key={i} style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--bg-elev)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-3)',
        }}>
          <div style={{ font: '500 var(--step--1) var(--mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {stat.label}
          </div>
          <div style={{ font: '700 var(--step-2) var(--mono)', color: stat.color }}>
            {stat.value}
          </div>
          {stat.total !== undefined && (
            <div style={{ font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)' }}>
              / {stat.total}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FilterBar({ filter, setFilter, filterKind, setFilterKind, filterStatus, setFilterStatus, kinds }: {
  filter: string; setFilter: (v: string) => void;
  filterKind: string; setFilterKind: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  kinds: CommonsKind[];
}) {
  return (
    <div style={{
      position: 'fixed', top: '160px', left: '24px', right: '24px',
      maxWidth: '1440px', margin: '0 auto', zIndex: 50,
      display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap',
    }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
        <input
          type="text" placeholder="Filter commons…"
          value={filter} onChange={(e: Event) => setFilter((e.target as HTMLInputElement).value)}
          style={{
            width: '100%', padding: 'var(--space-2) var(--space-3) var(--space-2) 40px',
            border: '1px solid var(--border)', borderRadius: 'var(--radius-3)',
            background: 'var(--bg-elev)', color: 'var(--text)',
            font: 'var(--step-0) var(--sans)', outline: 'none',
          }}
        />
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '16px' }}>
          🔍
        </span>
      </div>
      <select value={filterKind} onChange={(e: Event) => setFilterKind((e.target as HTMLSelectElement).value)}
        style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }}>
        <option value="all">All Kinds</option>
        {kinds.map(k => <option key={k} value={k}>{KIND_LABELS[k]}</option>)}
      </select>
      <select value={filterStatus} onChange={(e: Event) => setFilterStatus((e.target as HTMLSelectElement).value)}
        style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }}>
        <option value="all">All Status</option>
        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  );
}

export function Commons() {
  useClock();
  const [filter, setFilter] = useState('');
  const [filterKind, setFilterKind] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<CommonsRecord | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRecords = useMemo(() => {
    let result = MOCK_COMMONS;
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter(r =>
        r.name.toLowerCase().includes(f) ||
        r.description.toLowerCase().includes(f) ||
        r.location.toLowerCase().includes(f) ||
        r.tags.some(t => t.toLowerCase().includes(f))
      );
    }
    if (filterKind !== 'all') result = result.filter(r => r.kind === filterKind);
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    return result;
  }, [filter, filterKind, filterStatus]);

  const kinds = useMemo(() => Array.from(new Set(MOCK_COMMONS.map(r => r.kind))) as CommonsKind[], []);

  const metrics: PageHeadMetric[] = [
    { label: 'Total', value: MOCK_COMMONS.length, state: 'canon' },
    { label: 'Active', value: MOCK_COMMONS.filter(r => r.status === 'active').length, state: 'canon' },
    { label: 'Stewards', value: MOCK_COMMONS.reduce((s, r) => s + r.stewards, 0), state: 'proposed' },
    { label: 'Evidence', value: MOCK_COMMONS.reduce((s, r) => s + r.evidenceCount, 0), state: 'caution' },
  ];

  useEffect(() => { window.addEventListener('keydown', e => { if (e.key === 'Escape') setSelected(null); }); return () => window.removeEventListener('keydown', e => { if (e.key === 'Escape') setSelected(null); }); }, []);

  return (
    <WorkspaceLayout currentContext="commons">
      <div className="commons-page" style={{ position: 'relative', minHeight: '100vh' }}>
        <PageHead
          eyebrow="APT-LABS / COMMONS"
          title="Commons Registry"
          subtitle="Field-book of shared resources — stewarded, evidenced, and governed. Filter by kind, status, or search."
          metrics={metrics}
          quietActions={[
            { label: 'Export field book', onClick: () => {} },
            { label: 'New commons entry', onClick: () => {} },
          ]}
        />

        <StatsHeader records={MOCK_COMMONS} filteredCount={filteredRecords.length} />
        <FilterBar filter={filter} setFilter={setFilter} filterKind={filterKind} setFilterKind={setFilterKind} filterStatus={filterStatus} setFilterStatus={setFilterStatus} kinds={kinds} />

        <div style={{ marginTop: '230px', padding: '0 var(--space-4) var(--space-6)', maxWidth: '1440px', margin: '230px auto var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
              {filteredRecords.length} of {MOCK_COMMONS.length} commons
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'is-active' : ''}
                style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', background: viewMode === 'grid' ? 'var(--state-canon-wash)' : 'var(--bg-elev)', color: viewMode === 'grid' ? 'var(--state-canon)' : 'var(--text)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'is-active' : ''}
                style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', background: viewMode === 'list' ? 'var(--state-canon-wash)' : 'var(--bg-elev)', color: viewMode === 'list' ? 'var(--state-canon)' : 'var(--text)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}
              >
                List
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 'var(--space-4)' }}>
              {filteredRecords.map(record => (
                <CommonsCard key={record.id} record={record} onSelect={() => setSelected(record)} selected={selected?.id === record.id} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {filteredRecords.map(record => (
                <CommonsCard key={record.id} record={record} onSelect={() => setSelected(record)} selected={selected?.id === record.id} />
              ))}
            </div>
          )}

          {filteredRecords.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <p style={{ font: 'var(--step-1) var(--serif)', margin: '0 0 var(--space-2)' }}>No commons match your filters</p>
              <p style={{ font: 'var(--step-0) var(--sans)', margin: 0 }}>Adjust your search or filters to find what you need.</p>
            </div>
          )}
        </div>

        <CommonsDetailPanel record={selected} onClose={() => setSelected(null)} />

        <div style={{
          position: 'fixed', bottom: '16px', right: '24px', zIndex: 50,
          background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)',
          padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--step--2)', fontFamily: 'var(--mono)', color: 'var(--text-faint)', textAlign: 'right',
        }}>
          <div>ESC — Clear selection</div>
          <div>CLICK — Open detail</div>
          <div style={{ marginTop: '4px', color: 'var(--state-canon)', fontWeight: 500 }}>
            {MOCK_COMMONS.filter(r => r.status === 'active').length} active · {MOCK_COMMONS.filter(r => r.status === 'seeding').length} seeding · {MOCK_COMMONS.filter(r => r.status === 'contested').length} contested
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
