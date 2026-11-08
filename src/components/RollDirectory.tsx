import { useState, useEffect, useCallback } from 'preact/hooks';
import { RollViewToggle } from './RollViewToggle';
import { RollFilterBar, type RollFilters } from './RollFilterBar';
import { RollEntryCard } from './RollEntryCard';
import { RollEntryRow } from './RollEntryRow';
import type { RollEntry, RollQueryFilters, UndertakingType } from '../lib/db/roll';
import { queryRollEntries } from '../lib/db/roll';

type ViewMode = 'card' | 'table';

interface RollDirectoryProps {
  initialEntries?: RollEntry[];
  onEntryAction?: (entry: RollEntry, action: string) => void;
}

export function RollDirectory({ initialEntries = [], onEntryAction }: RollDirectoryProps) {
  const [entries, setEntries] = useState<RollEntry[]>(initialEntries);
  const [filteredEntries, setFilteredEntries] = useState<RollEntry[]>(initialEntries);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('rollViewMode') as ViewMode) || 'card';
    }
    return 'card';
  });
  const [filters, setFilters] = useState<RollFilters>({});

  useEffect(() => {
    const saved = localStorage.getItem('rollViewMode') as ViewMode | null;
    if (saved) setViewMode(saved);
  }, []);

  useEffect(() => {
    if (entries.length === 0 && !loadError) {
      loadData();
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [entries, filters]);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const dbFilters: RollQueryFilters = {};
      if (filters.undertakingType?.length) {
        dbFilters.undertaking_type = filters.undertakingType[0] as UndertakingType;
      }
      if (filters.institutionId?.length) {
        dbFilters.institution_id = filters.institutionId[0];
      }
      if (filters.dateFrom) {
        dbFilters.from_date = filters.dateFrom;
      }
      if (filters.dateTo) {
        dbFilters.to_date = filters.dateTo;
      }
      const data = await queryRollEntries(dbFilters);
      setEntries(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load Roll entries';
      console.error('Failed to load roll entries:', error);
      setLoadError(message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...entries];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.commissioned_by.name.toLowerCase().includes(q) ||
        e.hash_anchor?.toLowerCase().includes(q) ||
        e.participants.some(p => p.name.toLowerCase().includes(q))
      );
    }

    if (filters.undertakingType?.length) {
      result = result.filter(e => filters.undertakingType!.includes(e.undertaking_type));
    }

    if (filters.institutionId?.length) {
      result = result.filter(e => filters.institutionId!.includes(e.commissioned_by.institution_id));
    }

    if (filters.status?.length) {
      result = result.filter(e => {
        if (filters.status!.includes('sealed')) return !!e.acceptance.accepted_by;
        if (filters.status!.includes('draft')) return !e.acceptance.accepted_by;
        return true;
      });
    }

    if (filters.dateFrom) {
      result = result.filter(e => e.recorded_at >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      result = result.filter(e => e.recorded_at <= filters.dateTo!);
    }

    if (filters.hasHash) {
      result = result.filter(e => e.hash_anchor);
    }

    setFilteredEntries(result);
  };

  const handleFilterChange = useCallback((newFilters: RollFilters) => {
    setFilters(newFilters);
  }, []);

  const handleEntryAction = useCallback((entry: RollEntry, action: string) => {
    onEntryAction?.(entry, action);
  }, [onEntryAction]);

  const handleRetry = () => {
    loadData();
  };

  const columns: Array<'type' | 'status' | 'evidence' | 'participants' | 'hash' | 'date' | 'actions'> = ['type', 'status', 'evidence', 'participants', 'hash', 'date', 'actions'];

  if (loading && entries.length === 0) {
    return (
      <div className="roll-directory-loading" aria-busy="true" aria-label="Loading Roll entries">
        <div className="roll-skeleton-card" />
        <div className="roll-skeleton-card" />
        <div className="roll-skeleton-card" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="roll-error-state" role="alert">
        <svg className="roll-error-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <h3 className="roll-error-title">Could not load Roll entries</h3>
        <p className="roll-error-message">{loadError}</p>
        <button className="roll-retry-button" onClick={handleRetry} type="button">
          Try again
        </button>
      </div>
    );
  }

  if (filteredEntries.length === 0 && !loading) {
    return (
      <div className="roll-empty-state" role="status">
        <svg className="roll-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
          <path d="M4 16.5V3.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5z" />
          <path d="M5.5 9h9M5.5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <h3 className="roll-empty-title">No Roll entries found</h3>
        <p className="roll-empty-message">
          {entries.length === 0
            ? 'No Roll entries have been recorded in this ledger yet.'
            : 'Try adjusting your filters or search terms.'}
        </p>
      </div>
    );
  }

  return (
    <div className="roll-directory">
      <RollFilterBar
        filters={filters}
        onChange={handleFilterChange}
        availableUndertakingTypes={['physical', 'digital', 'creative', 'hybrid']}
        availableInstitutions={Array.from(new Set(entries.map(e => e.commissioned_by.name)))}
      />

      <div className="roll-directory-toolbar">
        <p className="roll-results-count">
          <strong>{filteredEntries.length}</strong> of {entries.length} records
        </p>
        <RollViewToggle
          mode={viewMode}
          onChange={setViewMode}
          cardCount={filteredEntries.length}
          tableCount={filteredEntries.length}
        />
      </div>

      {viewMode === 'card' ? (
        <section className="roll-card-grid" aria-label="Roll entries">
          {filteredEntries.map(entry => (
            <RollEntryCard
              key={entry.id}
              entry={entry}
              onAction={(action) => handleEntryAction(entry, action)}
            />
          ))}
        </section>
      ) : (
        <div className="roll-table-container" role="region" aria-label="Roll entries table" tabIndex={0}>
          <table className="roll-table">
            <thead>
              <tr>
                <th>Undertaking</th>
                <th>Type</th>
                <th>Status</th>
                <th>Evidence</th>
                <th>Participants</th>
                <th>Hash Anchor</th>
                <th>Recorded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map(entry => (
                <RollEntryRow
                  key={entry.id}
                  entry={entry}
                  onSelect={() => handleEntryAction(entry, 'view')}
                  onAction={(action) => handleEntryAction(entry, action)}
                  columns={columns}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}