import { useState, useMemo, useEffect } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead, type PageHeadMetric } from '../../components/PageHead';
import { useClock } from '../../hooks/useClock';

type InstitutionType = 'creative-collective' | 'housing-cooperative' | 'energy-cooperative' | 'tech-collective' | 'makerspace' | 'research-lab' | 'community-trust' | 'education' | 'health' | 'infrastructure';
type InstitutionStatus = 'active' | 'dormant' | 'forming' | 'transitioning' | 'archived';

interface InstitutionRecord {
  id: string;
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  description: string;
  location: string;
  coordinates: [number, number];
  founded: string;
  members: number;
  crews: number;
  assets: number;
  evidenceCount: number;
  commonsRefs: string[];
  tags: string[];
  capacity: { label: string; value: number; unit: string; trend: 'up' | 'down' | 'stable' }[];
  governance: { model: string; assemblyFrequency: string; quorum: string; lastAssembly: string };
  contact: { email?: string; matrix?: string; signal?: string; website?: string };
}

const TYPE_LABELS: Record<InstitutionType, string> = {
  'creative-collective': 'Creative Collective',
  'housing-cooperative': 'Housing Cooperative',
  'energy-cooperative': 'Energy Cooperative',
  'tech-collective': 'Tech Collective',
  'makerspace': 'Makerspace',
  'research-lab': 'Research Lab',
  'community-trust': 'Community Trust',
  'education': 'Education Institution',
  'health': 'Health Cooperative',
  'infrastructure': 'Infrastructure Cooperative',
};

const TYPE_COLORS: Record<InstitutionType, string> = {
  'creative-collective': 'var(--water)',
  'housing-cooperative': 'var(--state-caution)',
  'energy-cooperative': 'var(--state-proposed)',
  'tech-collective': 'var(--state-canon)',
  'makerspace': 'var(--state-risk)',
  'research-lab': 'var(--phosphor)',
  'community-trust': 'var(--state-canon)',
  'education': 'var(--water)',
  'health': 'var(--state-risk)',
  'infrastructure': 'var(--state-caution)',
};

const STATUS_LABELS: Record<InstitutionStatus, string> = {
  active: 'Active',
  dormant: 'Dormant',
  forming: 'Forming',
  transitioning: 'Transitioning',
  archived: 'Archived',
};

const STATUS_COLORS: Record<InstitutionStatus, string> = {
  active: 'var(--state-canon)',
  dormant: 'var(--text-muted)',
  forming: 'var(--state-proposed)',
  transitioning: 'var(--state-caution)',
  archived: 'var(--dim)',
};

