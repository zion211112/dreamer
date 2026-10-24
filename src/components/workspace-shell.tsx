'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';

import {
  ArrowDownToLine,
  Minimize2,
  ArrowRight,
  ArrowUpRight,
  ArrowUp,
  Boxes,
  ChevronRight,
  Building2,
  Bot,
  Focus,
  ListChecks,
  MessageCircle,
  Network,
  Plus,
  Radio,
  ScrollText,
  UsersRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Tender } from '@/lib/tender';
import { UserProfileMenu, type ProfileSection } from '@/components/user-profile-menu';
import type { UserProfileData } from '@/lib/user-profile';
import { SchoolConsole } from '@/components/school-console';
import { WorkspaceFloorSwitcher, type WorkspaceFloor } from '@/components/workspace-floor-switcher';

interface WorkspaceShellProps {
  initialTenders?: Tender[];
  initialBriefs?: unknown[];
  userEmail: string;
  profileData?: UserProfileData | null;
  localMode?: boolean;
}

type Mode = 'field' | 'proof' | 'local';

type StudioView = 'local' | 'shared';

type WorkspaceView = 'field' | 'proof' | 'local';

interface ProblemDraft {
  id: string;
  title: string;
  place: string;
  detail: string;
  measure: string;
  isFriction?: boolean;
  parentTitle?: string;
}

interface FrictionPoint {
  id: string;
  room: Exclude<RadarRoom, 'all'>;
  title: string;
  signal: string;
  detail: string;
  collectiveResponse: string[];
  firstQuestion: string;
  origin: string;
}

interface TopologyRecord {
  icon: string;
  title: string;
  short: string;
  type: string;
  state: string;
  meta: string;
  source: string;
  description: string;
  evidence: string[];
  hint: string;
  relations: string[];
  actions: [string, string][];
}

const GROUND_MODULES: { key: 'topology' | 'engines'; label: string; icon: typeof Network }[] = [
  { key: 'topology', label: 'Asset Topology', icon: Network },
  { key: 'engines', label: 'Work Engines', icon: Boxes },
];

const VIEW_COPY: Record<WorkspaceView, { kicker: string; title: string; subtitle: string }> = {
  field: {
    kicker: '01 / ASSET FIELD',
    title: 'Asset Field',
    subtitle: 'Hosts · assets · work · evidence',
  },
  proof: {
    kicker: '02 / PROOF & DELIVERY',
    title: 'Delivery & proof',
    subtitle: 'Work sequence · capability evidence · provenance',
  },
  local: {
    kicker: 'WORK ENGINES / INTAKE',
    title: 'Local briefs',
    subtitle: 'Observed friction, before prescribed solutions.',
  },
};
    subtitle: 'Published Tender records and illustrative scenarios, clearly distinguished.',
  },
};

};

const FRICTION_POINTS: FrictionPoint[] = [
  {
    id: 'mwea-story-worlds',
    room: 'culture',
    title: 'Which stories get to become infrastructure?',
    signal: 'Who can author, own, distribute, and earn from stories rooted in local life?',
    detail: 'The concern is larger than representation in any one film or platform. It may involve who gets to shape cultural memory, who controls rights and distribution, and whether local creators can sustain the work. The Mwea context and the people most affected need to define the signal; an animation initiative is one possible response, not an established solution.',
    collectiveResponse: [
      'Invite creators, elders, educators and audiences to describe what is missing—and where they disagree.',
      'Map authorship, language, rights, distribution and livelihood constraints before choosing a medium.',
      'Treat any Mwea Animation Box as a proposed asset until its stewards, scope and community relationships are established.',
    ],
    firstQuestion: 'Whose account is missing, and who should hold authorship and rights if new story work is created?',
    origin: 'Mwea · context to establish with participants',
  },
  {
    id: 'learning-infrastructure',
    room: 'education',
    title: 'What is blocking learning—and where does infrastructure fit?',
    signal: 'Education friction can be systemic; a project idea is not yet evidence of the cause.',
    detail: 'A learning challenge may involve access, teaching conditions, energy, materials, language, or institutional constraints. A proposed response such as Nyamindi Hydro must remain distinct from the friction until affected learners and educators establish a credible connection.',
    collectiveResponse: [
      'Listen to learners, teachers, families and local education stewards separately.',
      'Record the barriers, existing responses and evidence gaps without assuming a technology fix.',
      'Test any infrastructure link against educational outcomes, ownership, maintenance and alternatives.',
    ],
    firstQuestion: 'Which learning outcome is constrained, for whom, and what evidence links that constraint to infrastructure?',
    origin: 'Nyamindi · proposed connection, not verified',
  },
  {
    id: 'capability-to-work',
    room: 'work',
    title: 'Why does useful capability fail to become trusted work?',
    signal: 'People may have practical ability without a fair path to demonstrate it.',
    detail: 'A skill-to-work gap can reflect who controls access to tools, contracts, references, proof and payment—not just a missing certificate. A local work engine could connect people to real tasks, but only with clear acceptance, attribution, safety and fair reward.',
    collectiveResponse: [
      'Ask workers and prospective clients which evidence is trusted and whose standards dominate.',
      'Scope a small real task with transparent criteria, review, attribution and payment terms.',
      'Record verified outcomes through the appropriate work engine and existing Roll path where applicable.',
    ],
    firstQuestion: 'Who decides whether work counts as proof, and what prevents a fair first opportunity?',
    origin: 'Local evidence needed',
  },
];

