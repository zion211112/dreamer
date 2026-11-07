import type { CapacityCandidate, CapacitySort } from '../../lib/workbench-capacity';

export interface CapacityCandidateListProps {
  candidates: readonly CapacityCandidate[];
  query: string;
  onQueryChange(query: string): void;
  hasEvidence: boolean;
  onHasEvidenceChange(value: boolean): void;
  within15Km: boolean;
  onWithin15KmChange(value: boolean): void;
  sortBy: CapacitySort;
  onSortChange(value: CapacitySort): void;
  selectedId: string | null;
  shortlistedIds: ReadonlySet<string>;
  onSelect(id: string): void;
  onToggleShortlist(id: string): void;
}

export function CapacityCandidateList({
  candidates,
  query,
  onQueryChange,
  hasEvidence,
  onHasEvidenceChange,
  within15Km,
  onWithin15KmChange,
  sortBy,
  onSortChange,
  selectedId,
  shortlistedIds,
  onSelect,
  onToggleShortlist,
}: CapacityCandidateListProps) {
  return (
    <section aria-label="Capacity candidates" className="capacity-results">
      <header className="capacity-results-heading">
        <div>
          <p className="capacity-kicker">CANDIDATES / ILLUSTRATIVE RECORDS</p>
          <h2>Nearby capacity</h2>
        </div>
        <span className="capacity-result-count" role="status">{candidates.length} results</span>
      </header>

      <div className="capacity-filters">
        <label className="capacity-search">
          <span className="visually-hidden">Search name, location, entity type, or capability</span>
          <input
            onInput={event => onQueryChange(event.currentTarget.value)}
            placeholder="Search candidates"
            type="search"
            value={query}
          />
        </label>
        <label className="capacity-filter-check">
          <input checked={hasEvidence} onChange={event => onHasEvidenceChange(event.currentTarget.checked)} type="checkbox" />
          <span>Evidence attached</span>
        </label>
        <label className="capacity-filter-check">
          <input checked={within15Km} onChange={event => onWithin15KmChange(event.currentTarget.checked)} type="checkbox" />
          <span>Within 15 km</span>
        </label>
        <label className="capacity-sort">
          <span>Sort by</span>
          <select
            onChange={event => onSortChange(event.currentTarget.value === 'capacity' ? 'capacity' : 'distance')}
            value={sortBy}
          >
            <option value="distance">Nearest</option>
            <option value="capacity">Reported capacity</option>
          </select>
        </label>
      </div>

      {candidates.length > 0 ? (
        <ul className="capacity-candidate-list">
          {candidates.map(candidate => {
            const isShortlisted = shortlistedIds.has(candidate.id);
            const evidence = candidate.evidence[0];
            return (
              <li className="capacity-candidate-row" key={candidate.id}>
                <button
                  aria-pressed={selectedId === candidate.id}
                  className="capacity-candidate-open"
                  data-capacity-candidate={candidate.id}
                  onClick={() => onSelect(candidate.id)}
                  type="button"
                >
                  <span className="capacity-candidate-type">{candidate.entityType} · illustrative</span>
                  <strong>{candidate.name}</strong>
                  <span className="capacity-candidate-location">{candidate.location}</span>
                  <span className="capacity-candidate-metrics">
                    <span>{candidate.reportedCapacity} {candidate.capacityUnit}/{candidate.capacityPeriod}</span>
                    <span>Scenario distance · {candidate.distanceKm} km</span>
                  </span>
                  <small className={evidence ? 'capacity-evidence-note' : 'capacity-evidence-note is-gap'}>
                    {evidence
                      ? `${evidence.source} · ${evidence.date} · availability not reported`
                      : 'No evidence attached · availability not reported'}
                  </small>
                </button>
                <button
                  aria-label={`${isShortlisted ? 'Remove' : 'Add'} ${candidate.name} ${isShortlisted ? 'from' : 'to'} work plan shortlist`}
                  aria-pressed={isShortlisted}
                  className={`capacity-shortlist-toggle${isShortlisted ? ' is-selected' : ''}`}
                  onClick={() => onToggleShortlist(candidate.id)}
                  type="button"
                >
                  {isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="capacity-no-results" role="status">
          No candidates match these filters. Clear the search or widen the distance limit.
        </p>
      )}
    </section>
  );
}
