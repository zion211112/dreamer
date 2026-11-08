import { useState, useEffect, useCallback } from 'preact/hooks';
import { ViewToggle } from './ViewToggle';
import { FilterBar } from './FilterBar';
import { DirectoryEntryCard } from './DirectoryEntryCard';
import { DirectoryEntryRow } from './DirectoryEntryRow';
import type { DirectoryEntry, SearchFilters, PaginatedResult } from '../lib/db/network';
import { searchNetwork } from '../lib/db/network';
import { isDemoMode } from '../lib/supabase/client';

interface CapabilityDirectoryProps {
  initialFilters?: SearchFilters;
  initialView?: 'card' | 'table';
  onEntrySelect?: (entry: DirectoryEntry) => void;
  className?: string;
}

const DEFAULT_FILTERS: SearchFilters = {};

const DEMO_ENTRIES: DirectoryEntry[] = [
  {
    profile: {
      id: 'demo-1',
      owner_id: 'demo-1',
      type: 'founder',
      name: 'Maya Rodriguez',
      headline: 'Residential renovation specialist, 12+ years',
      location: 'Oakland, CA',
      service_area: ['East Bay', 'San Francisco'],
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      created_by: 'demo-1',
      updated_by: 'demo-1',
    },
    capabilities: [
      { id: 'c1', profile_id: 'demo-1', name: 'carpentry', label: 'Carpentry', category: 'Construction', basis: 'counterparty_confirmed', evidence_ids: ['e1', 'e2', 'e3'], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-1', updated_by: 'demo-1' },
      { id: 'c2', profile_id: 'demo-1', name: 'project_mgmt', label: 'Project Mgmt', category: 'Construction', basis: 'supported', evidence_ids: ['e4'], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-1', updated_by: 'demo-1' },
      { id: 'c3', profile_id: 'demo-1', name: 'design', label: 'Design', category: 'Design', basis: 'declared', evidence_ids: [], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-1', updated_by: 'demo-1' },
      { id: 'c4', profile_id: 'demo-1', name: 'client_comm', label: 'Client Comm', category: 'Operations', basis: 'declared', evidence_ids: [], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-1', updated_by: 'demo-1' },
      { id: 'c5', profile_id: 'demo-1', name: 'permitting', label: 'Permitting', category: 'Operations', basis: 'declared', evidence_ids: [], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-1', updated_by: 'demo-1' },
    ],
    service_offers: [
      { id: 'o1', profile_id: 'demo-1', title: 'Renovation', scope: 'Full home renovation', deliverables: ['Demolition', 'Framing', 'Finish work'], indicative_terms: '$65-95/hr', service_area: ['East Bay'], availability: 'Mon-Thu', currency: 'USD', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-1', updated_by: 'demo-1' },
      { id: 'o2', profile_id: 'demo-1', title: 'Design Consulting', scope: 'Pre-construction design', deliverables: ['Plans', '3D renderings'], indicative_terms: '$120/hr', service_area: ['East Bay'], availability: 'Mon-Thu', currency: 'USD', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-1', updated_by: 'demo-1' },
    ],
    primary_evidence: {
      id: 'e1',
      profile_id: 'demo-1',
      type: 'work_sample',
      title: '12 Maple St Renovation',
      description: 'Complete kitchen remodel, 2024',
      file_url: null,
      file_type: null,
      file_size: null,
      verification_status: 'counterparty_confirmed',
      verified_by: 'James Torres',
      verified_at: new Date('2024-03-15').toISOString(),
      related_capability_ids: ['c1'],
      related_service_offer_ids: ['o1'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      created_by: 'demo-1',
      updated_by: 'demo-1',
    },
  },
  {
    profile: {
      id: 'demo-2',
      owner_id: 'demo-2',
      type: 'founder',
      name: 'Omar Hassan',
      headline: 'Licensed electrician, code compliance expert',
      location: 'Berkeley, CA',
      service_area: ['East Bay', 'Marin'],
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      created_by: 'demo-2',
      updated_by: 'demo-2',
    },
    capabilities: [
      { id: 'c6', profile_id: 'demo-2', name: 'electrical', label: 'Electrical', category: 'Construction', basis: 'counterparty_confirmed', evidence_ids: ['e3', 'e4'], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-2', updated_by: 'demo-2' },
      { id: 'c7', profile_id: 'demo-2', name: 'code_compliance', label: 'Code Comp', category: 'Operations', basis: 'supported', evidence_ids: ['e5'], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-2', updated_by: 'demo-2' },
      { id: 'c8', profile_id: 'demo-2', name: 'inspection', label: 'Inspection', category: 'Operations', basis: 'declared', evidence_ids: [], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-2', updated_by: 'demo-2' },
    ],
    service_offers: [
      { id: 'o3', profile_id: 'demo-2', title: 'Wiring', scope: 'New construction & remodel', deliverables: ['Rough-in', 'Finish', 'Panel upgrade'], indicative_terms: '$85/hr', service_area: ['East Bay'], availability: 'Tue-Sat', currency: 'USD', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-2', updated_by: 'demo-2' },
      { id: 'o4', profile_id: 'demo-2', title: 'Code Inspection', scope: 'Pre-sale & permit', deliverables: ['Report', 'Correction list'], indicative_terms: '$95/hr', service_area: ['East Bay', 'Marin'], availability: 'Tue-Sat', currency: 'USD', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-2', updated_by: 'demo-2' },
    ],
    primary_evidence: {
      id: 'e3',
      profile_id: 'demo-2',
      type: 'credential',
      title: 'CA Electrical License',
      description: 'C-10 License #123456, Active',
      file_url: null,
      file_type: null,
      file_size: null,
      verification_status: 'issuer_verified',
      verified_by: 'CSLB',
      verified_at: new Date('2023-01-15').toISOString(),
      related_capability_ids: ['c6'],
      related_service_offer_ids: ['o3'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      created_by: 'demo-2',
      updated_by: 'demo-2',
    },
  },
  {
    profile: {
      id: 'demo-3',
      owner_id: 'demo-3',
      type: 'founder',
      name: 'Lin Chen',
      headline: 'HVAC specialist, energy efficiency focus',
      location: 'Richmond, CA',
      service_area: ['East Bay', 'North Bay'],
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      created_by: 'demo-3',
      updated_by: 'demo-3',
    },
    capabilities: [
      { id: 'c9', profile_id: 'demo-3', name: 'hvac', label: 'HVAC', category: 'Construction', basis: 'declared', evidence_ids: [], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-3', updated_by: 'demo-3' },
      { id: 'c10', profile_id: 'demo-3', name: 'sheet_metal', label: 'Sheet Metal', category: 'Construction', basis: 'declared', evidence_ids: [], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-3', updated_by: 'demo-3' },
    ],
    service_offers: [
      { id: 'o5', profile_id: 'demo-3', title: 'HVAC Maintenance', scope: 'Residential & light commercial', deliverables: ['Tune-up', 'Filter replacement', 'Diagnostics'], indicative_terms: '$75/hr', service_area: ['East Bay'], availability: 'Mon-Fri', currency: 'USD', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-3', updated_by: 'demo-3' },
    ],
    primary_evidence: null,
  },
  {
    profile: {
      id: 'demo-4',
      owner_id: 'demo-4',
      type: 'founder',
      name: 'Priya Sharma',
      headline: 'Master plumber, gas systems certified',
      location: 'San Leandro, CA',
      service_area: ['East Bay', 'South Bay'],
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      created_by: 'demo-4',
      updated_by: 'demo-4',
    },
    capabilities: [
      { id: 'c11', profile_id: 'demo-4', name: 'plumbing', label: 'Plumbing', category: 'Construction', basis: 'counterparty_confirmed', evidence_ids: ['e6'], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-4', updated_by: 'demo-4' },
      { id: 'c12', profile_id: 'demo-4', name: 'pipefitting', label: 'Pipefitting', category: 'Construction', basis: 'supported', evidence_ids: ['e7'], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-4', updated_by: 'demo-4' },
      { id: 'c13', profile_id: 'demo-4', name: 'gas_systems', label: 'Gas Systems', category: 'Construction', basis: 'declared', evidence_ids: [], visibility: 'public', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-4', updated_by: 'demo-4' },
    ],
    service_offers: [
      { id: 'o6', profile_id: 'demo-4', title: 'Plumbing', scope: 'Service & repair', deliverables: ['Leak repair', 'Fixture install', 'Drain cleaning'], indicative_terms: '$80/hr', service_area: ['East Bay'], availability: 'Mon-Sat', currency: 'USD', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-4', updated_by: 'demo-4' },
      { id: 'o7', profile_id: 'demo-4', title: 'Gas Line', scope: 'New & repair', deliverables: ['Pressure test', 'Permit pull', 'Final inspect'], indicative_terms: '$90/hr', service_area: ['East Bay', 'South Bay'], availability: 'Mon-Sat', currency: 'USD', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), version: 1, created_by: 'demo-4', updated_by: 'demo-4' },
    ],
    primary_evidence: {
      id: 'e6',
      profile_id: 'demo-4',
      type: 'institutional_attestation',
      title: 'Journeyman Plumber Card',
      description: 'Local 342, 2022',
      file_url: null,
      file_type: null,
      file_size: null,
      verification_status: 'issuer_verified',
      verified_by: 'UA Local 342',
      verified_at: new Date('2022-06-01').toISOString(),
      related_capability_ids: ['c11'],
      related_service_offer_ids: ['o6'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      version: 1,
      created_by: 'demo-4',
      updated_by: 'demo-4',
    },
  },
];

export function CapabilityDirectory({
  initialFilters = DEFAULT_FILTERS,
  initialView = 'card',
  onEntrySelect,
  className = '',
}: CapabilityDirectoryProps) {
  const [view, setView] = useState<'card' | 'table'>(initialView);
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [results, setResults] = useState<PaginatedResult<DirectoryEntry>>({ items: [], total: 0, page: 1, page_size: 20 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableCapabilities, setAvailableCapabilities] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [availableLocations, setAvailableLocations] = useState<string[]>([]);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let data: PaginatedResult<DirectoryEntry>;
      if (isDemoMode) {
        // Filter demo entries client-side
        let filtered = [...DEMO_ENTRIES];

        if (filters.query) {
          const q = filters.query.toLowerCase();
          filtered = filtered.filter(e =>
            e.profile.name.toLowerCase().includes(q) ||
            e.profile.headline?.toLowerCase().includes(q) ||
            e.profile.location?.toLowerCase().includes(q) ||
            e.capabilities.some(c => c.name.toLowerCase().includes(q))
          );
        }
        if (filters.capabilities?.length) {
          filtered = filtered.filter(e =>
            filters.capabilities!.some(cap => e.capabilities.some(c => c.name === cap))
          );
        }
        if (filters.categories?.length) {
          filtered = filtered.filter(e =>
            filters.categories!.some(cat => e.capabilities.some(c => c.category === cat))
          );
        }
        if (filters.basis?.length) {
          filtered = filtered.filter(e =>
            filters.basis!.some(b => e.capabilities.some(c => c.basis === b))
          );
        }
        if (filters.location) {
          filtered = filtered.filter(e =>
            e.profile.location?.toLowerCase().includes(filters.location!.toLowerCase()) ||
            e.profile.service_area.some(a => a.toLowerCase().includes(filters.location!.toLowerCase()))
          );
        }
        if (filters.availability) {
          filtered = filtered.filter(e =>
            e.service_offers.some(o => o.availability?.includes(filters.availability!))
          );
        }

        data = {
          items: filtered,
          total: filtered.length,
          page: 1,
          page_size: 20,
        };
      } else {
        data = await searchNetwork(filters, 1, 20);
      }
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
      setResults({ items: [], total: 0, page: 1, page_size: 20 });
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Extract unique filter options from results
  useEffect(() => {
    const caps = new Set<string>();
    const cats = new Set<string>();
    const locs = new Set<string>();

    for (const entry of results.items) {
      for (const cap of entry.capabilities) {
        caps.add(`${cap.category}:${cap.name}`);
        cats.add(cap.category);
      }
      if (entry.profile.location) locs.add(entry.profile.location);
      for (const area of entry.profile.service_area) {
        locs.add(area);
      }
    }

    setAvailableCapabilities(Array.from(caps).sort());
    setAvailableCategories(Array.from(cats).sort());
    setAvailableLocations(Array.from(locs).sort());
  }, [results.items]);

  const hasActiveFilters = Boolean(
    filters.query ||
    (filters.capabilities && filters.capabilities.length > 0) ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.basis && filters.basis.length > 0) ||
    filters.location ||
    filters.availability
  );

  const handleViewChange = (newView: 'card' | 'table') => {
    setView(newView);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const handleEntryAction = (action: 'view' | 'message' | 'save', entry: DirectoryEntry) => {
    if (action === 'view' && onEntrySelect) {
      onEntrySelect(entry);
    }
    // Message and save would integrate with messaging/storage later
  };

  if (loading) {
    return (
      <div className={`net-directory ${className}`}>
        <div className="net-card-grid" role="status" aria-label="Loading directory">
          {[1, 2, 3].map(i => (
            <div key={i} className="net-skeleton-card">
              <div className="net-skeleton-line medium" style={{ marginBottom: 'var(--net-space-3)' }} />
              <div className="net-skeleton-line short" style={{ marginBottom: 'var(--net-space-3)' }} />
              <div className="net-skeleton-line medium" style={{ marginBottom: 'var(--net-space-3)' }} />
              <div className="net-skeleton-line short" style={{ marginBottom: 'var(--net-space-3)' }} />
              <div className="net-skeleton-line medium" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`net-directory ${className}`}>
        <div className="net-empty-state">
          <svg className="net-empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3 className="net-empty-state-title">Failed to load</h3>
          <p className="net-empty-state-message">{error}</p>
          <button className="net-empty-state-action" onClick={loadResults} type="button">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (results.items.length === 0) {
    return (
      <div className={`net-directory ${className}`}>
        <div className="net-empty-state">
          <svg className="net-empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="8" y1="8" x2="4" y2="4"/>
            <line x1="16" y1="4" x2="18" y2="2"/>
            <line x1="4" y1="16" x2="2" y2="18"/>
          </svg>
          <h3 className="net-empty-state-title">No matches found</h3>
          <p className="net-empty-state-message">
            {hasActiveFilters
              ? `No profiles match your current filters. Try broadening your search.`
              : 'No network profiles yet. Create a profile to appear here.'}
          </p>
          {hasActiveFilters && (
            <button className="net-empty-state-action" onClick={handleClearFilters} type="button">
              Clear all filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`net-directory ${className}`}>
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--net-space-4)' }}>
        <h2 style={{ margin: 0, font: '600 var(--net-text-xl) var(--net-font)', color: 'var(--net-ink)' }}>
          Network Directory
        </h2>
        <ViewToggle view={view} onChange={handleViewChange} />
      </header>

      <FilterBar
        filters={filters}
        onChange={handleFilterChange}
        availableCapabilities={availableCapabilities}
        availableCategories={availableCategories}
        availableLocations={availableLocations}
      />

      <div className="net-results-count" role="status" aria-live="polite">
        <span>Showing <strong>{results.items.length}</strong> of <strong>{results.total}</strong></span>
        {hasActiveFilters && <span>• <strong>{results.total - results.items.length}</strong> filtered</span>}
        {hasActiveFilters && (
          <button className="net-filter-clear" onClick={handleClearFilters} type="button">
            Clear
          </button>
        )}
      </div>

      {view === 'card' ? (
        <div className="net-card-grid" role="list" aria-label="Network profiles">
          {results.items.map(entry => (
            <DirectoryEntryCard
              key={entry.profile.id}
              entry={entry}
              onSelect={() => onEntrySelect?.(entry)}
              onAction={(action) => handleEntryAction(action, entry)}
            />
          ))}
        </div>
      ) : (
        <div className="net-table-container" role="region" aria-label="Network profiles table" tabIndex={0}>
          <table className="net-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Capabilities</th>
                <th scope="col">Evidence</th>
                <th scope="col">Offers</th>
                <th scope="col">Rate</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.items.map(entry => (
                <DirectoryEntryRow
                  key={entry.profile.id}
                  entry={entry}
                  onSelect={() => onEntrySelect?.(entry)}
                  onAction={(action) => handleEntryAction(action, entry)}
                  expanded={false}
                  onExpand={() => {}}
                  columns={['capabilities', 'evidence', 'offers', 'rate', 'actions']}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}