const RECORDS: Record<string, TopologyRecord> = {
  'school-console': {
    icon: '▤',
    title: 'School Console',
    short: 'Education tool',
    type: 'Local-first school utility',
    state: 'Device-local',
    meta: 'LOCAL / DEVICE',
    source: 'APT-LABS product',
    description: 'A school utility whose student and lesson records stay on the device.',
    evidence: ['Student and lesson records are not represented in this graph.'],
    hint: 'This node describes the product only; school records remain local to the device.',
    relations: ['Possible creative supply relationship · not established.'],
    actions: [['Open work sequence', 'sequence']],
  },
  'mwea-animation': {
    icon: '✳',
    title: 'Mwea Animation',
    short: 'Proposed creative asset',
    type: 'Illustrative asset hypothesis',
    state: 'Proposed',
    meta: 'PROPOSED / UNVERIFIED',
    source: 'Illustrative concept',
    description: 'A possible creative work engine arising from local cultural storytelling needs.',
    evidence: ['Ownership, contributors, scope and community mandate are unconfirmed.'],
    hint: 'Treat this as a proposal, not an operating studio or verified community asset.',
    relations: ['Possible school content relationship · needs consent and agreement.'],
    actions: [['Draft a problem brief', 'draft']],
  },
  'tender-system': {
    icon: '⌘',
    title: 'Tender System',
    short: 'APT-LABS platform',
    type: 'Execution system',
    state: 'Operational product',
    meta: 'APT-LABS / SYSTEM',
    source: 'APT-LABS product',
    description: 'The Tender, Assembly and Roll workflow for scoped, accountable builds.',
    evidence: ['Tender state and execution follow the existing application and database lifecycle.'],
    hint: 'Tender records remain governed by the existing Tender and Assembly workflow.',
    relations: ['Workflow links are not inferred in this topology view.'],
    actions: [['Open work sequence', 'sequence']],
  },
};

const RECRUITING_ASSET_IDS = ['school-console', 'mwea-animation', 'tender-system'] as const;
type RecruitingAssetId = (typeof RECRUITING_ASSET_IDS)[number];

const RECRUITING_COPY: Record<RecruitingAssetId, { discipline: string; focus: string; invitation: string }> = {
  'school-console': {
    discipline: 'EDUCATION / LOCAL-FIRST SOFTWARE',
    focus: 'School operations, teacher workflows, accessible interfaces',
    invitation: 'Help improve a school tool while keeping student and lesson records on the device.',
  },
  'mwea-animation': {
    discipline: 'CULTURE / CREATIVE PRODUCTION',
    focus: 'Story, illustration, animation, sound, production',
    invitation: 'Offer creative capability for locally rooted stories. Asset scope and community mandate remain to be established.',
  },
  'tender-system': {
    discipline: 'APT-LABS / BUILD EXECUTION',
    focus: 'Tender operations, field delivery, verification, documentation',
    invitation: 'Contribute to the accountable build workflow from scoped Tender through Assembly and Roll.',
  },
};

const SEQUENCE = [
  { number: '01', title: 'Discover', description: 'Observe the work with the people affected.', state: 'Open', first: true },
  { number: '02', title: 'Diagnose', description: 'Separate symptoms, causes and assumptions.', state: 'Waiting' },
  { number: '03', title: 'Scope', description: 'Requirements · alternatives · cost · acceptance.', state: 'Waiting' },
  { number: '04', title: 'Build', description: 'Inputs, responsibilities, safety and revisions.', state: 'Waiting' },
  { number: '05', title: 'Test & accept', description: 'Compare results with the agreed criteria.', state: 'Waiting' },
  { number: '06', title: 'Maintain & learn', description: 'Repairs, failures and repeatable lessons.', state: 'Waiting' },
];

const CAPABILITY_FIELDS = [
  ['Claim', 'The work a person says they can do.'],
  ['Work sample', 'Artifact, task or demonstration.'],
  ['Verifier', 'Who checked it, and how.'],
  ['Scope', 'What the evidence does—and does not—establish.'],
  ['Recency', 'Only where freshness matters to the work.'],
];

const ROLL_FIELDS = [
  ['Contribution', 'Who did what.'],
  ['Artifact', 'What was produced, with a source and version.'],
  ['Test', 'Method, conditions, result and limitations.'],
  ['Acceptance', 'Who accepted, rejected or deferred—and why.'],
  ['Maintenance', 'Failure, repair, operating state and next review.'],
  ['Integrity', 'Submitted evidence remains distinct from reviewed evidence.'],
];

