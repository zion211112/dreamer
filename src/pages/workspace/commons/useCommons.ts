import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { RefObject } from 'preact';
import { useLocation } from 'wouter';
import {
  createLocalId,
  hasRegisteredInstitution,
  parseConsoleDraftId,
  assignLocalSteward,
  createCommonsProposal,
  decideCommonsProposal,
  hasLocalStewardRole,
  readCommonsGovernance,
  readFieldSignals,
  writeFieldSignals,
  type CommonsGovernanceRecord,
  type FieldSignal,
  type ProposalStatus,
  type SignalStatus,
} from '../../../lib/local-workflows';
import { loadConsoleSnapshot } from '../../../lib/school-console-storage';
import { EXAMPLE_FIELD_SIGNALS } from '../../../lib/ecosystem-examples';
import { PEOPLE_NETWORK } from '../../../lib/people-network';
import {
  filterRadarSignals,
  getSelectedRadarSignal,
  paginateRadarSignals,
  resolveRadarSignalLink,
} from '../../../lib/radar-view';

const filters: Array<'all' | SignalStatus> = ['all', 'new', 'triaged', 'brief', 'resolved'];
const RADAR_PAGE_SIZE = 12;
const institutionNames: Record<string, string> = Object.fromEntries(PEOPLE_NETWORK
  .filter(entity => entity.type === 'institution')
  .map(entity => [entity.id, entity.name]));
const featuredPossibility = EXAMPLE_FIELD_SIGNALS.find(signal => signal.id === 'scenario-kibera-making-space');

function getCurrentEmail(): string {
  try {
    const stored = localStorage.getItem('authUser');
    const user = stored ? JSON.parse(stored) as { email?: unknown } : null;
    return typeof user?.email === 'string' ? user.email.trim().toLocaleLowerCase() : '';
  } catch {
    return '';
  }
}

type SetBoolean = (value: boolean | ((prev: boolean) => boolean)) => void;
type SetNumber = (value: number | ((prev: number) => number)) => void;
type SetDecisionNotes = (value: Record<string, string> | ((prev: Record<string, string>) => Record<string, string>)) => void;

export interface CommonsHook {
  contributeButtonRef: RefObject<HTMLButtonElement>;
  reportInstitutionRef: RefObject<HTMLSelectElement>;
  commonsView: 'signals' | 'opportunities' | 'decisions';
  setCommonsView: (view: 'signals' | 'opportunities' | 'decisions') => void;
  institutionScope: string;
  setInstitutionScope: (id: string) => void;
  signals: FieldSignal[];
  setSignals: (sigs: FieldSignal[]) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
  filter: (typeof filters)[number];
  setFilter: (f: (typeof filters)[number]) => void;
  search: string;
  setSearch: (q: string) => void;
  signalPage: number;
  setSignalPage: SetNumber;
  showReportForm: boolean;
  setShowReportForm: SetBoolean;
  showContributionMenu: boolean;
  setShowContributionMenu: SetBoolean;
  selectedOpportunityId: string;
  setSelectedOpportunityId: (id: string) => void;
  sourceConsoleDraftId: string | null;
  reportTitle: string;
  setReportTitle: (t: string) => void;
  reportDetails: string;
  setReportDetails: (d: string) => void;
  note: string;
  setNote: (n: string) => void;
  error: string;
  setError: (e: string) => void;
  loaded: boolean;
  actorEmail: string;
  governance: CommonsGovernanceRecord;
  showProposalForm: boolean;
  setShowProposalForm: SetBoolean;
  newStewardEmail: string;
  setNewStewardEmail: (e: string) => void;
  decisionNotes: Record<string, string>;
  setDecisionNotes: SetDecisionNotes;
  institutionNames: Record<string, string>;
  institutionOptions: readonly [string, string][];
  visibleSignals: FieldSignal[];
  paginatedSignals: { items: FieldSignal[]; page: number; pageCount: number; total: number };
  selected: FieldSignal | null;
  featuredPossibility: FieldSignal | undefined;
  activeInstitutionId: string;
  activeInstitutionName: string;
  scopeInstitutionName: string;
  activeStewards: CommonsGovernanceRecord['stewards'];
  isSteward: boolean;
  approvedProposal: CommonsGovernanceRecord['proposals'][number] | null;
  persist: (nextSignals: FieldSignal[]) => boolean;
  registerInitialSteward: () => void;
  addSteward: (event: Event) => void;
  submitProposal: (event: Event) => void;
  recordDecision: (proposalId: string, status: Exclude<ProposalStatus, 'proposed'>) => void;
  submitReport: (event: Event) => void;
  closeReportForm: () => void;
  changeStatus: (status: SignalStatus) => void;
  addNote: (event: Event) => void;
  navigate: (href: string) => void;
}

