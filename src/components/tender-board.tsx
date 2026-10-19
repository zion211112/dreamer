'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { TenderCard } from '@/components/tender-card';
import { categoryLabels } from '@/lib/tender-data';
import type { Tender, TenderCategory } from '@/lib/tender';

const filters: Array<'all' | TenderCategory> = ['all', 'education', 'energy', 'agriculture', 'media', 'software'];

export function TenderBoard({ tenders, guest = false }: { tenders: Tender[]; guest?: boolean }) {
  const [category, setCategory] = useState<typeof filters[number]>('all');
  const [query, setQuery] = useState('');
  const results = useMemo(() => tenders.filter(tender =>
    (category === 'all' || tender.category === category) &&
    `${tender.assetName} ${tender.summary} ${tender.location} ${tender.issuer}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  ), [category, query, tenders]);

  return (
    <>
      <div className="board-controls">
        <div aria-label="Filter by Tender category" className="filter-list" role="group">
          {filters.map(filter => (
            <button
              aria-pressed={category === filter}
              className={`filter-chip ${category === filter ? 'selected' : ''}`}
              key={filter}
              onClick={() => setCategory(filter)}
              type="button"
            >{filter === 'all' ? 'All builds' : categoryLabels[filter]}</button>
          ))}
        </div>
        <label className="board-search">
          <Search aria-hidden="true" size={15} />
          <input aria-label="Search Tenders" onChange={event => setQuery(event.target.value)} placeholder="Search by build, issuer or place" value={query} />
        </label>
      </div>
      <p aria-live="polite" className="board-count">{results.length.toString().padStart(2, '0')} open calls <span>·</span> All quotes shown in their listed currency</p>
      {results.length > 0
        ? <div className="board-grid">{results.map(tender => <TenderCard guest={guest} key={tender.id} tender={tender} />)}</div>
        : <div className="empty-state"><p className="eyebrow">No matching Tender</p><h2>Try a broader search.</h2><p>Nothing was hidden or removed from the market.</p></div>}
    </>
  );
}
