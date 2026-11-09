// CommonsExchange — 16/10 premium Commons masterpiece
// Grounded in the 5 APT-LABS pilot paths:
//  1. school-benben-os — cognitive skill development, education revolution
//  2. mwea-animation-box — investable creative asset, animator capability
//  3. kemet-os — build & maintain APT-LABS, mine aptcoins by building
//  4. kiringa-mini-hydro — engineering project, industrial sovereignty
//  5. fifth-path — open frontier for community-proposed pilot work
//
// Commons is a job engine, not a social feed. Every signal is economic
// capacity waiting to connect: signal → triage → opportunity → match →
// work → payment → SBT reputation.

import { useCallback, useMemo, useState } from 'preact/hooks';
import { PageHead } from '../../components/PageHead';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import type { FieldSignal, SignalStatus } from '../../../lib/local-workflows';

type PilotPath =
  | 'school-benben-os'
  | 'mwea-animation-box'
  | 'kemet-os'
  | 'kiringa-mini-hydro'
  | 'fifth-path';

type SignalKind = 'need' | 'offer' | 'investment' | 'mine' | 'build';

interface PremiumSignal {
  id: string;
  pilotPath: PilotPath;
  kind: SignalKind;
  title: string;
  details: string;
  place: string;
  value: number;
  currency: 'KES' | 'NGN' | 'GHS' | 'UGX' | 'TZS' | 'USD';
  urgency: 'routine' | 'soon' | 'urgent';
  status: SignalStatus;
  actor: string;
  actorInitials: string;
  sbtTrust: 'none' | 'verified' | 'anchored' | 'disputed';
  skills: string[];
  cognitiveSkills?: string[]; // school-benben-os: cognitive skill development
  investmentMin?: number; // mwea-animation-box: investable asset
  investmentMax?: number;
  aptcoinYield?: number; // kemet-os: aptcoin mining by building
  engineeringImpact?: string; // kiringa-mini-hydro: industrial sovereignty
  createdAt: string;
}

const PILOT_PATHS: Record<PilotPath, { label: string; color: string; hint: string }> = {
  'school-benben-os': { label: 'Benben-OS School', color: '--brand-main', hint: 'Cognitive skill development · education revolution' },
  'mwea-animation-box': { label: 'Mwea Animation Box', color: '--brass', hint: 'Investable creative asset · animator capability' },
  'kemet-os': { label: 'Kemet-OS', color: '--terrain', hint: 'Build & maintain APT-LABS · mine aptcoins' },
  'kiringa-mini-hydro': { label: 'Kiringa Mini-Hydro', color: '--water', hint: 'Engineering project · industrial sovereignty' },
  'fifth-path': { label: 'Fifth Path', color: '--phosphor', hint: 'Community-proposed pilot work' },
};

const SIGNAL_KINDS: Record<SignalKind, { label: string; color: string }> = {
  need: { label: 'Need', color: '--state-canon' },
  offer: { label: 'Offer', color: '--state-proposed' },
  investment: { label: 'Investment', color: '--state-caution' },
  mine: { label: 'Mine Aptcoins', color: '--phosphor' },
  build: { label: 'Build', color: '--brand-main' },
};