const MOCK_INSTITUTIONS: InstitutionRecord[] = [
  {
    id: 'mwea-animation-studio',
    name: 'MWEA Animation Studio',
    type: 'creative-collective',
    status: 'active',
    description: 'Award-winning animation collective producing narrative work for cooperative movements. Pioneered the "story-as-specification" methodology where character arcs encode governance logic. Work spans film, interactive media, and protocol design.',
    location: 'Nairobi, Kenya',
    coordinates: [-1.2921, 36.8219],
    founded: '2022-03-15',
    members: 47,
    crews: 8,
    assets: 23,
    evidenceCount: 512,
    commonsRefs: ['open-design-library', 'knowledge-repository'],
    tags: ['animation', 'narrative', 'protocol-design', 'story-as-spec'],
    capacity: [
      { label: 'Creative Output', value: 12, unit: 'projects/yr', trend: 'up' },
      { label: 'Narrative Specs', value: 34, unit: 'active', trend: 'up' },
      { label: 'Contributors', value: 47, unit: 'members', trend: 'stable' },
      { label: 'Revenue', value: 2400000, unit: 'KES/yr', trend: 'up' },
    ],
    governance: { model: 'Consent-based sociocracy', assemblyFrequency: 'Bi-weekly', quorum: '40% of circles', lastAssembly: '2026-10-28' },
    contact: { email: 'hello@mwea.studio', matrix: '#mwea:matrix.org', website: 'https://mwea.studio' },
  },
  {
    id: 'cooperative-housing-trust',
    name: 'Cooperative Housing Trust',
    type: 'housing-cooperative',
    status: 'active',
    description: 'Multi-city housing cooperative holding 42 hectares in permanent trust. Resident assemblies govern allocation, maintenance, and development. Pioneered onchain governance for housing decisions with offchain dispute resolution.',
    location: 'Berlin / Oaxaca / Nairobi',
    coordinates: [52.5200, 13.4050],
    founded: '2019-07-22',
    members: 312,
    crews: 14,
    assets: 42,
    evidenceCount: 892,
    commonsRefs: ['community-land-trust', 'mesh-infrastructure-commons'],
    tags: ['housing', 'land-trust', 'onchain-governance', 'permanent-affordability'],
    capacity: [
      { label: 'Housing Units', value: 156, unit: 'units', trend: 'up' },
      { label: 'Land (hectares)', value: 42, unit: 'ha', trend: 'stable' },
      { label: 'Residents', value: 312, unit: 'people', trend: 'up' },
      { label: 'Reserves', value: 12500000, unit: 'KES', trend: 'up' },
    ],
    governance: { model: 'Resident assembly + stewardship council', assemblyFrequency: 'Monthly', quorum: '50% + 1', lastAssembly: '2026-10-15' },
    contact: { email: 'trust@coophousing.berlin', matrix: '#coophousing:matrix.org', website: 'https://coophousing.berlin' },
  },
  {
    id: 'solar-commons-initiative',
    name: 'Solar Commons Initiative',
    type: 'energy-cooperative',
    status: 'forming',
    description: 'Cooperatively owned solar arrays feeding a shared energy pool across Oaxaca and Kibera. Metering, allocation, and maintenance governed by participant assembly with technical advisory board. Pilot phase: 14 arrays, 78 households.',
    location: 'Oaxaca, Mexico / Kibera, Kenya',
    coordinates: [17.0732, -96.7266],
    founded: '2023-05-12',
    members: 78,
    crews: 4,
    assets: 14,
    evidenceCount: 67,
    commonsRefs: ['solar-commons-initiative'],
    tags: ['solar', 'energy-commons', 'cooperative-metering', 'energy-justice'],
    capacity: [
      { label: 'Solar Arrays', value: 14, unit: 'arrays', trend: 'up' },
      { label: 'Capacity (kW)', value: 280, unit: 'kW', trend: 'up' },
      { label: 'Households', value: 78, unit: 'households', trend: 'up' },
      { label: 'Uptime', value: 98.7, unit: '%', trend: 'stable' },
    ],
    governance: { model: 'Participant assembly + technical advisory', assemblyFrequency: 'Monthly', quorum: '30%', lastAssembly: '2026-09-14' },
    contact: { email: 'power@solarcommons.org', matrix: '#solarcommons:matrix.org' },
  },
  {
    id: 'dev2027ke',
    name: 'dev2027ke',
    type: 'tech-collective',
    status: 'active',
    description: 'Kenya-based developer collective building infrastructure for cooperative economies. Maintains the Field Desk stack, evidence wallet, and simulation engine. Open recruitment via contribution covenant.',
    location: 'Nairobi / Distributed',
    coordinates: [-1.2921, 36.8219],
    founded: '2021-11-08',
    members: 89,
    crews: 12,
    assets: 34,
    evidenceCount: 1247,
    commonsRefs: ['code-commons', 'open-design-library', 'knowledge-repository'],
    tags: ['infrastructure', 'field-desk', 'evidence-wallet', 'simulation'],
    capacity: [
      { label: 'Repositories', value: 34, unit: 'active', trend: 'up' },
      { label: 'Contributors', value: 89, unit: 'devs', trend: 'up' },
      { label: 'Deployments', value: 156, unit: 'active', trend: 'up' },
      { label: 'Uptime', value: 99.9, unit: '%', trend: 'stable' },
    ],
    governance: { model: 'Do-ocracy + maintainer council', assemblyFrequency: 'Weekly sync', quorum: '3 maintainers', lastAssembly: '2026-11-05' },
    contact: { email: 'build@dev2027.ke', matrix: '#dev2027ke:matrix.org', website: 'https://dev2027.ke' },
  },
  {
    id: 'nairobi-tech-collective',
    name: 'Nairobi Tech Collective',
    type: 'tech-collective',
    status: 'active',
    description: 'Community technology center in Mathare offering training, coworking, and hardware repair. Runs the local mesh node for Mesh Infrastructure Commons. Youth-led governance with elder advisory.',
    location: 'Mathare, Nairobi',
    coordinates: [-1.2583, 36.8822],
    founded: '2020-02-14',
    members: 156,
    crews: 6,
    assets: 18,
    evidenceCount: 234,
    commonsRefs: ['mesh-infrastructure-commons', 'knowledge-repository'],
    tags: ['training', 'coworking', 'hardware-repair', 'mesh-node', 'youth-led'],
    capacity: [
      { label: 'Trainees/yr', value: 240, unit: 'people', trend: 'up' },
      { label: 'Mesh Nodes', value: 23, unit: 'nodes', trend: 'stable' },
      { label: 'Repairs/mo', value: 89, unit: 'repairs', trend: 'up' },
      { label: 'Space (sqm)', value: 120, unit: 'm²', trend: 'stable' },
    ],
    governance: { model: 'Youth assembly + elder council', assemblyFrequency: 'Bi-weekly', quorum: '25%', lastAssembly: '2026-10-20' },
    contact: { email: 'hello@nairobitech.org', matrix: '#nairobitech:matrix.org' },
  },
  {
    id: 'berlin-housing-coop',
    name: 'Berlin Housing Coop',
    type: 'housing-cooperative',
    status: 'active',
    description: 'Second site of Cooperative Housing Trust in Berlin. 67 units in Kreuzberg governed by resident assembly. Pioneered the "rent-as-governance" model where rent payments fund common infrastructure.',
    location: 'Kreuzberg, Berlin',
    coordinates: [52.4989, 13.4083],
    founded: '2021-09-30',
    members: 134,
    crews: 5,
    assets: 12,
    evidenceCount: 345,
    commonsRefs: ['community-land-trust'],
    tags: ['housing', 'rent-governance', 'kreuzberg', 'common-infrastructure'],
    capacity: [
      { label: 'Units', value: 67, unit: 'units', trend: 'stable' },
      { label: 'Residents', value: 134, unit: 'people', trend: 'stable' },
      { label: 'Common Fund', value: 2400000, unit: 'EUR/yr', trend: 'up' },
      { label: 'Vacancy', value: 0, unit: '%', trend: 'stable' },
    ],
    governance: { model: 'Resident assembly', assemblyFrequency: 'Monthly', quorum: '30%', lastAssembly: '2026-10-10' },
    contact: { email: 'berlin@coophousing.berlin', matrix: '#berlinhousing:matrix.org' },
  },
  {
    id: 'kibera-makerspace',
    name: 'Kibera Makerspace',
    type: 'makerspace',
    status: 'active',
    description: 'Community fabrication lab in Kibera offering CNC, 3D printing, electronics, and textile tools. Tool library operates on borrowing covenant. Products feed Open Design Library commons.',
    location: 'Kibera, Nairobi',
    coordinates: [-1.3109, 36.7828],
    founded: '2022-06-18',
    members: 89,
    crews: 3,
    assets: 27,
    evidenceCount: 189,
    commonsRefs: ['open-design-library', 'code-commons'],
    tags: ['fabrication', 'tool-library', 'cnc', '3d-printing', 'textiles'],
    capacity: [
      { label: 'Tools', value: 27, unit: 'tools', trend: 'up' },
      { label: 'Active Borrowers', value: 45, unit: '/mo', trend: 'up' },
      { label: 'Patterns Published', value: 34, unit: 'patterns', trend: 'up' },
      { label: 'Workshop Days', value: 12, unit: '/mo', trend: 'stable' },
    ],
    governance: { model: 'Tool steward circle', assemblyFrequency: 'Weekly', quorum: '3 stewards', lastAssembly: '2026-11-01' },
    contact: { email: 'make@kiberamakerspace.ke', matrix: '#kiberamakers:matrix.org' },
  },
  {
    id: 'field-desk-labs',
    name: 'Field Desk Labs',
    type: 'research-lab',
    status: 'active',
    description: 'Research lab developing the Field Desk methodology — surveyor\'s precision + workshop tactility. Publishes to Knowledge Repository. Collaborates with dev2027ke on simulation engine.',
    location: 'Distributed',
    coordinates: [0, 0],
    founded: '2023-01-20',
    members: 23,
    crews: 4,
    assets: 8,
    evidenceCount: 412,
    commonsRefs: ['knowledge-repository', 'code-commons'],
    tags: ['research', 'methodology', 'surveyor', 'workshop', 'field-desk'],
    capacity: [
      { label: 'Papers', value: 12, unit: 'published', trend: 'up' },
      { label: 'Patterns', value: 34, unit: 'documented', trend: 'up' },
      { label: 'Collaborators', value: 23, unit: 'researchers', trend: 'stable' },
      { label: 'Citations', value: 156, unit: 'total', trend: 'up' },
    ],
    governance: { model: 'Research circle + peer review', assemblyFrequency: 'Monthly', quorum: '50%', lastAssembly: '2026-10-25' },
    contact: { email: 'research@fielddesklabs.org', matrix: '#fielddesklabs:matrix.org' },
  },
];

