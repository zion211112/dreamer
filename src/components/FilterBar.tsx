import { useState, useRef, useEffect, useCallback } from 'preact/hooks';
import type { RefObject } from 'preact';
import type { SearchFilters, Capability } from '../lib/db/network';

interface FilterBarProps {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  availableCapabilities: string[];
  availableCategories: string[];
  availableLocations: string[];
}

const BASIS_OPTIONS: Array<{ value: Capability['basis']; label: string }> = [
  { value: 'declared', label: 'Declared' },
  { value: 'supported', label: 'Supported' },
  { value: 'counterparty_confirmed', label: 'Counterparty' },
  { value: 'independently_verified', label: 'Independent' },
];

const AVAILABILITY_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'now', label: 'Available now' },
  { value: 'this_week', label: 'This week' },
  { value: 'next_2_weeks', label: 'Next 2 weeks' },
];

function debounce<T extends (value: string) => void>(fn: T, ms: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((value: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(value), ms);
  }) as T;
}

export function FilterBar({
  filters,
  onChange,
  availableCapabilities,
  availableCategories,
  availableLocations,
}: FilterBarProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [capabilitySearch, setCapabilitySearch] = useState('');
  const [showCapabilityDropdown, setShowCapabilityDropdown] = useState(false);
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
        setShowCapabilityDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (value: string) => {
    debouncedSearchChange(value);
  };

  const handleCapabilityToggle = (capability: string) => {
    const current = filters.capabilities || [];
    const next = current.includes(capability)
      ? current.filter(c => c !== capability)
      : [...current, capability];
    onChange({ ...filters, capabilities: next });
  };

  const handleBasisToggle = (basis: Capability['basis']) => {
    const current = filters.basis || [];
    const next = current.includes(basis)
      ? current.filter(b => b !== basis)
      : [...current, basis];
    onChange({ ...filters, basis: next });
  };

  const handleLocationChange = (value: string) => {
    onChange({ ...filters, location: value || undefined });
  };

  const handleAvailabilityChange = (value: string) => {
    onChange({ ...filters, availability: value || undefined });
  };

  const handleClearFilters = () => {
    onChange({});
  };

  const hasActiveFilters = Boolean(
    filters.query ||
    (filters.capabilities && filters.capabilities.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.basis && filters.basis.length > 0) ||
    filters.location ||
    filters.availability
  );

  const filteredCapabilities = availableCapabilities.filter(c =>
    c.toLowerCase().includes(capabilitySearch.toLowerCase())
  );

  const groupedCapabilities = availableCategories.reduce((acc, cat) => {
    const caps = filteredCapabilities.filter(c => c.startsWith(`${cat}:`));
    if (caps.length > 0) acc[cat] = caps;
    return acc;
  }, {} as Record<string, string[]>);

  if (isMobile) {
    return (
      <>
        <button
          className="net-filter-toggle"
          onClick={() => setDrawerOpen(true)}
          type="button"
          aria-expanded={drawerOpen}
          aria-controls="net-filter-drawer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
            <path d="M19 6l-7 7-7-7"/>
          </svg>
          Filters{hasActiveFilters && ` (${[
            filters.capabilities?.length,
            filters.categories?.length,
            filters.basis?.length,
            filters.location ? 1 : 0,
            filters.availability ? 1 : 0,
          ].filter(Boolean).length})`}
        </button>

        <div
          id="net-filter-drawer"
          className={`net-filter-drawer ${drawerOpen ? 'open' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="net-filter-drawer-title"
        >
          <div className="net-filter-drawer-header">
            <h2 id="net-filter-drawer-title" className="net-filter-drawer-title">Filters</h2>
            <button
              className="net-filter-drawer-close"
              onClick={() => setDrawerOpen(false)}
              aria-label="Close filters"
              type="button"
            >×</button>
          </div>
          <FilterBarContent
            filters={filters}
            availableLocations={availableLocations}
            capabilitySearch={capabilitySearch}
            setCapabilitySearch={setCapabilitySearch}
            showCapabilityDropdown={showCapabilityDropdown}
            setShowCapabilityDropdown={setShowCapabilityDropdown}
            dropdownRef={dropdownRef}
            groupedCapabilities={groupedCapabilities}
            handleSearchChange={handleSearchChange}
            handleCapabilityToggle={handleCapabilityToggle}
            handleBasisToggle={handleBasisToggle}
            handleLocationChange={handleLocationChange}
            handleAvailabilityChange={handleAvailabilityChange}
            handleClearFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </>
    );
  }

  return (
    <FilterBarContent
      filters={filters}
      availableLocations={availableLocations}
      capabilitySearch={capabilitySearch}
      setCapabilitySearch={setCapabilitySearch}
      showCapabilityDropdown={showCapabilityDropdown}
      setShowCapabilityDropdown={setShowCapabilityDropdown}
      dropdownRef={dropdownRef}
      groupedCapabilities={groupedCapabilities}
      handleSearchChange={handleSearchChange}
      handleCapabilityToggle={handleCapabilityToggle}
      handleBasisToggle={handleBasisToggle}
      handleLocationChange={handleLocationChange}
      handleAvailabilityChange={handleAvailabilityChange}
      handleClearFilters={handleClearFilters}
      hasActiveFilters={hasActiveFilters}
    />
  );
}

function FilterBarContent({
  filters,
  availableLocations,
  capabilitySearch,
  setCapabilitySearch,
  showCapabilityDropdown,
  setShowCapabilityDropdown,
  dropdownRef,
  groupedCapabilities,
  handleSearchChange,
  handleCapabilityToggle,
  handleBasisToggle,
  handleLocationChange,
  handleAvailabilityChange,
  handleClearFilters,
  hasActiveFilters,
}: {
  filters: SearchFilters;
  availableLocations: string[];
  capabilitySearch: string;
  setCapabilitySearch: (v: string) => void;
  showCapabilityDropdown: boolean;
  setShowCapabilityDropdown: (v: boolean) => void;
  dropdownRef: RefObject<HTMLDivElement>;
  groupedCapabilities: Record<string, string[]>;
  handleSearchChange: (v: string) => void;
  handleCapabilityToggle: (c: string) => void;
  handleBasisToggle: (b: Capability['basis']) => void;
  handleLocationChange: (v: string) => void;
  handleAvailabilityChange: (v: string) => void;
  handleClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <div className="net-filter-bar" ref={dropdownRef}>
      <div className="net-filter-group flex-1">
        <label className="net-filter-label" htmlFor="net-search">Search</label>
        <input
          id="net-search"
          type="search"
          className="net-filter-input"
          placeholder="Name, capability, location..."
          value={filters.query || ''}
          onChange={(e: Event) => handleSearchChange((e.target as HTMLInputElement).value)}
          onFocus={() => setShowCapabilityDropdown(false)}
        />
      </div>

      <div className="net-filter-group">
        <label className="net-filter-label" htmlFor="net-capabilities">Capabilities</label>
        <div className="net-filter-input" style={{ cursor: 'text' }}>
          <input
            id="net-capabilities"
            type="text"
            className="net-filter-input"
            style={{ border: 'none', background: 'transparent', padding: 0, minHeight: 'auto', boxShadow: 'none', outline: 'none' }}
            placeholder={filters.capabilities && filters.capabilities.length > 0
              ? `${filters.capabilities.length} selected`
              : 'Select capabilities...'}
            readOnly
            onClick={() => setShowCapabilityDropdown(true)}
            onChange={(e: Event) => setCapabilitySearch((e.target as HTMLInputElement).value)}
            value={capabilitySearch}
          />
        </div>
        {showCapabilityDropdown && (
          <div className="net-basis-chips" style={{ maxHeight: '200px', overflow: 'auto', marginTop: '8px', padding: '8px', border: '1px solid var(--border)', borderRadius: 'var(--net-radius-tight)', background: 'var(--bg)' }}>
            {Object.entries(groupedCapabilities).map(([category, caps]) => (
              <div key={category} style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: 'var(--net-text-xs)', color: 'var(--net-ink-faint)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontFamily: 'var(--net-font-mono)' }}>
                  {category}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                  {caps.map(cap => (
                    <label
                      key={cap}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.capabilities?.includes(cap)}
                        onChange={() => handleCapabilityToggle(cap)}
                        style={{ width: '14px', height: '14px', accentColor: 'var(--net-basis-supported)' }}
                      />
                      <span style={{ fontSize: 'var(--net-text-xs)', color: 'var(--net-ink)' }}>{cap.replace(`${category}:`, '')}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            {Object.keys(groupedCapabilities).length === 0 && (
              <span style={{ color: 'var(--net-ink-faint)', fontSize: 'var(--net-text-sm)' }}>No capabilities match</span>
            )}
          </div>
        )}
      </div>

      <div className="net-filter-group" style={{ minWidth: '180px' }}>
        <label className="net-filter-label">Basis</label>
        <div className="net-basis-chips">
          {BASIS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className="net-basis-chip"
              data-basis={opt.value}
              aria-pressed={filters.basis?.includes(opt.value) || false}
              onClick={() => handleBasisToggle(opt.value)}
              type="button"
            >
              <span className="basis-dot" aria-hidden="true" />
              <span>{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="net-filter-group">
        <label className="net-filter-label" htmlFor="net-location">Location</label>
        <select
          id="net-location"
          className="net-filter-select"
          value={filters.location || ''}
          onChange={(e: Event) => handleLocationChange((e.target as HTMLSelectElement).value)}
        >
          <option value="">All locations</option>
          {availableLocations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="net-filter-group">
        <label className="net-filter-label" htmlFor="net-availability">Availability</label>
        <select
          id="net-availability"
          className="net-filter-select"
          value={filters.availability || ''}
          onChange={(e: Event) => handleAvailabilityChange((e.target as HTMLSelectElement).value)}
        >
          {AVAILABILITY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          className="net-filter-clear"
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