'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowUpRight, BriefcaseBusiness, MapPin, Search } from 'lucide-react';

export type InstitutionCardData = {
  id: string;
  name: string;
  kind: 'school' | 'hospital' | 'startup' | 'community' | 'builder';
  location: string;
  summary: string | null;
  opportunityCount: number | null;
  fundingSlug: string | null;
};

const kindLabels: Record<InstitutionCardData['kind'], string> = {
  school: 'School',
  hospital: 'Hospital',
  startup: 'Startup',
  community: 'Community',
  builder: 'Builder',
};

const filters: Array<'all' | InstitutionCardData['kind']> = [
  'all',
  'school',
  'hospital',
  'startup',
  'community',
  'builder',
];

export function InstitutionDirectory({
  institutions,
  configured,
  loadError,
  dataWarning,
}: {
  institutions: InstitutionCardData[];
  configured: boolean;
  loadError: string | null;
  dataWarning?: string | null;
}) {
  const [kind, setKind] = useState<typeof filters[number]>('all');
  const [query, setQuery] = useState('');
  const results = useMemo(() => institutions.filter(institution =>
    (kind === 'all' || institution.kind === kind) &&
    `${institution.name} ${institution.location} ${institution.summary ?? ''}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase())
  ), [institutions, kind, query]);

  if (loadError) {
    return <div className="institution-directory-state" role="alert">
      <p className="eyebrow">DIRECTORY UNAVAILABLE</p>
      <h2>Published profiles could not be loaded.</h2>
      <p>{loadError}</p>
    </div>;
  }

  if (!configured) {
    return <div className="institution-directory-state">
      <p className="eyebrow">NETWORK NOT CONNECTED</p>
      <h2>No live institution directory is available.</h2>
      <p>Connect the institution directory service to browse published profiles. Examples are not shown as live institutions.</p>
    </div>;
  }

  return (
    <div className="institution-directory">
      {dataWarning && <p className="institution-data-warning" role="alert">Some linked work details are unavailable: {dataWarning}</p>}
      <div className="institution-controls">
        <div aria-label="Filter by institution type" className="institution-filters" role="group">
          {filters.map(filter => (
            <button
              aria-pressed={kind === filter}
              className={`institution-filter ${kind === filter ? 'is-selected' : ''}`}
              key={filter}
              onClick={() => setKind(filter)}
              type="button"
            >{filter === 'all' ? 'All institutions' : kindLabels[filter]}</button>
          ))}
        </div>
        <label className="institution-search">
          <Search aria-hidden="true" size={15} />
          <input
            aria-label="Search institutions"
            onChange={event => setQuery(event.target.value)}
            placeholder="Search name or place"
            value={query}
          />
        </label>
      </div>
      <p aria-live="polite" className="institution-count">
        {results.length.toString().padStart(2, '0')} published {results.length === 1 ? 'institution' : 'institutions'}
      </p>
      {results.length ? (
        <div className="institution-list">
          {results.map(institution => (
            <article
              aria-labelledby={`institution-${institution.id}`}
              className="institution-row"
              key={institution.id}
            >
              <div className="institution-identity">
                <p className="eyebrow">{kindLabels[institution.kind]}</p>
                <h2 id={`institution-${institution.id}`}>{institution.name}</h2>
                {institution.location && <p className="institution-location"><MapPin aria-hidden="true" size={13} />{institution.location}</p>}
                {institution.summary && <p className="institution-summary">{institution.summary}</p>}
              </div>
              <div className="institution-signals">
                {institution.opportunityCount !== null && institution.opportunityCount > 0 && (
                  <span><BriefcaseBusiness aria-hidden="true" size={13} />{institution.opportunityCount} open {institution.opportunityCount === 1 ? 'role' : 'roles'}</span>
                )}
                {institution.fundingSlug && <span>Funding enquiry available</span>}
              </div>
              <div className="institution-actions">
                {institution.opportunityCount !== null && institution.opportunityCount > 0 && (
                  <Link href={`/commons/opportunities?institution=${encodeURIComponent(institution.id)}`}>
                    Find work <ArrowUpRight aria-hidden="true" size={14} />
                  </Link>
                )}
                {institution.fundingSlug && (
                  <Link href={`/tenders/${encodeURIComponent(institution.fundingSlug)}#capital-intent`}>
                    Discuss funding <ArrowUpRight aria-hidden="true" size={14} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="institution-directory-state">
          <p className="eyebrow">{institutions.length ? 'NO MATCHES' : 'NO PUBLISHED PROFILES'}</p>
          <h2>{institutions.length ? 'No institution matches those filters.' : 'No institution profile is published yet.'}</h2>
          <p>{institutions.length ? 'Try another name, place, or institution type.' : 'Only profiles published by an active institution principal appear here.'}</p>
        </div>
      )}
    </div>
  );
}