export function WorkspaceShell({
  initialTenders = [],
  userEmail,
  profileData = null,
  localMode = false,
}: WorkspaceShellProps) {
  const [view, setView] = useState<WorkspaceView>('field');
  const [mode, setMode] = useState<Mode>('field');
  const [studioView, setStudioView] = useState<StudioView>('local');
  const [ledgerSection, setLedgerSection] = useState<StudioView>('local');
  const [selectedFrictionId, setSelectedFrictionId] = useState(FRICTION_POINTS[0].id);
  const [selectedRecruitingAssetId, setSelectedRecruitingAssetId] = useState<RecruitingAssetId>(RECRUITING_ASSET_IDS[0]);
  const [selectedRecordId, setSelectedRecordId] = useState('school-console');
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<ProblemDraft[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSection, setProfileSection] = useState<ProfileSection>('overview');
  const [profileAssetContext, setProfileAssetContext] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [minimal, setMinimal] = useState(false);
  const [composerMode, setComposerMode] = useState<'problem' | 'friction'>('problem');
  const [form, setForm] = useState({ title: '', place: '', detail: '', measure: '' });
  const titleInput = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const currentCopy = VIEW_COPY[view];
  const selectedRecruitingAsset = RECORDS[selectedRecruitingAssetId];
  const selectedRecruitingCopy = RECRUITING_COPY[selectedRecruitingAssetId];
  const selectedRecord = RECORDS[selectedRecordId] ?? RECORDS.site;
  const selectedDraft = selectedDraftId
    ? drafts.find(draft => draft.id === selectedDraftId)
    : undefined;
  const notify = useCallback((message: string) => toast(message), []);
  useEffect(() => {

  function changeFloor(nextFloor: WorkspaceFloor) {
    if (nextFloor === floor) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setFloor(nextFloor);
      setLiftTrip(null);
      return;
    }
    const direction = FLOOR_ORDER.indexOf(nextFloor) > FLOOR_ORDER.indexOf(floor)
      ? 'up'
      : 'down';
    setFloor(nextFloor);
    setLiftTrip({ floor: nextFloor, direction });
  }

  const openModal = useCallback(() => {
    setComposerMode('problem');
    setModalOpen(true);
  }, []);
  const closeModal = useCallback(() => setModalOpen(false), []);
  function openFrictionComposer(point?: FrictionPoint) {
    setSelectedFrictionId(point?.id ?? '');
    setComposerMode('friction');
    setForm({
      title: point ? `Local adaptation: ${point.title}` : '',
      place: '',
      detail: point ? `${point.signal}

What is different in your place?` : '',
      measure: '',
    });
    setModalOpen(true);
  }

  useEffect(() => {
    if (modalOpen) titleInput.current?.focus();
  }, [modalOpen]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape' && modalOpen) {
        closeModal();
        return;
      }
      const target = event.target;
      const isEditing = target instanceof HTMLElement
        && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !isEditing) {
        event.preventDefault();
        openModal();
      }
    }

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [closeModal, modalOpen, openModal]);

  function selectRecord(id: string) {
    setSelectedRecordId(id);
    setSelectedDraftId(null);
  }

  function toggleLocalVote(id: string) {
    setLocalVotes(current => current.includes(id)
      ? current.filter(voteId => voteId !== id)
      : [...current, id]);
  }

  function selectRadarRoom(room: RadarRoom) {
    setRadarRoom(room);
    const firstInRoom = room === 'all'
      ? FRICTION_POINTS[0]
      : FRICTION_POINTS.find(point => point.room === room);
    if (firstInRoom) setSelectedFrictionId(firstInRoom.id);
  }

  function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const draft: ProblemDraft = {
      id: `draft-${Date.now()}-${drafts.length}`,
      title: form.title.trim(),
      place: form.place.trim(),
      detail: form.detail.trim(),
      measure: form.measure.trim(),
    };
    if (composerMode === 'friction') {
      const parentFriction = FRICTION_POINTS.find(point => point.id === selectedFrictionId);
      const frictionDraft = {
        ...draft,
        isFriction: true,
        ...(parentFriction
          ? { parentTitle: parentFriction.title }
          : {}),
      };
      setDrafts(current => [frictionDraft, ...current]);
      setSelectedFrictionId(frictionDraft.id);
      closeModal();
      notify('Saved locally. Commons submission is not connected.');
      return;
    }
    setDrafts(current => [draft, ...current]);
    setForm({ title: '', place: '', detail: '', measure: '' });
    setSelectedDraftId(null);
    setView('problems');
    closeModal();
    notify('Saved to this session.');
  }

  function exportDraft(draft: ProblemDraft) {
    const url = URL.createObjectURL(new Blob([JSON.stringify(draft, null, 2)], {
      type: 'application/json',
    }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'apt-labs-problem-draft.json';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Draft exported.');
  }

  function handleInspectorAction(action: string) {
    if (action === 'draft') {
      openModal();
    } else if (action === 'export' && selectedDraft) {
      exportDraft(selectedDraft);
    } else if (action === 'sequence' || action === 'capability' || action === 'roll') {
      setView('ledger');
      setLedgerSection(action);
    }
  }

  const inspectorTitle = selectedDraft?.title ?? selectedRecord.title;
  const inspectorDescription = selectedDraft?.detail ?? selectedRecord.description;
  const evidence = selectedDraft
    ? ['Entered locally; not independently verified.', 'Baseline and acceptance method remain open.']
    : selectedRecord.evidence;
  const relations = selectedDraft
    ? [
      `Site · ${selectedDraft.place || 'Not specified'}`,
      `Measure · ${selectedDraft.measure || 'Not defined'}`,
    ]
    : selectedRecord.relations;
  const inspectorActions: [string, string][] = selectedDraft
    ? [['Open work sequence', 'sequence'], ['Export JSON', 'export']]
    : selectedRecord.actions;
  const visibleFriction = radarRoom === 'all'
    ? FRICTION_POINTS
    : FRICTION_POINTS.filter(point => point.room === radarRoom);
  const selectedFriction = visibleFriction.find(point => point.id === selectedFrictionId) ?? visibleFriction[0];
  const radarRoomTitle: Record<RadarRoom, string> = {
    all: 'Signals from the field',
    culture: 'Stories, authorship & belonging',
    education: 'Learning & infrastructure',
    work: 'Capability & trusted work',
  };

  return (
    <div className="workspace-atlas" data-minimal={minimal} data-floor={floor}>
      <header className="atlas-header">
        <div className="atlas-header-left">
          <a className="atlas-brand" href="/workspace" aria-label="APT-LABS workspace">
            <span className="atlas-brand-mark"><Boxes aria-hidden="true" size={17} strokeWidth={1.5} /></span>
            <span>APT<span>—</span>LABS</span>
          </a>
          <WorkspaceFloorSwitcher currentFloor={floor} onSelect={changeFloor} />
        </div>
        <div className="atlas-header-actions">
          <UserProfileMenu
            userEmail={userEmail}
            localMode={localMode}
            profileData={profileData}
            open={profileOpen}
            onOpenChange={nextOpen => {
              setProfileOpen(nextOpen);
              if (!nextOpen) {
                setProfileSection('overview');
                setProfileAssetContext(null);
              }
            }}
            initialSection={profileSection}
            assetContext={profileAssetContext}
          />
          <button
            className="atlas-icon-button"
            type="button"
            aria-label={minimal ? 'Exit focus mode' : 'Focus workspace'}
            aria-pressed={minimal}
            title={minimal ? 'Restore workspace panels' : 'Focus on the current floor'}
            onClick={() => setMinimal(value => !value)}
          >
            <Minimize2 aria-hidden="true" size={16} />
          </button>
        </div>
      </header>

      <div className={`atlas-layout${floor === 'first' ? ' atlas-layout-unconfigured atlas-layout-first' : ''}${floor === 'second' ? ' atlas-layout-school' : ''}${floor === 'basement' ? ' atlas-layout-basement atlas-layout-radar' : ''}${view === 'commons' ? ' atlas-layout-wide' : ''}${floor === 'ground' && view === 'engines' ? ' atlas-layout-engines' : ''}`}>
        {floor === 'basement' && (
          <aside className="atlas-radar-nav">
            <div className="atlas-radar-module">
              <span className="atlas-radar-live-mark"><Radio aria-hidden="true" size={14} /></span>
              <div><span className="atlas-radar-overline">ACTIVE MODULE</span><strong>Radar</strong></div>
            </div>
            <nav className="atlas-radar-rooms" aria-label="Basement modules">
            <button
              className={`atlas-radar-room${radarRoom === 'all' ? ' is-active' : ''}`}
              type="button"
              aria-pressed={radarRoom === 'all'}
              onClick={() => selectRadarRoom('all')}
            >
              <span>All signals</span><small>Overview</small>
            </button>
            <span className="atlas-radar-room-label">Community rooms</span>
            <button
              className={`atlas-radar-room${radarRoom === 'culture' ? ' is-active' : ''}`}
              type="button"
              aria-pressed={radarRoom === 'culture'}
              onClick={() => selectRadarRoom('culture')}
            >
              <span>Culture & stories</span><ChevronRight aria-hidden="true" size={13} />
            </button>
            <div className="atlas-radar-room-nested">
              <button
                className={`atlas-radar-room atlas-radar-room-child${radarRoom === 'culture' ? ' is-active' : ''}`}
                type="button"
                aria-pressed={radarRoom === 'culture'}
                onClick={() => selectRadarRoom('culture')}
              >
                <span>Mwea story worlds</span>
              </button>
              <span className="atlas-radar-room-note">Discussion room · not an asset listing</span>
            </div>
            <button
              className={`atlas-radar-room${radarRoom === 'education' ? ' is-active' : ''}`}
              type="button"
              aria-pressed={radarRoom === 'education'}
              onClick={() => selectRadarRoom('education')}
            >
              <span>Education & systems</span><ChevronRight aria-hidden="true" size={13} />
            </button>
            <button
              className={`atlas-radar-room${radarRoom === 'work' ? ' is-active' : ''}`}
              type="button"
              aria-pressed={radarRoom === 'work'}
              onClick={() => selectRadarRoom('work')}
            >
              <span>Work & capability</span><ChevronRight aria-hidden="true" size={13} />
            </button>
            </nav>
            <div className="atlas-radar-nav-foot">
              Illustrative signals · verify before acting.
            </div>
          </aside>
        )}
        {floor === 'ground' && <aside className="atlas-rail">
          <div className="atlas-rail-label">Ground floor</div>
          <nav className="atlas-nav" aria-label="Ground floor modules">
            {GROUND_MODULES.map((item, index) => {
              const Icon = item.icon;
              const active = item.key === 'topology' ? view === 'topology' : view !== 'topology';
              return (
                <button
                  key={item.key}
                  className={`atlas-nav-item${active ? ' is-active' : ''}`}
                  type="button"
                  aria-current={active ? 'page' : undefined}
                  onClick={() => setView(item.key === 'topology' ? 'topology' : 'engines')}
                >
                  <Icon aria-hidden="true" size={16} strokeWidth={1.6} />
                  <span>{item.label}</span>
                  <span className="atlas-nav-index">{String(index + 1).padStart(2, '0')}</span>
                </button>
              );
            })}
          </nav>
          <div className="atlas-field-note">
            <div className="atlas-orbit" aria-hidden="true"><i /></div>
            <span className="atlas-rail-label">Field note / 01</span>
            <p>Observe before designing.</p>
          </div>
        </aside>}
        {(floor === 'first' || floor === 'second') && (
          <aside aria-label={`${floor === 'first' ? 'Governance' : 'School'} floor information`} className="atlas-rail atlas-floor-rail">
            <span className="atlas-rail-label">{floor === 'first' ? 'First · Governance' : 'Second · School'}</span>
            <div className="atlas-floor-rail-card">
              <span className="atlas-floor-rail-icon"><Building2 aria-hidden="true" size={16} /></span>
              <strong>{floor === 'first' ? 'Decision rights' : 'School Console'}</strong>
              <span>{floor === 'first' ? 'Governance and decision rights' : 'Device-local school tools'}</span>
            </div>
            {floor === 'second' && (
              <p className="atlas-floor-rail-note">Student and lesson records stay on this device.</p>
            )}
          </aside>
        )}

        <main className={`atlas-main${floor !== 'ground' && floor !== 'second' ? ' atlas-main-unconfigured' : ''}${floor === 'second' ? ' atlas-main-school' : ''}${floor === 'basement' ? ' atlas-main-radar' : ''}${view === 'commons' ? ' atlas-main-wide' : ''}`}>
          {floor === 'basement' ? (
            <div className="atlas-radar-feed">
              <div className="atlas-radar-feed-head">
                <div>
                  <span className="atlas-kicker">BASEMENT / RADAR FIELDNOTE</span>
                  <h1>{radarRoom === 'all' ? 'Field signals' : radarRoomTitle[radarRoom]}</h1>
                  <p>Observe the condition before choosing a response.</p>
                </div>
                <button className="atlas-button atlas-button-primary" type="button" onClick={() => openFrictionComposer()}>
                  <Plus aria-hidden="true" size={14} /> Surface friction
                </button>
              </div>
              <div className="atlas-radar-feed-tools" aria-label="Signal feed controls">
                <span className="is-active">FIELD SIGNAL</span>
                <small>Curated examples · no live community feed</small>
              </div>
              <article className="atlas-radar-dossier" aria-label="Selected friction signal">
                <div className="atlas-radar-dossier-meta">
                  <span>{selectedFriction.room === 'culture' ? 'CULTURE & STORIES' : selectedFriction.room === 'education' ? 'EDUCATION & SYSTEMS' : 'WORK & CAPABILITY'}</span>
                  <span className="atlas-radar-source">{selectedFriction.origin}</span>
                </div>
                <h2>{selectedFriction.title}</h2>
                <p className="atlas-radar-dossier-lede">{selectedFriction.signal}</p>
                <div className="atlas-radar-dossier-actions">
                  <button
                    className={`atlas-radar-vote${localVotes.includes(selectedFriction.id) ? ' is-selected' : ''}`}
                    type="button"
                    aria-pressed={localVotes.includes(selectedFriction.id)}
                    onClick={() => toggleLocalVote(selectedFriction.id)}
                  >
                    <ArrowUp aria-hidden="true" size={14} />
                    {localVotes.includes(selectedFriction.id) ? 'Marked relevant · local only' : 'Mark relevance · local only'}
                  </button>
                  <span><MessageCircle aria-hidden="true" size={13} /> Discussion not connected</span>
                </div>
                <div className="atlas-radar-dossier-body">
                  <section className="atlas-radar-inquiry">
                    <span className="atlas-radar-section-index">START HERE</span>
                    <h3>{selectedFriction.firstQuestion}</h3>
                  </section>
                  <details className="atlas-radar-context">
                    <summary>Context &amp; suggested next steps</summary>
                    <p>{selectedFriction.detail}</p>
                    <ol>
                      {selectedFriction.collectiveResponse.map(step => <li key={step}>{step}</li>)}
                    </ol>
                  </details>
                </div>
                <div className="atlas-radar-dossier-boundary">
                  <span>UNVERIFIED SIGNAL</span>
                  <p>No builders, active asset, or verified contribution record is linked. Replies and relevance marks do not create credentials.</p>
                </div>
                <button className="atlas-radar-adapt" type="button" onClick={() => openFrictionComposer(selectedFriction)}>
                  <Plus aria-hidden="true" size={13} /> Add a local perspective
                </button>
              </article>

              {visibleFriction.length > 1 && (
                <section className="atlas-radar-nearby" aria-label="Other field signals">
                  <div className="atlas-radar-nearby-head"><span>NEARBY SIGNALS</span><small>{visibleFriction.length - 1} more in this field</small></div>
                  <div className="atlas-radar-nearby-list">
                    {visibleFriction.filter(point => point.id !== selectedFriction.id).map(point => (
                      <button key={point.id} type="button" onClick={() => setSelectedFrictionId(point.id)}>
                        <span>{point.room === 'culture' ? 'CULTURE' : point.room === 'education' ? 'EDUCATION' : 'WORK'}</span>
                        <strong>{point.title}</strong>
                        <ChevronRight aria-hidden="true" size={15} />
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {drafts.filter(draft => draft.isFriction).length > 0 && (
                <section className="atlas-radar-personal-notes" aria-label="Your session notes">
                  <div className="atlas-radar-nearby-head"><span>YOUR SESSION NOTES</span><small>Only visible in this session</small></div>
                  {drafts.filter(draft => draft.isFriction).map(draft => (
                    <article key={draft.id}>
                      <div><span>LOCAL NOTE · NOT SHARED</span><small>{draft.place || 'Place not specified'}</small></div>
                      <strong>{draft.title}</strong>
                      {draft.parentTitle && <p>A perspective on “{draft.parentTitle}”</p>}
                      <p>{draft.detail}</p>
                    </article>
                  ))}
                </section>
              )}
            </div>
          ) : floor === 'second' ? (
            <SchoolConsole embedded />
          ) : floor === 'first' ? (
            <section className="atlas-floor-empty">
              <span className="atlas-floor-empty-icon"><Building2 aria-hidden="true" size={22} /></span>
              <span className="atlas-kicker">FIRST FLOOR / GOVERNANCE</span>
              <h1>Governance starts with clear decision rights.</h1>
              <p>This floor is open to explore. Decision rights remain scoped to verified capability.</p>
              <span>No governance credential is connected to this workspace.</span>
            </section>
          ) : (
          <div className="atlas-main-scroll">
            <div className="atlas-main-top">
              <div>
                <div className="atlas-kicker">{currentCopy.kicker}</div>
                <div className="atlas-title-row">
                  <h1>{currentCopy.title}</h1>
                  <span className="atlas-title-state"><i />{view === 'topology' ? 'In view' : view === 'problems' ? 'Local' : view === 'engines' ? 'Interest only' : 'Schema'}</span>
                </div>
                <p className="atlas-subtitle">{currentCopy.subtitle}</p>
              </div>
              <div className="atlas-main-tools">
                {view === 'topology' && (
                  <>
                    <button className="atlas-button atlas-button-quiet" type="button" onClick={() => notify('Asset onboarding is not connected in this workspace yet.')}>
                      <Plus aria-hidden="true" size={14} /> Onboard an asset
                    </button>
                    <button className="atlas-icon-button" type="button" aria-label="Focus relationship field" title="Focus relationship field" onClick={() => canvasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}>
                      <Focus aria-hidden="true" size={15} />
                    </button>
                  </>
                )}
                {view === 'problems' && (
                  <button className="atlas-button atlas-button-primary" type="button" onClick={openModal}>
                    <Plus aria-hidden="true" size={14} /> New brief
                  </button>
                )}
              </div>
            </div>

            {floor === 'ground' && view !== 'topology' && view !== 'engines' && (
              <nav className="atlas-engine-tabs" aria-label="Work Engine sections">
                {([
                  ['problems', 'Local notes'],
                  ['ledger', 'Delivery & proof'],
                  ['commons', 'Tenders'],
                ] as const).map(([section, label]) => (
                  <button
                    className={view === section ? 'is-active' : ''}
                    key={section}
                    type="button"
                    aria-current={view === section ? 'page' : undefined}
                    onClick={() => setView(section)}
                  >
                    {label}
                  </button>
                ))}
              </nav>
            )}

            {view === 'engines' && (
              <section className="atlas-engine-recruitment" aria-labelledby="atlas-engine-title">
                <div className="atlas-engine-intro">
                  <div>
                    <span className="atlas-kicker">ASSETS / CAPABILITY</span>
                    <h2 id="atlas-engine-title">Choose a place to contribute.</h2>
                    <p>Select an asset to focus your capability interest.</p>
                  </div>
                  <span className="atlas-engine-count">03 <small>ASSETS</small></span>
                </div>
                <div className="atlas-engine-assets">
                  <nav className="atlas-engine-asset-list" aria-label="Work Engine assets">
                    {RECRUITING_ASSET_IDS.map(id => {
                      const asset = RECORDS[id];
                      return (
                        <button
                          className="atlas-engine-asset-option"
                          type="button"
                          key={id}
                          aria-label={`Select ${asset.title}`}
                          aria-pressed={selectedRecruitingAssetId === id}
                          onClick={() => setSelectedRecruitingAssetId(id)}
                        >
                          <span className="atlas-engine-asset-glyph">{asset.icon}</span>
                          <span className="atlas-engine-asset-option-copy">
                            <strong>{asset.title}</strong>
                            <small>{asset.state}</small>
                          </span>
                          <ChevronRight aria-hidden="true" size={14} />
                        </button>
                      );
                    })}
                  </nav>
                  <article className={`atlas-engine-asset atlas-engine-asset-${selectedRecruitingAssetId}`}>
                    <div className="atlas-engine-asset-top">
                      <span className="atlas-engine-asset-glyph">{selectedRecruitingAsset.icon}</span>
                      <span className="atlas-engine-asset-status">{selectedRecruitingAsset.state}</span>
                    </div>
                    <span className="atlas-engine-asset-discipline">{selectedRecruitingCopy.discipline}</span>
                    <h3>{selectedRecruitingAsset.title}</h3>
                    <p>{selectedRecruitingCopy.invitation}</p>
                    <div className="atlas-engine-asset-focus"><span>Useful in</span><strong>{selectedRecruitingCopy.focus}</strong></div>
                    <button
                      className="atlas-engine-apply"
                      type="button"
                      onClick={() => {
                        setProfileSection('capability');
                        setProfileAssetContext(selectedRecruitingAsset.title);
                        setProfileOpen(true);
                      }}
                    >
                      Offer capability <ArrowRight aria-hidden="true" size={14} />
                    </button>
                    <small className="atlas-engine-asset-boundary">Interest only · no open role is connected</small>
                  </article>
                </div>
              </section>
            )}

            {view === 'topology' && (
              <>
                <div className="atlas-section-head">
                  <h2>Three assets. One shared field.</h2><span>ILLUSTRATIVE / NO VERIFIED LINKS</span>
                </div>
                <div className="atlas-canvas" ref={canvasRef}>
                  <div className="atlas-graph" role="region" aria-label="Three illustrative asset relationships">
                    <svg className="atlas-edges" viewBox="0 0 1000 420" preserveAspectRatio="none" aria-hidden="true">
                      <path className="atlas-edge-desktop" d="M210 132 C350 184 390 242 500 276" />
                      <path className="atlas-edge-desktop is-soft" d="M790 132 C650 184 610 242 500 276" />
                      <path className="atlas-edge-mobile" d="M500 76 L500 178" />
                      <path className="atlas-edge-mobile is-soft" d="M500 226 L500 328" />
                    </svg>
                    {Object.entries(RECORDS).map(([id, record]) => (
                      <button
                        key={id}
                        className={`atlas-node atlas-node-${id}${!selectedDraftId && selectedRecordId === id ? ' is-selected' : ''}`}
                        type="button"
                        aria-label={`Inspect ${record.title}`}
                        onClick={() => selectRecord(id)}
                      >
                        <i className="atlas-node-marker" />
                        <span className="atlas-node-glyph">{record.icon}</span>
                        <span className="atlas-node-copy"><strong>{record.title}</strong><small>{record.meta}</small></span>
                      </button>
                    ))}
                    <div className="atlas-graph-caption"><span>Possible intersections · unconfirmed</span><span>03 ASSETS</span></div>
                  </div>
                </div>
              </>
            )}

            {view === 'problems' && (
              <section className="atlas-block">
                <div className="atlas-block-head">
                  <div><h2>Local drafts</h2><p>Session-scoped · not submitted</p></div>
                  <span className="atlas-state atlas-state-draft">{String(drafts.length).padStart(2, '0')} DRAFTS</span>
                </div>
                <div className="atlas-block-body">
                  {drafts.length ? drafts.map(draft => (
                    <article className="atlas-draft-card" key={draft.id}>
                      <div className="atlas-draft-card-head"><h3>{draft.title}</h3><span className="atlas-state atlas-state-draft">LOCAL DRAFT</span></div>
                      <div className="atlas-fact-row"><span>Site / context</span><strong>{draft.place || 'Not specified'}</strong></div>
                      <p>{draft.detail}</p>
                      <div className="atlas-fact-row"><span>Measure</span><strong>{draft.measure || 'Not defined'}</strong></div>
                      <button className="atlas-text-action" type="button" onClick={() => { setSelectedDraftId(draft.id); setView('problems'); }}>
                        Inspect draft <ArrowUpRight aria-hidden="true" size={13} />
                      </button>
                    </article>
                  )) : (
                    <div className="atlas-empty">
                      <span><Plus aria-hidden="true" size={16} /></span>
                      <strong>No drafts in this session.</strong>
                      <p>Create a local note to record an observed problem.</p>
                      <button className="atlas-button" type="button" onClick={openModal}>Create a brief</button>
                    </div>
                  )}
                </div>
              </section>
            )}

            {view === 'ledger' && (
              <>
                <nav className="atlas-ledger-tabs" aria-label="Ledger and capability sections">
                  {([
                    ['roll', 'The Roll', ScrollText],
                    ['capability', 'Capability', UsersRound],
                    ['sequence', 'Work sequence', ListChecks],
                  ] as const).map(([section, label, Icon]) => (
                    <button
                      className={ledgerSection === section ? 'is-active' : ''}
                      key={section}
                      type="button"
                      aria-pressed={ledgerSection === section}
                      onClick={() => setLedgerSection(section)}
                    >
                      <Icon aria-hidden="true" size={14} />{label}
                    </button>
                  ))}
                </nav>
                {ledgerSection === 'roll' && (
                  <section className="atlas-block">
                    <div className="atlas-block-head">
                      <div><h2>Provenance ledger</h2><p>Proposed structure · no live ledger connected</p></div>
                      <span className="atlas-state atlas-state-open">CONCEPT</span>
                    </div>
                    <div className="atlas-block-body">
                      {ROLL_FIELDS.map(([label, description]) => (
                        <div className="atlas-schema-row" key={label}><strong>{label}</strong><span>{description}</span></div>
                      ))}
                    </div>
                  </section>
                )}
                {ledgerSection === 'capability' && (
                  <section className="atlas-block">
                    <div className="atlas-block-head">
                      <div><h2>Capability record</h2><p>Suggested fields · no people connected</p></div>
                      <span className="atlas-state atlas-state-open">SCHEMA</span>
                    </div>
                    <div className="atlas-block-body">
                      {CAPABILITY_FIELDS.map(([label, description]) => (
                        <div className="atlas-schema-row" key={label}><strong>{label}</strong><span>{description}</span></div>
                      ))}
                    </div>
                  </section>
                )}
                {ledgerSection === 'sequence' && (
                  <section className="atlas-block">
                    <div className="atlas-block-head">
                      <div><h2>Operating sequence</h2><p>Each gate needs evidence before transition.</p></div>
                      <span className="atlas-state">NOT STARTED</span>
                    </div>
                    <div className="atlas-block-body">
                      {SEQUENCE.map(step => (
                        <div className="atlas-sequence-step" key={step.number}>
                          <span className="atlas-step-number">{step.number}</span>
                          <div><strong>{step.title}</strong><p>{step.description}</p></div>
                          <span className={`atlas-state${step.first ? ' atlas-state-open' : ''}`}>{step.state}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {view === 'commons' && (
              <section className="atlas-block atlas-commons">
                <div className="atlas-block-head">
                  <div><h2>Shared Tender records</h2><p>Published records and illustrative scenarios are identified separately.</p></div>
                  <span className="atlas-state">{String(initialTenders.length).padStart(2, '0')} RECORDS</span>
                </div>
                <div className="atlas-block-body atlas-commons-list">
                  {initialTenders.length ? initialTenders.map(tender => (
                    <article className="atlas-commons-card" key={tender.id}>
                      <div className="atlas-commons-card-head">
                        <span className="atlas-commons-category">{tender.category}</span>
                        <span className={`atlas-state${tender.isIllustrative ? ' atlas-state-draft' : ' atlas-state-open'}`}>
                          {tender.isIllustrative ? 'ILLUSTRATIVE SCENARIO' : 'PUBLISHED RECORD'}
                        </span>
                      </div>
                      <h3>{tender.assetName}</h3>
                      <p>{tender.summary}</p>
                      <div className="atlas-commons-meta"><span>{tender.location}</span><span>{tender.status.replaceAll('_', ' ')}</span></div>
                    </article>
                  )) : (
                    <div className="atlas-empty">
                      <span><Boxes aria-hidden="true" size={16} /></span>
                      <strong>No shared records available.</strong>
                      <p>Published Commons records will appear here when available.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
          )}
        </main>

        {floor === 'ground' && view !== 'commons' && view !== 'engines' && <aside className="atlas-inspector">
          <div className="atlas-inspector-head">
            <div className="atlas-inspector-top"><span>01 — Record inspector</span><span className="atlas-inspector-icon">{selectedDraft ? '+' : selectedRecord.icon}</span></div>
            <h2>{inspectorTitle}</h2>
            <p>{inspectorDescription}</p>
            <div className="atlas-chips">
              <span className="atlas-chip"><i />{selectedDraft ? 'Local draft' : selectedRecord.state}</span>
              <span className="atlas-chip">{selectedDraft ? 'Problem brief' : selectedRecord.short}</span>
            </div>
          </div>
          <div className="atlas-inspector-scroll">
            <section className="atlas-inspector-section">
              <h3>Record metadata</h3>
              <div className="atlas-inspector-fact"><span>Class</span><strong>{selectedDraft ? 'User-authored draft' : selectedRecord.type}</strong></div>
              <div className="atlas-inspector-fact"><span>Provenance</span><strong>{selectedDraft ? 'Current browser session' : selectedRecord.source}</strong></div>
              <div className="atlas-inspector-fact"><span>Owner</span><strong>Unassigned</strong></div>
            </section>
            <section className="atlas-inspector-section">
              <h3>Evidence gaps</h3>
              {evidence.map(item => <div className="atlas-proof" key={item}><i /><span>{item}</span></div>)}
              <p className="atlas-hint">{selectedDraft
                ? 'Validate with affected people before selecting a solution.'
                : selectedRecord.hint}</p>
            </section>
            <section className="atlas-inspector-section">
              <h3>Relations</h3>
              {relations.map(item => <div className="atlas-proof" key={item}><i /><span>{item}</span></div>)}
            </section>
            <section className="atlas-inspector-section">
              <h3>Actions</h3>
              <div className="atlas-inspector-actions">
                {inspectorActions.map(([label, action]) => (
                  <button className="atlas-action-link" type="button" key={label} onClick={() => handleInspectorAction(action)}>
                    <span>{action === 'export' && <ArrowDownToLine aria-hidden="true" size={14} />}{label}</span>
                    {action !== 'export' && <ArrowRight aria-hidden="true" size={14} />}
                  </button>
                ))}
              </div>
            </section>
          </div>
          <div className="atlas-inspector-foot"><span><i />SESSION ONLY</span><span>NO SHARED WRITES</span></div>
        </aside>}
      </div>

      <footer className="atlas-footer">
        <span><i /> {localMode ? 'LOCAL SESSION' : 'SIGNED-IN SESSION'} <span className="atlas-footer-muted">/ EXAMPLE DATA</span></span>
        <span>APT—LABS <span className="atlas-footer-muted">· FIELD ATLAS</span> <b>01.1</b></span>
        <span className="atlas-footer-contexts">FLOORS CHANGE VIEW · ACCESS STAYS SERVER-VERIFIED</span>
      </footer>

      {modalOpen && (
        <div className="atlas-modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="atlas-modal" role="dialog" aria-modal="true" aria-labelledby="atlas-modal-title">
            <div className="atlas-modal-head">
              <div>
                <span className="atlas-kicker">{composerMode === 'friction' ? 'Basement / friction draft' : 'Intake / local draft'}</span>
                <h2 id="atlas-modal-title">{composerMode === 'friction' ? 'Add a friction point' : 'New problem brief'}</h2>
                <p>{composerMode === 'friction'
                  ? 'This stays in the current session. It is not sent to Commons.'
                  : 'A local note. No network submission.'}</p>
              </div>
              <button className="atlas-icon-button" type="button" aria-label="Close dialog" onClick={closeModal}><X aria-hidden="true" size={16} /></button>
            </div>
            <form className="atlas-form" onSubmit={saveDraft}>
              <label>{composerMode === 'friction' ? 'Friction title' : 'Brief title'}<input ref={titleInput} required maxLength={100} placeholder="What is the friction?" value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} /></label>
              <label>{composerMode === 'friction' ? 'Place / country' : 'Site / context'}<input maxLength={100} placeholder="Where does this occur?" value={form.place} onChange={event => setForm(current => ({ ...current, place: event.target.value }))} /></label>
              <label>{composerMode === 'friction' ? 'What do people experience?' : 'Observed condition'}<textarea required maxLength={1200} rows={4} placeholder="What happens? Who is affected? What is known or still uncertain?" value={form.detail} onChange={event => setForm(current => ({ ...current, detail: event.target.value }))} /></label>
              <label>{composerMode === 'friction' ? 'Evidence or first measure to gather' : 'Measure of improvement'}<input maxLength={240} placeholder={composerMode === 'friction' ? 'What should people verify first?' : 'What would a useful change look like?'} value={form.measure} onChange={event => setForm(current => ({ ...current, measure: event.target.value }))} /></label>
              <div className="atlas-form-foot"><span>{composerMode === 'friction' ? 'Session-only draft · not submitted to Commons.' : 'Stored in this page session only.'}</span><div><button className="atlas-button atlas-button-quiet" type="button" onClick={closeModal}>Cancel</button><button className="atlas-button atlas-button-primary" type="submit">Save local draft</button></div></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
