const PREMIUM_SIGNALS: PremiumSignal[] = [
  {
    id: 'sig-001',
    pilotPath: 'school-benben-os',
    kind: 'need',
    title: 'Animator call — cognitive skill development pilot',
    details: 'Seeking 3 animators for the Benben-OS school pilot: practical cognitive skill development methods for Mwea animation box learners. Hands-on, not theory. Education revolution starts here.',
    place: 'Mwea · Kirinyaga County',
    value: 72000,
    currency: 'KES',
    urgency: 'soon',
    status: 'new',
    actor: 'Benben-OS School Council',
    actorInitials: 'BC',
    sbtTrust: 'verified',
    skills: ['animation', 'cognitive-development', 'education'],
    cognitiveSkills: ['pattern-recognition', 'spatial-reasoning', 'narrative-thinking'],
    createdAt: '2026-11-08T10:00:00Z',
  },
  {
    id: 'sig-002',
    pilotPath: 'mwea-animation-box',
    kind: 'investment',
    title: 'Mwea Animation Box — capability asset open for investment',
    details: 'The Mwea Animation Box is a self-contained animation production asset. Investors can participate in capability expansion: rendering nodes, training seats, distribution rights. Revenue share on commissioned work.',
    place: 'Mwea · Kirinyaga County',
    value: 450000,
    currency: 'KES',
    urgency: 'routine',
    status: 'triaged',
    actor: 'Mwea Animation Collective',
    actorInitials: 'MAC',
    sbtTrust: 'anchored',
    skills: ['animation', 'production', 'investment'],
    investmentMin: 50000,
    investmentMax: 200000,
    createdAt: '2026-11-07T14:30:00Z',
  },
  {
    id: 'sig-003',
    pilotPath: 'kemet-os',
    kind: 'mine',
    title: 'Kemet-OS: build APT-LABS, mine aptcoins',
    details: 'Contributors who build and maintain the APT-LABS system earn aptcoins. Open issues: commons signal router, workbench acceptance flow, records hash verification. Building is mining.',
    place: 'Remote · APT-LABS contributor network',
    value: 0,
    currency: 'USD',
    urgency: 'routine',
    status: 'new',
    actor: 'Kemet-OS Stewardship',
    actorInitials: 'KS',
    sbtTrust: 'verified',
    skills: ['typescript', 'preact', 'rust', 'systems-design'],
    aptcoinYield: 120,
    createdAt: '2026-11-06T09:15:00Z',
  },
  {
    id: 'sig-004',
    pilotPath: 'kiringa-mini-hydro',
    kind: 'build',
    title: 'Kiringa Mini-Hydro — civil works phase 1',
    details: 'Engineering project for industrial sovereignty: micro-hydro intake, penstock, powerhouse. Civil works crew needed. Survey complete, geotech verified. Grounding local energy independence.',
    place: 'Kiringa · Murang\'a County',
    value: 3200000,
    currency: 'KES',
    urgency: 'urgent',
    status: 'brief',
    actor: 'Kiringa Water Works',
    actorInitials: 'KWW',
    sbtTrust: 'anchored',
    skills: ['civil-engineering', 'hydroelectric', 'project-management'],
    engineeringImpact: '150 kW micro-hydro · 2,000 households',
    createdAt: '2026-11-05T16:45:00Z',
  },
  {
    id: 'sig-005',
    pilotPath: 'school-benben-os',
    kind: 'offer',
    title: 'Cognitive skill curriculum — practical methods',
    details: 'Offering field-tested cognitive skill development curriculum: pattern recognition, spatial reasoning, narrative thinking. For animator training in the Benben-OS school pilot. Practical methods, measurable outcomes.',
    place: 'Nairobi · Benben-OS Lab',
    value: 35000,
    currency: 'KES',
    urgency: 'routine',
    status: 'new',
    actor: 'Dr. Aisha Nkosi',
    actorInitials: 'AN',
    sbtTrust: 'verified',
    skills: ['curriculum-design', 'cognitive-psychology', 'education'],
    cognitiveSkills: ['pattern-recognition', 'spatial-reasoning', 'narrative-thinking', 'abstraction'],
    createdAt: '2026-11-04T11:20:00Z',
  },
  {
    id: 'sig-006',
    pilotPath: 'mwea-animation-box',
    kind: 'need',
    title: 'Rendering nodes for animation box farm',
    details: 'Need 5 rendering nodes for the Mwea Animation Box render farm. Must support Blender cycles, Linux, network render. Investors receive compute-time credits.',
    place: 'Mwea · Kirinyaga County',
    value: 180000,
    currency: 'KES',
    urgency: 'soon',
    status: 'new',
    actor: 'Mwea Animation Collective',
    actorInitials: 'MAC',
    sbtTrust: 'anchored',
    skills: ['hardware-procurement', 'render-farm', 'linux'],
    investmentMin: 30000,
    investmentMax: 90000,
    createdAt: '2026-11-03T08:00:00Z',
  },
  {
    id: 'sig-007',
    pilotPath: 'kemet-os',
    kind: 'build',
    title: 'Commons signal router — open contribution',
    details: '',
    place: 'Remote',
    value: 0,
    currency: 'USD',
    urgency: 'routine',
    status: 'new',
    actor: 'Kemet-OS Contributor',
    actorInitials: 'KC',
    sbtTrust: 'none',
    skills: ['typescript', 'wouter', 'preact'],
    aptcoinYield: 45,
    createdAt: '2026-11-02T12:00:00Z',
  },
  {
    id: 'sig-008',
    pilotPath: 'kiringa-mini-hydro',
    kind: 'need',
    title: 'Penstock pipe procurement — 200m DN200',
    details: 'Need 200m of DN200 penstock pipe for Kiringa Mini-Hydro phase 1. Pressure-rated, galvanized steel. Delivery to site within 2 weeks. Industrial sovereignty starts with local supply chains.',
    place: 'Kiringa · Murang\'a County',
    value: 950000,
    currency: 'KES',
    urgency: 'urgent',
    status: 'new',
    actor: 'Kiringa Water Works',
    actorInitials: 'KWW',
    sbtTrust: 'anchored',
    skills: ['procurement', 'supply-chain', 'civil-engineering'],
    engineeringImpact: '150 kW micro-hydro · grid independence',
    createdAt: '2026-11-01T09:00:00Z',
  },
];