export function useCommons(): CommonsHook {
  const [, navigate] = useLocation();
  const contributeButtonRef = useRef<HTMLButtonElement>(null);
  const reportInstitutionRef = useRef<HTMLSelectElement>(null);
  const [commonsView, setCommonsView] = useState<'signals' | 'opportunities' | 'decisions'>('signals');
  const [institutionScope, setInstitutionScope] = useState('');
  const [signals, setSignals] = useState<FieldSignal[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('all');
  const [search, setSearch] = useState('');
  const [signalPage, setSignalPage] = useState(0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [showContributionMenu, setShowContributionMenu] = useState(false);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState('kemetos-agi1-software');
  const [sourceConsoleDraftId, setSourceConsoleDraftId] = useState<string | null>(null);
  const [reportTitle, setReportTitle] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [actorEmail, setActorEmail] = useState('');
  const [governance, setGovernance] = useState<CommonsGovernanceRecord>({ stewards: [], proposals: [] });
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [newStewardEmail, setNewStewardEmail] = useState('');
  const [decisionNotes, setDecisionNotes] = useState<Record<string, string>>({});
  const [unresolvedReference, setUnresolvedReference] = useState(false);

  function selectSignal(id: string) {
    if (unresolvedReference) {
      setUnresolvedReference(false);
      setError('');
    }
    setSelectedId(id);
  }

  function changeInstitutionScope(id: string) {
    if (unresolvedReference) {
      setUnresolvedReference(false);
      setError('');
    }
    setInstitutionScope(id);
  }

  useEffect(() => {
    if (showReportForm) reportInstitutionRef.current?.focus();
  }, [showReportForm]);

  useEffect(() => {
    let active = true;
    setActorEmail(getCurrentEmail());
    try {
      const savedSignals = readFieldSignals();
      const searchParams = new URLSearchParams(window.location.search);
      const requestedInstitution = searchParams.get('institution');
      const requestedSignal = searchParams.get('signal');
      const resolution = resolveRadarSignalLink(savedSignals, requestedSignal, requestedInstitution);
      setSignals(savedSignals);
      setSelectedId(resolution.signal?.id ?? '');
      setUnresolvedReference(Boolean(resolution.error));
      if (resolution.error) setError(resolution.error);
      const initialInstitution = requestedInstitution ?? resolution.signal?.institutionId ?? '';
      setInstitutionScope(initialInstitution);
      setSearch('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Local field signals could not be loaded.');
    }
    try {
      setGovernance(readCommonsGovernance());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Local governance records could not be loaded.');
    }
    setLoaded(true);
    const requestedDraftId = parseConsoleDraftId(window.location.search);
    if (requestedDraftId) {
      void loadConsoleSnapshot().then(snapshot => {
        const draft = snapshot.tenderDrafts.find(item => item.id === requestedDraftId);
        if (!draft) throw new Error('The selected School Console draft is no longer available.');
        const title = draft.assetName.trim();
        const details = draft.need.trim();
        if (title.length < 5 || details.length < 12) {
          throw new Error('The selected Console draft needs a clear title and at least 12 characters of need detail before it can be reviewed here.');
        }
        if (!active) return;
        setSourceConsoleDraftId(draft.id);
        setReportTitle(title);
        setReportDetails(details);
        setShowReportForm(true);
      }).catch(loadError => {
        if (active) setError(loadError instanceof Error
          ? loadError.message
          : 'The selected School Console draft could not be loaded.');
      });
    }
    return () => { active = false; };
  }, []);

  const institutionOptions: readonly [string, string][] = PEOPLE_NETWORK
    .filter(entity => entity.type === 'institution')
    .map(entity => [entity.id, entity.name] as [string, string]);
  const visibleSignals = useMemo(() => filterRadarSignals(signals, {
    institutionId: institutionScope,
    status: filter,
    query: search,
  }), [signals, institutionScope, filter, search]);
  const paginatedSignals = paginateRadarSignals(visibleSignals, signalPage, RADAR_PAGE_SIZE);
  const selected = unresolvedReference ? null : getSelectedRadarSignal(visibleSignals, selectedId);

  useEffect(() => {
    if (unresolvedReference) return;
    if (selected?.id !== selectedId) setSelectedId(selected?.id ?? '');
  }, [selected?.id, selectedId, unresolvedReference]);

  useEffect(() => {
    if (paginatedSignals.page !== signalPage) setSignalPage(paginatedSignals.page);
  }, [paginatedSignals.page, signalPage]);

  const activeInstitutionId = institutionScope || (selected?.scenario ? '' : selected?.institutionId) || '';
  const activeInstitutionName = activeInstitutionId ? institutionNames[activeInstitutionId]
    ?? selected?.institutionName
    ?? signals.find(signal => signal.institutionId === activeInstitutionId)?.institutionName
    ?? selected?.institutionName
    ?? 'Institution' : 'All institutions';
  const scopeInstitutionName = institutionScope ? institutionNames[institutionScope]
    ?? signals.find(signal => signal.institutionId === institutionScope)?.institutionName
    ?? 'Institution' : 'All institutions';
  const authorityInstitutionId = selected?.institutionId ?? activeInstitutionId;
  const activeStewards = governance.stewards.filter(steward => steward.institutionId === authorityInstitutionId);
  const isSteward = hasLocalStewardRole(governance, authorityInstitutionId, actorEmail);
  const approvedProposal = selected
    ? governance.proposals.find(proposal => proposal.sourceSignalId === selected.id && proposal.status === 'approved') ?? null
    : null;

  function persist(nextSignals: FieldSignal[]): boolean {
    try {
      writeFieldSignals(nextSignals);
      setSignals(nextSignals);
      setError('');
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Local field signals could not be saved.');
      return false;
    }
  }

  function registerInitialSteward() {
    try {
      setGovernance(assignLocalSteward(activeInstitutionId, actorEmail));
      setError('');
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Steward role could not be recorded.');
    }
  }

  function addSteward(event: Event) {
    event.preventDefault();
    try {
      setGovernance(assignLocalSteward(activeInstitutionId, newStewardEmail, actorEmail));
      setNewStewardEmail('');
      setError('');
    } catch (roleError) {
      setError(roleError instanceof Error ? roleError.message : 'Steward could not be assigned.');
    }
  }

  function submitProposal(event: Event) {
    event.preventDefault();
    if (!selected || selected.scenario) return;
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    try {
      const updated = createCommonsProposal({
        institutionId: selected.institutionId,
        institutionName: selected.institutionName,
        sourceSignalId: selected.id,
        title: String(values.get('proposal-title') ?? '').trim(),
        rationale: String(values.get('proposal-rationale') ?? '').trim(),
        rule: String(values.get('proposal-rule') ?? '').trim(),
      }, actorEmail);
      setGovernance(updated);
      setShowProposalForm(false);
      setError('');
      form.reset();
    } catch (proposalError) {
      setError(proposalError instanceof Error ? proposalError.message : 'Proposal could not be recorded.');
    }
  }

  function recordDecision(proposalId: string, status: Exclude<ProposalStatus, 'proposed'>) {
    const noteText = decisionNotes[proposalId]?.trim() ?? '';
    if (noteText.length < 5) {
      setError('Add a short reason before recording a steward decision.');
      return;
    }
    try {
      setGovernance(decideCommonsProposal(proposalId, status, noteText, actorEmail));
      setDecisionNotes(current => ({ ...current, [proposalId]: '' }));
      setError('');
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Decision could not be recorded.');
    }
  }

  function submitReport(event: Event) {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const values = new FormData(form);
    const title = String(values.get('title') ?? '').trim();
    const institutionId = String(values.get('institution') ?? '');
    const institutionName = institutionNames[institutionId] ?? '';
    const assetName = String(values.get('asset') ?? '').trim();
    const locationName = String(values.get('location') ?? '').trim();
    const details = String(values.get('details') ?? '').trim();
    if (title.length < 5 || details.length < 12
      || !hasRegisteredInstitution(institutionId, Object.keys(institutionNames))) {
      setError('Select a registered institution, add a short issue title, and provide enough detail to review.');
      return;
    }

    const now = new Date().toISOString();
    const signal: FieldSignal = {
      id: createLocalId('signal'),
      institutionId,
      institutionName,
      ...(assetName ? { assetName } : {}),
      ...(sourceConsoleDraftId ? { sourceConsoleDraftId } : {}),
      location: locationName,
      title,
      details,
      urgency: values.get('urgency') === 'urgent' || values.get('urgency') === 'soon'
        ? values.get('urgency') as FieldSignal['urgency']
        : 'routine',
      status: 'new',
      createdAt: now,
      updatedAt: now,
      updates: [{ id: createLocalId('update'), text: 'Signal captured in this browser. Not shared or verified.', createdAt: now }],
      scenario: false,
    };
    const next = [signal, ...signals];
    if (!persist(next)) return;
    selectSignal(signal.id);
    changeInstitutionScope(signal.institutionId);
    setSignalPage(0);
    setShowReportForm(false);
    setReportTitle('');
    setReportDetails('');
    navigate('/workspace/commons');
    form.reset();
  }

  function closeReportForm() {
    setShowReportForm(false);
    setReportTitle('');
    setReportDetails('');
    contributeButtonRef.current?.focus();
    if (parseConsoleDraftId(window.location.search)) navigate('/workspace/commons');
  }

  function changeStatus(status: SignalStatus) {
    if (!selected || selected.scenario) return;
    if (status === 'resolved' && !isSteward) {
      setError('Only a designated steward can close this observation.');
      return;
    }
    const now = new Date().toISOString();
    const update = {
      id: createLocalId('update'),
      text: status === 'triaged'
        ? 'Moved to triage in this browser.'
        : status === 'brief'
          ? 'Work brief preparation started in this browser.'
          : status === 'resolved'
            ? 'Marked resolved in this browser; no work verification is implied.'
            : 'Reopened in this browser.',
      createdAt: now,
    };
    persist(signals.map(signal => signal.id === selected.id
      ? { ...signal, status, updatedAt: now, updates: [update, ...signal.updates] }
      : signal));
  }

  function addNote(event: Event) {
    event.preventDefault();
    if (!selected || selected.scenario || !note.trim()) return;
    const now = new Date().toISOString();
    const update = { id: createLocalId('update'), text: note.trim(), createdAt: now };
    const saved = persist(signals.map(signal => signal.id === selected.id
      ? { ...signal, updatedAt: now, updates: [update, ...signal.updates] }
      : signal));
    if (saved) setNote('');
  }

  return {
    contributeButtonRef, reportInstitutionRef,
    commonsView, setCommonsView,
    institutionScope, setInstitutionScope: changeInstitutionScope,
    signals, setSignals,
    selectedId, setSelectedId: selectSignal,
    filter, setFilter,
    search, setSearch,
    signalPage, setSignalPage,
    showReportForm, setShowReportForm,
    showContributionMenu, setShowContributionMenu,
    selectedOpportunityId, setSelectedOpportunityId,
    sourceConsoleDraftId,
    reportTitle, setReportTitle,
    reportDetails, setReportDetails,
    note, setNote,
    error, setError,
    loaded, actorEmail, governance,
    showProposalForm, setShowProposalForm,
    newStewardEmail, setNewStewardEmail,
    decisionNotes, setDecisionNotes,
    institutionNames,
    institutionOptions,
    visibleSignals,
    paginatedSignals,
    selected,
    featuredPossibility,
    activeInstitutionId,
    activeInstitutionName,
    scopeInstitutionName,
    activeStewards,
    isSteward,
    approvedProposal,
    persist,
    registerInitialSteward,
    addSteward,
    submitProposal,
    recordDecision,
    submitReport,
    closeReportForm,
    changeStatus,
    addNote,
    navigate,
  };
}
