import type { FieldSignal, SignalStatus } from '../../../lib/local-workflows';

function formatSignalDate(value: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

function signalPlace(signal: FieldSignal): string {
  const assetName = signal.assetName?.trim();
  return assetName && !assetName.toLocaleLowerCase().startsWith(signal.institutionName.toLocaleLowerCase())
    ? assetName
    : signal.institutionName;
}

function signalCategory(signal: FieldSignal): string {
  const title = signal.title.toLocaleLowerCase();
  if (title.includes('crossing') || title.includes('road') || title.includes('drainage')) return 'Access';
  if (title.includes('power') || title.includes('solar') || title.includes('microgrid')) return 'Energy';
  if (title.includes('cold-room') || title.includes('temperature') || title.includes('equipment')) return 'Equipment';
  return 'Ground';
}

const statusLabels: Record<SignalStatus, string> = {
  new: 'New',
  triaged: 'Being checked',
  brief: 'Work planning',
  resolved: 'Closed',
};

interface PaginatedSignals {
  items: FieldSignal[];
  page: number;
  pageCount: number;
  total: number;
}

interface CommonsSignalQueueProps {
  search: string;
  setSearch: (q: string) => void;
  filter: SignalStatus | 'all';
  setFilter: (f: SignalStatus | 'all') => void;
  institutionScope: string;
  setInstitutionScope: (id: string) => void;
  loaded: boolean;
  paginatedSignals: PaginatedSignals;
  selected: FieldSignal | null;
  setSelectedId: (id: string) => void;
  featuredPossibility: FieldSignal | undefined;
  setCommonsView: (view: 'signals' | 'opportunities' | 'decisions') => void;
  setSignalPage: (p: number | ((prev: number) => number)) => void;
}

export function CommonsSignalQueue({
  search,
  setSearch,
  setSignalPage,
  filter,
  setFilter,
  institutionScope,
  setInstitutionScope,
  loaded,
  paginatedSignals,
  selected,
  setSelectedId,
  featuredPossibility,
  setCommonsView,
}: CommonsSignalQueueProps) {
  const { items, page, pageCount, total } = paginatedSignals;

  return (
    <aside className="signal-queue">
      <div className="commons-signal-tools">
        <label className="signal-search">
          <span aria-hidden="true">⌕</span>
          <input aria-label="Search signals" onInput={event => {
            setSearch((event.currentTarget as HTMLInputElement).value);
            setSignalPage(0);
          }} placeholder="Find a signal" value={search} />
        </label>
        <details className="commons-signal-filter">
          <summary>{filter === 'all' ? 'Filter' : statusLabels[filter]}</summary>
          <div aria-label="Filter signals by status" className="signal-filters" role="group">
            {(['all', 'new', 'triaged', 'brief', 'resolved'] as const).map(item => (
              <button
                aria-pressed={filter === item}
                className={filter === item ? 'is-active' : ''}
                key={item}
                onClick={event => {
                  setFilter(item);
                  setSignalPage(0);
                  (event.currentTarget as HTMLButtonElement).closest('details')?.removeAttribute('open');
                }}
                type="button"
              >
                {item === 'all' ? 'All' : statusLabels[item]}
              </button>
            ))}
          </div>
        </details>
      </div>
      <div className="signal-list">
        {items.map(signal => (
          <button
            aria-current={selected?.id === signal.id ? 'true' : undefined}
            className={`signal-list-item${selected?.id === signal.id ? ' is-selected' : ''}`}
            key={signal.id}
            onClick={() => {
              setSelectedId(signal.id);
            }}
            type="button"
          >
            <span className={`signal-status-mark signal-status-${signal.status}`} />
            <span className="signal-list-copy">
              <small className="commons-signal-meta">{signalCategory(signal)} · {signal.scenario ? 'Example signal' : formatSignalDate(signal.updatedAt)}</small>
              <strong>{signal.title}</strong>
              <small>{signalPlace(signal)}</small>
            </span>
            <span className="signal-list-date" aria-hidden="true"></span>
          </button>
        ))}
        {loaded && items.length === 0 && (
          <p className="signal-list-empty">
            {search.trim() || filter !== 'all' || institutionScope
              ? 'No signals match this view.'
              : 'No signals here yet.'}
          </p>
        )}
      </div>
      {pageCount > 0 && (
        <nav className="radar-pagination" aria-label="Signal pages">
          <span aria-live="polite">
            Showing {page * 12 + 1}–{page * 12 + items.length} of {total} local matches
          </span>
          <div>
            <button
              aria-label="Previous signal page"
              disabled={page === 0}
              onClick={() => setSignalPage(p => Math.max(0, p - 1))}
              type="button"
            >
              Previous
            </button>
            <span>Page {page + 1} of {pageCount}</span>
            <button
              aria-label="Next signal page"
              disabled={page >= pageCount - 1}
              onClick={() => setSignalPage(p => Math.min(pageCount - 1, p + 1))}
              type="button"
            >
              Next
            </button>
          </div>
        </nav>
      )}
      {featuredPossibility && (
        <section className="commons-featured-opportunity">
          <p className="eyebrow">Possibility · example signal</p>
          <h3>{featuredPossibility.title}</h3>
          <p>{signalPlace(featuredPossibility)}</p>
          <button
            onClick={() => {
              setCommonsView('signals');
              setSelectedId(featuredPossibility.id);
              setInstitutionScope('');
              setSearch('');
              setFilter('all');
              setSignalPage(0);
            }}
            type="button"
          >
            Review signal
          </button>
          <small>Illustrative · not verified</small>
        </section>
      )}
    </aside>
  );
}
