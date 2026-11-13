/**
 * APT-LABS — Annals unified event stream.
 *
 * Position: Annals is not a feature list; it is the chronological record of
 * what happened across Commons, Workbench, School Console, and Roll. Every
 * event is attributable (who, when, module, action) and links to its source
 * record. Corrections remain visible; events are appended, never rewritten.
 * Browser-local demo: events are read from existing local stores and merged
 * into one time-ordered chronology.
 */

import type { RollEntry } from './db/roll';
import { queryRollEntries } from './db/roll';
import type { SbtAttestation } from './sbt-attestations';
import { listSbtAttestations } from './sbt-attestations';
import type { FieldSignal } from './local-workflows';
import { readFieldSignals, readCommonsGovernance } from './local-workflows';
import { readLocalWorkbench } from './local-workbench';
import type { ConsoleSnapshot } from './school-console-storage';
import { loadConsoleSnapshot } from './school-console-storage';

export type AnnalsEventType =
  | 'signal_created'
  | 'signal_triaged'
  | 'proposal_created'
  | 'proposal_approved'
  | 'proposal_rejected'
  | 'proposal_returned'
  | 'tender_draft_created'
  | 'application_submitted'
  | 'application_selected'
  | 'application_declined'
  | 'work_authorized'
  | 'work_accepted_by_contributor'
  | 'delivery_submitted'
  | 'delivery_accepted'
  | 'delivery_changes_requested'
  | 'roll_entry_created'
  | 'sbt_attestation_minted'
  | 'roll_revision_recorded';

export interface AnnalsEvent {
  id: string;
  timestamp: string;
  module: 'commons' | 'workbench' | 'school-console' | 'records' | 'intelligence';
  type: AnnalsEventType;
  actor: string;
  description: string;
  relatedIds: string[];
  evidenceHash?: string;
  recordBasis?: 'illustrative' | 'local-profile' | 'project-reported';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isAnnalsEvent(value: unknown): value is AnnalsEvent {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === 'string'
    && typeof value.timestamp === 'string'
    && ['commons', 'workbench', 'school-console', 'records', 'intelligence'].includes(String(value.module))
    && typeof value.type === 'string'
    && typeof value.actor === 'string'
    && typeof value.description === 'string'
    && Array.isArray(value.relatedIds)
    && value.relatedIds.every((r) => typeof r === 'string')
    && (value.evidenceHash === undefined || typeof value.evidenceHash === 'string')
    && (value.recordBasis === undefined || ['illustrative', 'local-profile', 'project-reported'].includes(String(value.recordBasis)))
  );
}

const STORAGE_KEY = 'aptlabs:annals-events:v1';

function readPersistedEvents(): AnnalsEvent[] {
  let serialized: string | null;
  try {
    serialized = localStorage.getItem(STORAGE_KEY);
  } catch {
    return [];
  }
  if (serialized === null) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed) || !parsed.every(isAnnalsEvent)) return [];
  return parsed;
}