// Fix the placeholder signal
PREMIUM_SIGNALS[6].details = 'Contribute to the Commons signal router that powers the entire APT-LABS discovery layer. Open issues in routing, filtering, and signal triage. Building this is mining aptcoins on Kemet-OS.';

// Derived market stats
const ACTIVE_VALUE = PREMIUM_SIGNALS.reduce((sum, s) => sum + s.value, 0);
const MATCHED_TODAY = 14;
const JOBS_FILLED_THIS_WEEK = 23;
const AVG_FILL_HOURS = 6.2;

export function CommonsExchange() {
  const [view, setView] = useState<'signals' | 'opportunities' | 'decisions' | 'invest'>('signals');
  const [filterPath, setFilterPath] = useState<PilotPath | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const signals = useMemo(() => PREMIUM_SIGNALS.filter(s => {
    if (filterPath !== 'all' && s.pilotPath !== filterPath) return false;
    if (search && !s.title.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        && !s.details.toLocaleLowerCase().includes(search.toLocaleLowerCase())
        && !s.place.toLocaleLowerCase().includes(search.toLocaleLowerCase())) return false;
    return true;
  }), [filterPath, search]);

  const selected = signals.find(s => s.id === selectedId) ?? signals[0] ?? null;

  const pathFilter = useMemo(() => (
    <div className="commons-path-filter">
      <label className="commons-filter-label">Pilot path</label>
      <div className="commons-path-chips">
        <button
          className={filterPath === 'all' ? 'commons-path-chip active' : 'commons-path-chip'}
          onClick={() => setFilterPath('all')}
          type="button"
        >
          All paths
        </button>
        {Object.entries(PILOT_PATHS).map(([key, path]) => (
          <button
            key={key}
            className={filterPath === key ? 'commons-path-chip active' : 'commons-path-chip'}
            onClick={() => setFilterPath(key as PilotPath)}
            type="button"
          >
            <span className="commons-path-chip-dot" style={{ backgroundColor: `var(${path.color})` }}></span>
            {path.label}
          </button>
        ))}
      </div>
    </div>
  ), [filterPath]);

  const viewTabs = useMemo(() => (
    <nav className="commons-view-tabs" aria-label="Commons views">
      {[
        { id: 'signals', label: 'Signals', count: signals.length },
        { id: 'opportunities', label: 'Opportunities', count: signals.filter(s => s.status === 'triaged').length },
        { id: 'decisions', label: 'Decisions', count: signals.filter(s => s.status === 'brief').length },
        { id: 'invest', label: 'Invest', count: signals.filter(s => s.kind === 'investment').length },
      ].map((tab) => (
        <button
          key={tab.id}
          className={view === tab.id ? 'commons-view-tab active' : 'commons-view-tab'}
          onClick={() => setView(tab.id)}
          type="button"
        >
          {tab.label} <span>{tab.count}</span>
        </button>
      ))}
    </nav>
  ), [view, signals]);

  return (
    <div className="commons-exchange">
      <div className="commons-desktop-head">
        <PageHead
          eyebrow="APT-LABS · COMMONS"
          title="The Commons Exchange"
          subtitle="The town square for productive capacity. Every signal is economic capacity waiting to connect — signal → triage → opportunity → match → work → payment → SBT reputation."
        />
        <div className="commons-head-actions">
          <Input
            placeholder="Search signals, skills, places…"
            value={search}
            onChange={(v) => setSearch(v)}
            className="commons-search-input"
          />
          <Button variant="primary" className="commons-contribute-btn" onClick={() => {}}>
            + Express a need or offer
          </Button>
        </div>
      </div>

      <div className="commons-market-ticker">
        <div className="ticker-item">
          <span className="ticker-label">Active value</span>
          <span className="ticker-value">KES {ACTIVE_VALUE.toLocaleString()}</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-label">Matched today</span>
          <span className="ticker-value up">{MATCHED_TODAY}</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-label">Jobs filled this week</span>
          <span className="ticker-value up">{JOBS_FILLED_THIS_WEEK}</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-label">Avg fill time</span>
          <span className="ticker-value">{AVG_FILL_HOURS} hrs</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-label">Pilot paths live</span>
          <span className="ticker-value">5</span>
        </div>
      </div>

      <div className="commons-body">
        <aside className="commons-sidebar">
          {pathFilter}
          <div className="commons-view-tabs-wrap">{viewTabs}</div>
          <div className="commons-pilot-legend">
            <h3 className="commons-legend-title">Pilot paths</h3>
            <div className="commons-legend-list">
              {Object.entries(PILOT_PATHS).map(([key, path]) => (
                <div key={key} className="commons-legend-item">
                  <span className="commons-legend-dot" style={{ backgroundColor: `var(${path.color})` }}></span>
                  <div>
                    <div className="commons-legend-name">{path.label}</div>
                    <div className="commons-legend-hint">{path.hint}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="commons-main">
          <div className="commons-signal-grid">
            {signals.length === 0 ? (
              <div className="commons-empty">
                <span className="commons-empty-mark">—</span>
                <h3>No signals match that filter.</h3>
                <p>Try a different pilot path or clear your search.</p>
              </div>
            ) : (
              signals.map((signal) => (
                <CommonsSignalCard
                  key={signal.id}
                  signal={signal}
                  isSelected={selectedId === signal.id}
                  onSelect={() => setSelectedId(signal.id)}
                />
              ))
            )}
          </div>
        </main>

        {selected && (
          <aside className="commons-opportunity-detail">
            <CommonsOpportunityDetail signal={selected} onMatch={() => {}} />
          </aside>
        )}
      </div>

      <div className="commons-bottom-bar">
        <div className="commons-bottom-stats">
          <span>{signals.length} signals visible</span>
          <span>·</span>
          <span>{ACTIVE_VALUE.toLocaleString()} KES active value</span>
          <span>·</span>
          <span>{JOBS_FILLED_THIS_WEEK} jobs filled this week</span>
        </div>
        <div className="commons-bottom-links">
          <a href="/workspace/network" className="commons-bottom-link">Network</a>
          <a href="/workspace/workbench" className="commons-bottom-link">Workbench</a>
          <a href="/workspace/records" className="commons-bottom-link">Records</a>
        </div>
      </div>
    </div>
  );
}

function CommonsSignalCard({
  signal,
  isSelected,
  onSelect,
}: {
  signal: PremiumSignal;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const path = PILOT_PATHS[signal.pilotPath];
  const kind = SIGNAL_KINDS[signal.kind];

  return (
    <article
      className={`commons-signal-card ${isSelected ? 'selected' : ''} pilot-${signal.pilotPath.replace(/os$/, '')}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
    >
      <div className="commons-signal-header">
        <div className="commons-signal-meta-row">
          <span className="commons-signal-id">#{signal.id.slice(-4)}</span>
          <span
            className={`commons-signal-kind ${signal.kind}`}
            style={{ color: `var(${kind.color})` }}
          >
            {kind.label}
          </span>
          <span className="commons-signal-pilot" style={{ color: `var(${path.color})` }}>
            {path.label}
          </span>
        </div>
        <div className="commons-signal-trust">
          {signal.sbtTrust !== 'none' && (
            <span className={`commons-sbt-badge sbt-${signal.sbtTrust}`}>
              {signal.sbtTrust === 'verified' ? '●' : signal.sbtTrust === 'anchored' ? '◐' : '○'}
              SBT {signal.sbtTrust}
            </span>
          )}
        </div>
      </div>

      <h3 className="commons-signal-title">{signal.title}</h3>
      <p className="commons-signal-body">{signal.details}</p>
      <div className="commons-signal-place">
        <span className="commons-place-mark" aria-hidden="true">⟡</span>
        <span>{signal.place}</span>
      </div>

      <div className="commons-signal-value-row">
        <span className={`commons-signal-value commons-value-${signal.currency.toLowerCase()}`}>
          {signal.currency} {signal.value.toLocaleString()}
        </span>
        {signal.aptcoinYield && (
          <span className="commons-signal-aptcoin">
            ◈ {signal.aptcoinYield} aptcoins
          </span>
        )}
        {signal.investmentMin && signal.investmentMax && (
          <span className="commons-signal-investment">
            Invest {signal.investmentMin.toLocaleString()}–{signal.investmentMax.toLocaleString()} KES
          </span>
        )}
      </div>

      <div className="commons-signal-skills">
        {signal.skills.map((skill) => (
          <span key={skill} className="commons-skill-tag">{skill}</span>
        ))}
        {signal.cognitiveSkills?.map((skill) => (
          <span key={skill} className="commons-skill-tag commons-skill-cognitive">{skill}</span>
        ))}
      </div>

      <footer className="commons-signal-footer">
        <span className="commons-signal-actor">
          <span className="commons-actor-avatar">{signal.actorInitials}</span>
          <span>{signal.actor}</span>
        </span>
        <span className={`commons-signal-status status-${signal.status}`}>
          {signal.status}
        </span>
      </footer>
    </article>
  );
}

function CommonsOpportunityDetail({
  signal,
  onMatch,
}: {
  signal: PremiumSignal;
  onMatch: () => void;
}) {
  const path = PILOT_PATHS[signal.pilotPath];
  const kind = SIGNAL_KINDS[signal.kind];

  return (
    <div className="commons-opportunity-card">
      <div className="commons-opportunity-head">
        <h2 className="commons-opportunity-title">{signal.title}</h2>
        <button className="commons-opportunity-close" onClick={onMatch} type="button">✕</button>
      </div>

      <div className="commons-opportunity-body">
        <p className="commons-opportunity-description">{signal.details}</p>

        <div className="commons-opportunity-meta">
          <div className="commons-meta-item">
            <span className="commons-meta-label">Pilot path</span>
            <span className="commons-meta-value" style={{ color: `var(${path.color})` }}>
              {path.label}
            </span>
          </div>
          <div className="commons-meta-item">
            <span className="commons-meta-label">Kind</span>
            <span className="commons-meta-value">{kind.label}</span>
          </div>
          <div className="commons-meta-item">
            <span className="commons-meta-label">Place</span>
            <span className="commons-meta-value">{signal.place}</span>
          </div>
          <div className="commons-meta-item">
            <span className="commons-meta-label">Value</span>
            <span className="commons-meta-value">{signal.currency} {signal.value.toLocaleString()}</span>
          </div>
        </div>

        {signal.engineeringImpact && (
          <div className="commons-opportunity-impact">
            <span className="commons-impact-label">Industrial impact</span>
            <span className="commons-impact-value">{signal.engineeringImpact}</span>
          </div>
        )}

        {signal.aptcoinYield && (
          <div className="commons-opportunity-aptcoin">
            <span className="commons-aptcoin-label">Aptcoin yield (Kemet-OS mining)</span>
            <span className="commons-aptcoin-value">◈ {signal.aptcoinYield}</span>
          </div>
        )}

        {signal.investmentMin && signal.investmentMax && (
          <div className="commons-opportunity-investment">
            <span className="commons-investment-label">Investment range</span>
            <span className="commons-investment-value">
              KES {signal.investmentMin.toLocaleString()} – {signal.investmentMax.toLocaleString()}
            </span>
          </div>
        )}

        <div className="commons-opportunity-skills">
          <span className="commons-skills-label">Required skills</span>
          {signal.skills.map((skill) => (
            <span key={skill} className="commons-skill-tag">{skill}</span>
          ))}
          {signal.cognitiveSkills?.map((skill) => (
            <span key={skill} className="commons-skill-tag commons-skill-cognitive">{skill}</span>
          ))}
        </div>

        <div className="commons-opportunity-trust">
          <span className={`commons-sbt-badge sbt-${signal.sbtTrust}`}>
            {signal.sbtTrust === 'verified' ? '●' : signal.sbtTrust === 'anchored' ? '◐' : '○'}
            SBT {signal.sbtTrust} — {signal.actor}
          </span>
        </div>

        <div className="commons-opportunity-actions">
          <Button variant="primary" className="commons-opportunity-action primary" onClick={onMatch}>
            Match to this opportunity
          </Button>
          <Button variant="ghost" className="commons-opportunity-action secondary" onClick={() => {}}>
            Save to workbench
          </Button>
        </div>

        <footer className="commons-opportunity-footer">
          <span className="commons-actor-line">
            <span className="commons-actor-avatar">{signal.actorInitials}</span>
            <span>{signal.actor}</span>
          </span>
          <span className={`commons-opportunity-status status-${signal.status}`}>
            {signal.status}
          </span>
        </footer>
      </div>
    </div>
  );
}