function StatusChip({ status }: { status: InstitutionStatus }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 'var(--radius-pill)',
      background: `color-mix(in srgb, ${STATUS_COLORS[status]} 12%, transparent)`,
      border: `1px solid ${STATUS_COLORS[status]}`,
      font: '500 var(--step--2) var(--mono)', color: STATUS_COLORS[status],
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function TypeChip({ type }: { type: InstitutionType }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 'var(--radius-pill)',
      background: `color-mix(in srgb, ${TYPE_COLORS[type]} 12%, transparent)`,
      border: `1px solid ${TYPE_COLORS[type]}`,
      font: '500 var(--step--2) var(--mono)', color: TYPE_COLORS[type],
      textTransform: 'uppercase', letterSpacing: '0.06em',
    }}>
      {TYPE_LABELS[type]}
    </span>
  );
}

function CapacityBar({ item, color }: { item: InstitutionRecord['capacity'][0]; color: string }) {
  return (
    <div style={{ marginBottom: 'var(--space-2)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', font: 'var(--step--1) var(--mono)' }}>
        <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
        <span style={{ color: color }}>{item.value.toLocaleString()} {item.unit}</span>
      </div>
      <div style={{ height: '4px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: '70%',
          background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, transparent))`,
          borderRadius: 'var(--radius-pill)',
          transition: 'width var(--slow)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
        <span style={{
          font: 'var(--step--2) var(--mono)',
          color: item.trend === 'up' ? 'var(--state-canon)' : item.trend === 'down' ? 'var(--state-risk)' : 'var(--text-muted)',
        }}>
          {item.trend === 'up' ? '↑' : item.trend === 'down' ? '↓' : '→'} {item.trend}
        </span>
      </div>
    </div>
  );
}

function InstitutionCard({ record, onSelect, selected }: { record: InstitutionRecord; onSelect: () => void; selected: boolean }) {
  const color = TYPE_COLORS[record.type];
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
        display: 'flex', flexDirection: 'column', height: '100%',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <TypeChip type={record.type} />
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
          font: '700 14px var(--mono)', color: color,
        }}>
          {record.id.slice(0, 3).toUpperCase()}
        </div>
      </div>

      <p style={{ margin: '0 0 var(--space-3)', font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)', lineHeight: 1.5, flex: 1 }}>
        {record.description}
      </p>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-2)', font: 'var(--step--1) var(--mono)', color: 'var(--text-muted)' }}>
          <div><span style={{ color: color }}>●</span> {record.members} members</div>
          <div><span style={{ color: 'var(--state-proposed)' }}>●</span> {record.crews} crews</div>
          <div><span style={{ color: 'var(--state-caution)' }}>●</span> {record.assets} assets</div>
          <div><span style={{ color: 'var(--water)' }}>●</span> {record.evidenceCount} evidence</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--space-2)', font: 'var(--step--1) var(--mono)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)', color: 'var(--text-muted)' }}>
          <span>📍 {record.location}</span>
          <span>📅 {new Date(record.founded).getFullYear()}</span>
        </div>
        <span style={{ color: 'var(--text-faint)' }}>
          {record.commonsRefs.length} commons
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: 'var(--space-2)' }}>
        {record.tags.slice(0, 4).map(tag => (
          <span key={tag} style={{
            padding: '2px 8px', borderRadius: 'var(--radius-1)',
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
            font: 'var(--step--2) var(--mono)', color: 'var(--text-muted)',
          }}>
            #{tag}
          </span>
        ))}
        {record.tags.length > 4 && (
          <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-1)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)' }}>
            +{record.tags.length - 4} more
          </span>
        )}
      </div>
    </article>
  );
}

function InstitutionDetailPanel({ record, onClose }: { record: InstitutionRecord | null; onClose: () => void }) {
  if (!record) return null;
  const color = TYPE_COLORS[record.type];

  return (
    <div style={{
      position: 'fixed', top: '80px', right: '24px', bottom: '50px',
      width: '460px', maxWidth: 'calc(100vw - 48px)',
      background: 'var(--bg-elev)', border: `1px solid ${color}`,
      borderRadius: 'var(--radius-4)', boxShadow: 'var(--shadow-3)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      zIndex: 100, animation: 'slideIn 0.2s ease',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: 'var(--space-4)', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-subtle)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
            <TypeChip type={record.type} />
            <StatusChip status={record.status} />
          </div>
          <h2 style={{ margin: 0, font: '400 var(--step-2) var(--serif)', color: 'var(--text)' }}>
            {record.name}
          </h2>
          <p style={{ margin: 'var(--space-1) 0 0', font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
            {record.location}
          </p>
        </div>
        <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: '18px', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: 'var(--space-4)' }}>
        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Description</h4>
          <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', lineHeight: 1.6, color: 'var(--text)' }}>{record.description}</p>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Capacity Metrics</h4>
          {record.capacity.map(item => (
            <CapacityBar key={item.label} item={item} color={color} />
          ))}
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Governance</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
            {[
              { label: 'Model', value: record.governance.model },
              { label: 'Assembly', value: record.governance.assemblyFrequency },
              { label: 'Quorum', value: record.governance.quorum },
              { label: 'Last Assembly', value: record.governance.lastAssembly },
            ].map(item => (
              <div key={item.label} style={{ padding: 'var(--space-2)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)' }}>
                <div style={{ font: 'var(--step--1) var(--mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{item.label}</div>
                <div style={{ font: 'var(--step-0) var(--sans)', color: 'var(--text)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Commons References</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {record.commonsRefs.map(ref => (
              <span key={ref} style={{ padding: '4px 10px', background: `color-mix(in srgb, ${color} 12%, var(--bg-subtle))`, border: `1px solid ${color}`, borderRadius: 'var(--radius-1)', font: 'var(--step--1) var(--mono)', color: color }}>
                {ref}
              </span>
            ))}
          </div>
        </section>

        <section style={{ marginBottom: 'var(--space-5)' }}>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Contact</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', font: 'var(--step-0) var(--sans)' }}>
            {record.contact.email && <a href={`mailto:${record.contact.email}`} style={{ color: 'var(--water)', textDecoration: 'none' }}>📧 {record.contact.email}</a>}
            {record.contact.matrix && <a href={`https://matrix.to/#/${record.contact.matrix}`} target="_blank" rel="noopener" style={{ color: 'var(--water)', textDecoration: 'none' }}>💬 {record.contact.matrix}</a>}
            {record.contact.signal && <span style={{ color: 'var(--text-muted)' }}>🔐 {record.contact.signal}</span>}
            {record.contact.website && <a href={record.contact.website} target="_blank" rel="noopener" style={{ color: 'var(--water)', textDecoration: 'none' }}>🌐 {record.contact.website}</a>}
          </div>
        </section>

        <section>
          <h4 style={{ margin: '0 0 var(--space-2)', font: '500 var(--step-0) var(--sans)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Timeline</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', font: 'var(--step--1) var(--mono)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Founded</span>
              <span>{new Date(record.founded).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Coordinates</span>
              <span>{record.coordinates[0].toFixed(4)}, {record.coordinates[1].toFixed(4)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tags</span>
              <span>{record.tags.join(', ')}</span>
            </div>
          </div>
        </section>
      </div>

      <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--border)', background: 'var(--bg-subtle)', display: 'flex', gap: 'var(--space-2)' }}>
        <button style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', background: color, color: 'var(--bg)', border: 'none', borderRadius: 'var(--radius-2)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>Open in Network</button>
        <button style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>View People</button>
        <button style={{ flex: 1, padding: 'var(--space-2) var(--space-3)', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>View Roll</button>
      </div>
    </div>
  );
}

function StatsHeader({ records, filteredCount }: { records: InstitutionRecord[]; filteredCount: number }) {
  const activeCount = records.filter(r => r.status === 'active').length;
  const formingCount = records.filter(r => r.status === 'forming').length;
  const totalMembers = records.reduce((s, r) => s + r.members, 0);
  const totalCrews = records.reduce((s, r) => s + r.crews, 0);
  const totalAssets = records.reduce((s, r) => s + r.assets, 0);
  const totalEvidence = records.reduce((s, r) => s + r.evidenceCount, 0);

  return (
    <div style={{ position: 'fixed', top: '80px', left: '24px', right: '24px', maxWidth: '1440px', margin: '0 auto', zIndex: 50, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
      {[
        { label: 'INSTITUTIONS', value: filteredCount, total: records.length, color: 'var(--text)' },
        { label: 'ACTIVE', value: activeCount, color: 'var(--state-canon)' },
        { label: 'FORMING', value: formingCount, color: 'var(--state-proposed)' },
        { label: 'MEMBERS', value: totalMembers, color: 'var(--state-proposed)' },
        { label: 'CREWS', value: totalCrews, color: 'var(--state-caution)' },
        { label: 'ASSETS', value: totalAssets, color: 'var(--state-canon)' },
        { label: 'EVIDENCE', value: totalEvidence, color: 'var(--water)' },
      ].map((stat, i) => (
        <div key={i} style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)' }}>
          <div style={{ font: '500 var(--step--1) var(--mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
          <div style={{ font: '700 var(--step-2) var(--mono)', color: stat.color }}>{stat.value.toLocaleString()}</div>
          {stat.total !== undefined && <div style={{ font: 'var(--step--2) var(--mono)', color: 'var(--text-faint)' }}>/{stat.total}</div>}
        </div>
      ))}
    </div>
  );
}

function FilterBar({ filter, setFilter, filterType, setFilterType, filterStatus, setFilterStatus, types }: {
  filter: string; setFilter: (v: string) => void;
  filterType: string; setFilterType: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  types: InstitutionType[];
}) {
  return (
    <div style={{ position: 'fixed', top: '160px', left: '24px', right: '24px', maxWidth: '1440px', margin: '0 auto', zIndex: 50, display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
      <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
        <input type="text" placeholder="Filter institutions…" value={filter} onChange={(e: Event) => setFilter((e.target as HTMLInputElement).value)} style={{ width: '100%', padding: 'var(--space-2) var(--space-3) var(--space-2) 40px', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }} />
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: '16px' }}>🔍</span>
      </div>
      <select value={filterType} onChange={(e: Event) => setFilterType((e.target as HTMLSelectElement).value)} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }}>
        <option value="all">All Types</option>
        {types.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
      </select>
      <select value={filterStatus} onChange={(e: Event) => setFilterStatus((e.target as HTMLSelectElement).value)} style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', background: 'var(--bg-elev)', color: 'var(--text)', font: 'var(--step-0) var(--sans)', outline: 'none' }}>
        <option value="all">All Status</option>
        {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
    </div>
  );
}

export function Institutions() {
  useClock();
  const [filter, setFilter] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState<InstitutionRecord | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRecords = useMemo(() => {
    let result = MOCK_INSTITUTIONS;
    if (filter) {
      const f = filter.toLowerCase();
      result = result.filter(r => r.name.toLowerCase().includes(f) || r.description.toLowerCase().includes(f) || r.location.toLowerCase().includes(f) || r.tags.some(t => t.toLowerCase().includes(f)));
    }
    if (filterType !== 'all') result = result.filter(r => r.type === filterType);
    if (filterStatus !== 'all') result = result.filter(r => r.status === filterStatus);
    return result;
  }, [filter, filterType, filterStatus]);

  const types = useMemo(() => Array.from(new Set(MOCK_INSTITUTIONS.map(r => r.type))) as InstitutionType[], []);

  const metrics: PageHeadMetric[] = [
    { label: 'Total', value: MOCK_INSTITUTIONS.length, state: 'canon' },
    { label: 'Active', value: MOCK_INSTITUTIONS.filter(r => r.status === 'active').length, state: 'canon' },
    { label: 'Members', value: MOCK_INSTITUTIONS.reduce((s, r) => s + r.members, 0), state: 'proposed' },
    { label: 'Evidence', value: MOCK_INSTITUTIONS.reduce((s, r) => s + r.evidenceCount, 0), state: 'caution' },
  ];

  useEffect(() => { window.addEventListener('keydown', e => { if (e.key === 'Escape') setSelected(null); }); return () => window.removeEventListener('keydown', e => { if (e.key === 'Escape') setSelected(null); }); }, []);

  return (
    <WorkspaceLayout currentContext="institutions">
      <div className="institutions-page" style={{ position: 'relative', minHeight: '100vh' }}>
        <PageHead
          eyebrow="APT-LABS / INSTITUTIONS"
          title="Institution Registry"
          subtitle="Atlas of purposeful backing — cooperatives, collectives, trusts, and labs. Filter by type, status, or search."
          metrics={metrics}
          quietActions={[
            { label: 'Export atlas', onClick: () => {} },
            { label: 'New institution entry', onClick: () => {} },
          ]}
        />

        <StatsHeader records={MOCK_INSTITUTIONS} filteredCount={filteredRecords.length} />
        <FilterBar filter={filter} setFilter={setFilter} filterType={filterType} setFilterType={setFilterType} filterStatus={filterStatus} setFilterStatus={setFilterStatus} types={types} />

        <div style={{ marginTop: '230px', padding: '0 var(--space-4) var(--space-6)', maxWidth: '1440px', margin: '230px auto var(--space-6)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <p style={{ margin: 0, font: 'var(--step-0) var(--sans)', color: 'var(--text-muted)' }}>
              {filteredRecords.length} of {MOCK_INSTITUTIONS.length} institutions
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'is-active' : ''} style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', background: viewMode === 'grid' ? 'var(--state-canon-wash)' : 'var(--bg-elev)', color: viewMode === 'grid' ? 'var(--state-canon)' : 'var(--text)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>Grid</button>
              <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'is-active' : ''} style={{ padding: 'var(--space-1) var(--space-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius-2)', background: viewMode === 'list' ? 'var(--state-canon-wash)' : 'var(--bg-elev)', color: viewMode === 'list' ? 'var(--state-canon)' : 'var(--text)', font: '500 var(--step--1) var(--sans)', cursor: 'pointer' }}>List</button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 'var(--space-4)' }}>
              {filteredRecords.map(record => <InstitutionCard key={record.id} record={record} onSelect={() => setSelected(record)} selected={selected?.id === record.id} />)}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {filteredRecords.map(record => <InstitutionCard key={record.id} record={record} onSelect={() => setSelected(record)} selected={selected?.id === record.id} />)}
            </div>
          )}

          {filteredRecords.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
              <p style={{ font: 'var(--step-1) var(--serif)', margin: '0 0 var(--space-2)' }}>No institutions match your filters</p>
              <p style={{ font: 'var(--step-0) var(--sans)', margin: 0 }}>Adjust your search or filters to find what you need.</p>
            </div>
          )}
        </div>

        <InstitutionDetailPanel record={selected} onClose={() => setSelected(null)} />

        <div style={{ position: 'fixed', bottom: '16px', right: '24px', zIndex: 50, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 'var(--radius-3)', padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--step--2)', fontFamily: 'var(--mono)', color: 'var(--text-faint)', textAlign: 'right' }}>
          <div>ESC — Clear selection</div>
          <div>CLICK — Open detail</div>
          <div style={{ marginTop: '4px', color: 'var(--state-canon)', fontWeight: 500 }}>
            {MOCK_INSTITUTIONS.filter(r => r.status === 'active').length} active · {MOCK_INSTITUTIONS.filter(r => r.status === 'forming').length} forming · {MOCK_INSTITUTIONS.reduce((s, r) => s + r.members, 0).toLocaleString()} members
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
