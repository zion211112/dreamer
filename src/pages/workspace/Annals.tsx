import { useState, useEffect, useMemo, useCallback } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';
import { buildAnnalsEventStream, type AnnalsEvent } from '../../lib/annals-event-stream';

const MODULE_LABELS: Record<string, string> = {
  commons: 'Commons',
  'workbench': 'Workbench',
  'school-console': 'School Console',
  records: 'Records',
  intelligence: 'Intelligence',
};

const TYPE_LABELS: Record<string, string> = {
  signal_created: 'Signal raised',
  signal_triaged: 'Signal triaged',
  proposal_created: 'Proposal created',
  proposal_approved: 'Proposal approved',
  proposal_rejected: 'Proposal rejected',
  proposal_returned: 'Proposal returned',
  tender_draft_created: 'Tender draft created',
  application_submitted: 'Application submitted',
  application_selected: 'Application selected',
  application_declined: 'Application declined',
  work_authorized: 'Work authorized',
  work_accepted_by_contributor: 'Authorization accepted',
  delivery_submitted: 'Delivery submitted',
  delivery_accepted: 'Delivery accepted',
  delivery_changes_requested: 'Changes requested',
  roll_entry_created: 'Roll entry recorded',
  sbt_attestation_minted: 'SBT attestation minted',
  roll_revision_recorded: 'Roll revision recorded',
};

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Nairobi',
  });
}

function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 8)}…` : id;
}

function eventColor(module: string): string {
  switch (module) {
    case 'commons': return 'var(--state-canon)';
    case 'workbench': return 'var(--state-proposed)';
    case 'school-console': return 'var(--state-caution)';
    case 'records': return 'var(--state-risk)';
    case 'intelligence': return 'var(--state-canon)';
    default: return 'var(--muted)';
  }
}

export function Annals() {
  const [events, setEvents] = useState<AnnalsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterModule, setFilterModule] = useState<string>('all');
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const stream = await buildAnnalsEventStream();
      setEvents(stream);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Annals event stream could not be loaded.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let result = events;
    if (filterModule !== 'all') {
      result = result.filter((e) => e.module === filterModule);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.actor.toLowerCase().includes(q) ||
          e.relatedIds.some((id) => id.toLowerCase().includes(q)) ||
          TYPE_LABELS[e.type]?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [events, filterModule, search]);

  const modules = useMemo(
    () => [...new Set(events.map((e) => e.module))].sort(),
    [events]
  );

  if (loading) {
    return (
      <WorkspaceLayout currentContext="records:annals">
        <div className="annals-page">
          <PageHead eyebrow="Records" title="Annals" subtitle="Chronology of what happened across Commons, Workbench, School Console, and Roll" />
          <div className="annals-loading" role="status">
            <span className="loading-icon mono">···</span> Building event stream…
          </div>
        </div>
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout currentContext="records:annals">
      <div className="annals-page">
        <PageHead
          eyebrow="Records / Annals"
          title="Annals"
          subtitle="One chronological record of what happened — signals, proposals, deliveries, Roll entries, and attestations across the network."
        />

        <div className="annals-controls">
          <label className="annals-filter-label" htmlFor="annals-module-filter">
            Module
          </label>
          <select
            id="annals-module-filter"
            value={filterModule}
            onChange={(e) => setFilterModule(e.currentTarget.value)}
            className="annals-module-select"
          >
            <option value="all">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {MODULE_LABELS[m]}
              </option>
            ))}
          </select>
          <label className="annals-filter-label" htmlFor="annals-search">
            Search
          </label>
          <input
            id="annals-search"
            value={search}
            onInput={(e) => setSearch(e.currentTarget.value)}
            placeholder="Search events, actors, record IDs…"
            className="annals-search-input"
          />
          <span className="annals-count mono dim">
            {filtered.length} event{filtered.length === 1 ? '' : 's'} recorded
          </span>
        </div>

        {error && (
          <div className="annals-error" role="alert">
            <strong>Annals could not load.</strong>
            <p>{error}</p>
          </div>
        )}

        <div className="annals-timeline">
          {filtered.length === 0 ? (
            <div className="annals-empty">
              <span className="annals-empty-mark">—</span>
              <h2 className="annals-empty-title serif">No events yet</h2>
              <p className="annals-empty-sub">
                The chronology appears here when Commons signals, Workbench
                deliveries, Roll entries, and SBT attestations are recorded.
              </p>
            </div>
          ) : (
            <ul className="annals-list" role="list" aria-label="Annals event chronology">
              {filtered.map((event) => (
                <li key={event.id} className="annals-event">
                  <time className="annals-event-time mono dim">{formatDateTime(event.timestamp)}</time>
                  <div className="annals-event-body">
                    <span
                      className="annals-event-module"
                      style={{ color: eventColor(event.module) }}
                    >
                      {MODULE_LABELS[event.module]}
                    </span>
                    <span className="annals-event-type mono dim">{TYPE_LABELS[event.type] ?? event.type}</span>
                    <p className="annals-event-description">{event.description}</p>
                    <div className="annals-event-meta">
                      <span className="annals-event-actor mono dim">by {event.actor}</span>
                      {event.relatedIds.length > 0 && (
                        <span className="annals-event-ids mono dim">
                          {event.relatedIds.map((id) => shortId(id)).join(' · ')}
                        </span>
                      )}
                      {event.evidenceHash && (
                        <span className="annals-event-hash mono dim">anchor {shortId(event.evidenceHash)}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="annals-ontology">
          <span className="annals-ontology-label">Ontology in this view</span>
          <p>
            <strong>One shared chronology.</strong> Events are appended across
            modules — never rewritten. A correction is a new event that links to
            the record it corrects, preserving what came before.
          </p>
          <p>
            <strong>Attribution is structural.</strong> Every event carries who
            acted, when, in which module, and which records it references.
            Attribution is not a reputation score.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