function writePersistedEvents(events: AnnalsEvent[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch {
    // best-effort persistence; Annals still reads live stores
  }
}

/** Build the unified chronology from all local stores. */
export async function buildAnnalsEventStream(): Promise<AnnalsEvent[]> {
  const events: AnnalsEvent[] = [];

  // --- Commons: field signals ---
  let signals: FieldSignal[] = [];
  try {
    signals = readFieldSignals();
  } catch {
    signals = [];
  }
  for (const signal of signals) {
    events.push({
      id: `signal-${signal.id}`,
      timestamp: signal.createdAt,
      module: 'commons',
      type: 'signal_created',
      actor: signal.institutionName,
      description: `Field signal raised: ${signal.title}`,
      relatedIds: [signal.id, signal.sourceConsoleDraftId].filter(Boolean) as string[],
      recordBasis: signal.recordBasis,
    });
    if (signal.status !== 'new') {
      events.push({
        id: `signal-triaged-${signal.id}`,
        timestamp: signal.updatedAt,
        module: 'commons',
        type: 'signal_triaged',
        actor: signal.institutionName,
        description: `Signal triaged: ${signal.title}`,
        relatedIds: [signal.id],
        recordBasis: signal.recordBasis,
      });
    }
  }

  // --- Commons: proposals ---
  let governance;
  try {
    governance = readCommonsGovernance();
  } catch {
    governance = { stewards: [], proposals: [] };
  }
  for (const proposal of governance.proposals) {
    events.push({
      id: `proposal-${proposal.id}`,
      timestamp: proposal.createdAt,
      module: 'commons',
      type: 'proposal_created',
      actor: proposal.createdBy,
      description: `Commons proposal: ${proposal.title}`,
      relatedIds: [proposal.id, proposal.sourceSignalId].filter(Boolean) as string[],
    });
    const lastEvent = proposal.events[proposal.events.length - 1];
    if (lastEvent && lastEvent.status !== 'proposed') {
      const typeMap: Record<string, AnnalsEventType> = {
        approved: 'proposal_approved',
        rejected: 'proposal_rejected',
        returned: 'proposal_returned',
      };
      events.push({
        id: `proposal-decision-${proposal.id}`,
        timestamp: lastEvent.createdAt,
        module: 'commons',
        type: typeMap[lastEvent.status] ?? 'proposal_returned',
        actor: lastEvent.actor,
        description: `Proposal ${lastEvent.status}: ${proposal.title}`,
        relatedIds: [proposal.id],
      });
    }
  }

  // --- Workbench: local applications ---
  let workbench;
  try {
    workbench = readLocalWorkbench();
  } catch {
    workbench = { applications: [] };
  }
  for (const application of workbench.applications) {
    events.push({
      id: `application-${application.id}`,
      timestamp: application.createdAt,
      module: 'workbench',
      type: 'application_submitted',
      actor: application.applicant,
      description: `Application submitted for ${application.opportunityId}`,
      relatedIds: [application.id, application.opportunityId],
    });

    for (const event of application.events) {
      let type: AnnalsEventType | null = null;
      const lower = event.action.toLowerCase();
      if (lower.includes('selected')) type = 'application_selected';
      else if (lower.includes('declined')) type = 'application_declined';
      else if (lower.includes('work_authorized') || lower.includes('authorized')) type = 'work_authorized';
      else if (lower.includes('authorization_accepted') || lower.includes('accepted')) type = 'work_accepted_by_contributor';
      else if (lower.includes('delivery_submitted') || lower.includes('submitted')) type = 'delivery_submitted';
      else if (lower.includes('changes_requested')) type = 'delivery_changes_requested';
      else if (lower.includes('accepted') && application.workStatus === 'accepted') type = 'delivery_accepted';

      if (type) {
        events.push({
          id: `workbench-event-${event.id}`,
          timestamp: event.createdAt,
          module: 'workbench',
          type,
          actor: event.actor,
          description: event.note,
          relatedIds: [application.id, application.opportunityId],
        });
      }
    }
  }
  let rollEntries: RollEntry[] = [];
  try {
    rollEntries = await queryRollEntries();
  } catch {
    rollEntries = [];
  }
  for (const entry of rollEntries) {
    events.push({
      id: `roll-entry-${entry.id}`,
      timestamp: entry.recorded_at,
      module: 'records',
      type: 'roll_entry_created',
      actor: entry.recorded_by,
      description: `Roll entry recorded: ${entry.title}`,
      relatedIds: [entry.id, entry.undertaking_id],
      evidenceHash: entry.hash_anchor,
    });
  }

  // --- SBT attestations ---
  let attestations: SbtAttestation[] = [];
  try {
    attestations = listSbtAttestations();
  } catch {
    attestations = [];
  }
  for (const attestation of attestations) {
    events.push({
      id: `sbt-${attestation.id}`,
      timestamp: attestation.issuedAt,
      module: 'records',
      type: 'sbt_attestation_minted',
      actor: attestation.issuedBy,
      description: `SBT attestation minted: ${attestation.role} — ${attestation.personName}`,
      relatedIds: [attestation.id, attestation.rollEntryId, attestation.undertakingId],
      evidenceHash: attestation.hashAnchor,
    });
  }

  // --- School Console: tender drafts ---
  let snapshot: ConsoleSnapshot;
  try {
    snapshot = await loadConsoleSnapshot();
  } catch {
    snapshot = { markedPapers: [], lessonDraft: '', completedTasks: [], inspectionChecks: [], tenderDrafts: [], feeNotes: [] };
  }
  for (const draft of snapshot.tenderDrafts) {
    events.push({
      id: `tender-draft-${draft.id}`,
      timestamp: draft.createdAt,
      module: 'school-console',
      type: 'tender_draft_created',
      actor: draft.id,
      description: `Tender draft: ${draft.assetName}`,
      relatedIds: [draft.id],
    });
  }

  // Merge with any persisted (manually recorded) events, deduplicated by id
  const persisted = readPersistedEvents();
  const existingIds = new Set(events.map((e) => e.id));
  const allEvents = [...events, ...persisted.filter((e) => !existingIds.has(e.id))];

  // Sort newest first, stable
  allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  writePersistedEvents(allEvents);
  return allEvents;
}

/** Record a manual correction or annotation event (detectable, appended). */
export function appendAnnalsEvent(event: Omit<AnnalsEvent, 'id'>): AnnalsEvent {
  const full: AnnalsEvent = {
    ...event,
    id: `annals-${crypto.randomUUID()}`,
  };
  const existing = readPersistedEvents();
  writePersistedEvents([full, ...existing]);
  return full;
}
