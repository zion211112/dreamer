import { useMemo, useState } from 'preact/hooks';
import {
  filterPeople,
  hasUsefulAvailabilityFilter,
  searchPeople,
  type PeopleDirectoryEntry,
} from '../../lib/people-discovery';
import type { PeopleAvailability } from '../../lib/people-profiles';

interface PeopleDirectoryProps {
  entries: PeopleDirectoryEntry[];
  entityType: 'person' | 'crew';
  query: string;
  selectedId: string | null;
  onQueryChange: (query: string) => void;
  onSelect: (entry: PeopleDirectoryEntry) => void;
}

const availabilityOptions: Array<{ value: PeopleAvailability; label: string }> = [
  { value: 'open-to-enquiries', label: 'Open to enquiries' },
  { value: 'limited-availability', label: 'Limited availability' },
  { value: 'not-taking-work', label: 'Not currently taking work' },
];

function selectedAvailability(value: string): PeopleAvailability | '' {
  return availabilityOptions.find(option => option.value === value)?.value ?? '';
}

export function PeopleDirectory({
  entries,
  entityType,
  query,
  selectedId,
  onQueryChange,
  onSelect,
}: PeopleDirectoryProps) {
  const [capability, setCapability] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [availability, setAvailability] = useState<PeopleAvailability | ''>('');
  const typedEntries = useMemo(
    () => entries.filter(entry => entry.entity.type === entityType),
    [entries, entityType],
  );
  const searchedEntries = searchPeople(typedEntries, query);
  const visibleEntries = filterPeople(searchedEntries, { capability, serviceArea, availability: availability || undefined });
  const canFilterAvailability = hasUsefulAvailabilityFilter(typedEntries);
  const capabilities = [...new Set(typedEntries.flatMap(entry => entry.claims.map(claim => claim.name)))].sort();
  const serviceAreas = [...new Set(typedEntries.flatMap(entry => entry.serviceAreas))].sort();
  const hasFilters = Boolean(capability || serviceArea || availability || query);

  const clearFilters = () => {
    setCapability('');
    setServiceArea('');
    setAvailability('');
    onQueryChange('');
  };

  return (
    <section className="people-directory" aria-label={`${entityType === 'person' ? 'People' : 'Crews'} directory`}>
      <div className="people-directory-controls">
        <label className="people-directory-search">
          <span className="people-directory-search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            value={query}
            onInput={event => onQueryChange(event.currentTarget.value)}
            placeholder={`Search ${entityType === 'person' ? 'people' : 'crews'} by capability, service, or area`}
            aria-label={`Search ${entityType === 'person' ? 'people' : 'crews'}`}
          />
          {query && (
            <button type="button" onClick={() => onQueryChange('')} aria-label="Clear search">×</button>
          )}
        </label>
        <div className="people-directory-filters" aria-label="Directory filters">
          <label>
            <span>Capability</span>
            <select value={capability} onChange={event => setCapability(event.currentTarget.value)}>
              <option value="">All capabilities</option>
              {capabilities.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Service area</span>
            <select value={serviceArea} onChange={event => setServiceArea(event.currentTarget.value)}>
              <option value="">All areas</option>
              {serviceAreas.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          {canFilterAvailability && (
            <label>
              <span>Availability</span>
              <select value={availability} onChange={event => setAvailability(selectedAvailability(event.currentTarget.value))}>
                <option value="">Any stated availability</option>
                {availabilityOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
          )}
          {hasFilters && (
            <button className="people-directory-reset" type="button" onClick={clearFilters}>Clear</button>
          )}
        </div>
      </div>

      <div className="people-directory-summary" aria-live="polite">
        <span>{visibleEntries.length} {visibleEntries.length === 1 ? 'result' : 'results'}</span>
        <span>{entityType === 'person' ? 'Individual practice' : 'Collective capacity'}</span>
      </div>
      {visibleEntries.length ? (
        <ul className="people-directory-list">
          {visibleEntries.map(entry => (
            <li key={entry.entity.id}>
              <button
                type="button"
                className={`people-directory-row${entry.entity.id === selectedId ? ' is-selected' : ''}`}
                aria-pressed={entry.entity.id === selectedId}
                onClick={() => onSelect(entry)}
              >
                <span className={`people-type-mark people-type-mark--${entry.entity.type}`} aria-hidden="true" />
                <span className="people-directory-main">
                  <span className="people-directory-identity">
                    <strong>{entry.entity.name}</strong>
                    <small>{entityType === 'person' ? 'Person' : 'Crew'}</small>
                  </span>
                  <span className="people-directory-role">{entry.entity.role}</span>
                  <span className="people-directory-capabilities">
                    {entry.claims.slice(0, 3).map(claim => <span key={claim.id}>{claim.name}</span>)}
                    {entry.claims.length > 3 && <span>+{entry.claims.length - 3}</span>}
                    {entry.offers[0] && <span>{entry.offers[0].title}</span>}
                  </span>
                  <span className="people-directory-context">
                    {entry.serviceAreas[0] && <span>{entry.serviceAreas[0]}</span>}
                    {entry.availability !== 'not-stated' && (
                      <span>{availabilityOptions.find(option => option.value === entry.availability)?.label}</span>
                    )}
                    {entry.relatedWork[0] && <span>Work · {entry.relatedWork[0]}</span>}
                  </span>
                </span>
                <span className="people-directory-open" aria-hidden="true">→</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="people-directory-empty">
          {typedEntries.length ? 'No records match these search terms and filters.' : `No ${entityType === 'person' ? 'people' : 'crews'} are in this record.`}
        </p>
      )}
    </section>
  );
}
