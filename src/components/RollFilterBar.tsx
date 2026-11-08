import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import type { RefObject } from 'preact';

export interface RollFilters {
  query?: string;
  undertakingType?: string[];
  institutionId?: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  hasHash?: boolean;
}

interface RollFilterBarProps {
  filters: RollFilters;
  onChange: (filters: RollFilters) => void;
  availableUndertakingTypes: string[];
  availableInstitutions: string[];
}

const UNDERTAKING_TYPES = [
  { value: 'physical', label: 'Physical' },
  { value: 'digital', label: 'Digital' },
  { value: 'creative', label: 'Creative' },
  { value: 'hybrid', label: 'Hybrid' },
];

const STATUS_OPTIONS = [
  { value: 'sealed', label: 'Sealed' },
  { value: 'draft', label: 'Draft' },
];

function debounce<T extends (value: string) => void>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((value: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(value), ms);
  }) as T;
}

export function RollFilterBar({
  filters,
  onChange,
  availableUndertakingTypes,
  availableInstitutions,
}: RollFilterBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [undertakingSearch, setUndertakingSearch] = useState('');
  const [showUndertakingDropdown, setShowUndertakingDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedSearchChange = useCallback(
    debounce((value: string) => {
      onChange({ ...filters, query: value });
    }, 250),
    [filters, onChange]
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUndertakingDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    debouncedSearchChange(value);
  };

  const handleUndertakingToggle = (type: string) => {
    const current = filters.undertakingType || [];
    const next = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    onChange({ ...filters, undertakingType: next });
  };

  const handleInstitutionToggle = (id: string) => {
    const current = filters.institutionId || [];
    const next = current.includes(id)
      ? current.filter(i => i !== id)
      : [...current, id];
    onChange({ ...filters, institutionId: next });
  };

  const handleStatusToggle = (status: string) => {
    const current = filters.status || [];
    const next = current.includes(status)
      ? current.filter(s => s !== status)
      : [...current, status];
    onChange({ ...filters, status: next });
  };

  const handleDateFromChange = (value: string) => {
    onChange({ ...filters, dateFrom: value || undefined });
  };

  const handleDateToChange = (value: string) => {
    onChange({ ...filters, dateTo: value || undefined });
  };

  const handleHashToggle = () => {
    onChange({ ...filters, hasHash: !filters.hasHash });
  };

  const handleClearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Boolean(
    filters.query ||
    (filters.undertakingType && filters.undertakingType.length > 0) ||
    (filters.institutionId && filters.institutionId.length > 0) ||
    (filters.status && filters.status.length > 0) ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.hasHash
  );

  const filteredTypes = availableUndertakingTypes.filter(t =>
    t.toLowerCase().includes(undertakingSearch.toLowerCase())
  );

  if (isMobile) {
    return (
      <>
        <button
          className="roll-filter-toggle"
          onClick={() => setDrawerOpen(true)}
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="roll-filter-drawer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
            <path d="M19 6l-7 7-7-7"/>
          </svg>
          Filters{hasActiveFilters && ` (${[
            filters.undertakingType?.length,
            filters.institutionId?.length,
            filters.status?.length,
            filters.dateFrom ? 1 : 0,
            filters.dateTo ? 1 : 0,
            filters.hasHash ? 1 : 0,
          ].filter(Boolean).length})`}
        </button>

        <div
          id="roll-filter-drawer"
          className={`roll-filter-drawer ${drawerOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="roll-filter-drawer-title"
        >
          <div className="roll-filter-drawer-header">
            <h2 id="roll-filter-drawer-title" className="roll-filter-drawer-title">Filters</h2>
            <button
              className="roll-filter-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              type="button"
            >×</button>
          </div>
          <RollFilterBarContent
            filters={filters}
            availableInstitutions={availableInstitutions}
            undertakingSearch={undertakingSearch}
            setUndertakingSearch={setUndertakingSearch}
            showUndertakingDropdown={showUndertakingDropdown}
            setShowUndertakingDropdown={setShowUndertakingDropdown}
            dropdownRef={dropdownRef}
            filteredTypes={filteredTypes}
            handleSearchChange={handleSearchChange}
            handleUndertakingToggle={handleUndertakingToggle}
            handleInstitutionToggle={handleInstitutionToggle}
            handleStatusToggle={handleStatusToggle}
            handleDateFromChange={handleDateFromChange}
            handleDateToChange={handleDateToChange}
            handleHashToggle={handleHashToggle}
            handleClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </>
    );
  }

  return (
    <RollFilterBarContent
      filters={filters}
      availableInstitutions={availableInstitutions}
      undertakingSearch={undertakingSearch}
      setUndertakingSearch={setUndertakingSearch}
      showUndertakingDropdown={showUndertakingDropdown}
      setShowUndertakingDropdown={setShowUndertakingDropdown}
      dropdownRef={dropdownRef}
      filteredTypes={filteredTypes}
      handleSearchChange={handleSearchChange}
      handleUndertakingToggle={handleUndertakingToggle}
      handleInstitutionToggle={handleInstitutionToggle}
      handleStatusToggle={handleStatusToggle}
      handleDateFromChange={handleDateFromChange}
      handleDateToChange={handleDateToChange}
      handleHashToggle={handleHashToggle}
      handleClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
}

function RollFilterBarContent({
  filters,
  availableInstitutions,
  undertakingSearch,
  setUndertakingSearch,
  showUndertakingDropdown,
  setShowUndertakingDropdown,
  dropdownRef,
  filteredTypes,
  handleSearchChange,
  handleUndertakingToggle,
  handleInstitutionToggle,
  handleStatusToggle,
  handleDateFromChange,
  handleDateToChange,
  handleHashToggle,
  handleClearFilters,
  hasActiveFilters,
}: {
  filters: RollFilters;
  availableInstitutions: string[];
  undertakingSearch: string;
  setUndertakingSearch: (v: string) => void;
  showUndertakingDropdown: boolean;
  setShowUndertakingDropdown: (v: boolean) => void;
  dropdownRef: RefObject<HTMLDivElement>;
  filteredTypes: string[];
  handleSearchChange: (v: string) => void;
  handleUndertakingToggle: (t: string) => void;
  handleInstitutionToggle: (i: string) => void;
  handleStatusToggle: (s: string) => void;
  handleDateFromChange: (v: string) => void;
  handleDateToChange: (v: string) => void;
  handleHashToggle: () => void;
  handleClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="roll-filter-bar" ref={dropdownRef}>
      <div className="roll-filter-group flex-1">
        <label className="roll-filter-label" htmlFor="roll-search">Search</label>
        <input
          id="roll-search"
          type="search"
          className="roll-filter-input"
          placeholder="Undertaking, institution, hash..."
          value={filters.query || ''}
          onChange={(e: Event) => handleSearchChange((e.target as HTMLInputElement).value)}
          onFocus={() => setShowUndertakingDropdown(false)}
        />
      </div>

      <div className="roll-filter-group">
        <label className="roll-filter-label" htmlFor="roll-undertaking">Type</label>
        <div className="roll-filter-input" style={{ cursor: 'text' }}>
          <input
            id="roll-undertaking"
            type="text"
            className="roll-filter-input"
            style={{ border: 'none', background: 'transparent', padding: 0, minHeight: 'auto', boxShadow: 'none', outline: 'none' }}
            placeholder={filters.undertakingType && filters.undertakingType.length > 0
              ? `${filters.undertakingType.length} selected`
              : 'Select types...'}
            readOnly
            onClick={() => setShowUndertakingDropdown(true)}
            onChange={(e: Event) => setUndertakingSearch((e.target as HTMLInputElement).value)}
            value={undertakingSearch}
          />
        </div>
        {showUndertakingDropdown && (
          <div className="roll-type-chips" style={{ maxHeight: '200px', overflow: 'auto', marginTop: '8px', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--roll-radius-tight)', background: 'var(--bg)' }}>
            {UNDERTAKING_TYPES.map(opt => (
              <label
                key={opt.value}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: 'var(--roll-radius-tight)' }}
              >
                <input
                  type="checkbox"
                  checked={filters.undertakingType?.includes(opt.value)}
                  onChange={() => handleUndertakingToggle(opt.value)}
                  style={{ width: '14px', height: '14px', accentColor: `var(--roll-${opt.value})` }}
                />
                <span style={{
                  fontSize: 'var(--roll-text-xs)',
                  color: 'var(--net-ink)',
                  fontWeight: 500,
                  textTransform: 'capitalize'
                }}>{opt.label}</span>
              </label>
            ))}
            {filteredTypes.length === 0 && (
              <span style={{ color: 'var(--net-ink-faint)', fontSize: 'var(--roll-text-sm)' }}>No types match</span>
            )}
          </div>
        )}
      </div>

      <div className="roll-filter-group" style={{ minWidth: '160px' }}>
        <label className="roll-filter-label" htmlFor="roll-institution">Institution</label>
        <select
          id="roll-institution"
          className="roll-filter-select"
          value={filters.institutionId?.[0] || ''}
          onChange={(e: Event) => handleInstitutionToggle((e.target as HTMLSelectElement).value)}
        >
          <option value="">All institutions</option>
          {availableInstitutions.map(inst => (
            <option key={inst} value={inst}>{inst}</option>
          ))}
        </select>
      </div>

      <div className="roll-filter-group">
        <label className="roll-filter-label">Status</label>
        <div className="roll-status-chips">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="roll-status-chip"
              data-status={opt.value}
              aria-pressed={filters.status?.includes(opt.value) || false}
              onClick={() => handleStatusToggle(opt.value)}
              type="button"
            >
              <span className="status-dot" aria-hidden="true" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="roll-filter-group" style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="roll-filter-label" htmlFor="roll-date-from">From</label>
          <input
            id="roll-date-from"
            type="date"
            className="roll-filter-input"
            value={filters.dateFrom || ''}
            onChange={(e: Event) => handleDateFromChange((e.target as HTMLInputElement).value)}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label className="roll-filter-label" htmlFor="roll-date-to">To</label>
          <input
            id="roll-date-to"
            type="date"
            className="roll-filter-input"
            value={filters.dateTo || ''}
            onChange={(e: Event) => handleDateToChange((e.target as HTMLInputElement).value)}
          />
        </div>
      </div>

      <div className="roll-filter-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
        <label className="roll-filter-checkbox">
          <input
            type="checkbox"
            checked={filters.hasHash || false}
            onChange={handleHashToggle}
            style={{ width: '16px', height: '16px', accentColor: 'var(--net-basis-counterparty)' }}
          />
          <span style={{ fontSize: 'var(--roll-text-sm)', color: 'var(--net-ink)' }}>Has hash anchor</span>
        </label>
      </div>

      {hasActiveFilters && (
        <button
          className="roll-filter-clear"
          onClick={handleClearFilters}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
          Clear
        </button>
      )}
    </div>
  );
}