import { useEffect, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { useAuth } from '../lib/auth/hooks';
import {
  STUDIO_FLOW_MODULES,
  getStudioContextLabel,
  getStudioModuleForContext,
  type StudioContext,
  type StudioModuleId,
} from '../lib/studio-navigation';
import { BrandMark } from './BrandMark';
import { IdentityCabinet } from './IdentityCabinet';
import { WorkspaceQuickSearch } from './WorkspaceQuickSearch';
import { WORKSPACE_SEARCH_DESTINATIONS } from '../lib/workspace-search';

interface StudioNavigationProps {
  currentContext: StudioContext;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onResetSidebar: () => void;
  environmentLabel: string;
  recordSelected: boolean;
  inspectorOpen: boolean;
  onToggleInspector: () => void;
}

function ContextIcon({ id }: { id: StudioModuleId }) {
  if (id === 'home') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="m2.5 9 7.5-6 7.5 6" /><path d="M4.5 8v9h11V8M8 17v-5h4v5" /></svg>;
  }
  if (id === 'commons') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3" /><path d="m10 10 5-5M10 2v2m8 6h-2" /></svg>;
  }
  if (id === 'network') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="7" cy="6.5" r="2.5" /><path d="M2.5 16v-1.2a4.5 4.5 0 0 1 9 0V16zM13 4.5a2.3 2.3 0 0 1 0 4.5m1.5 2a3.8 3.8 0 0 1 3 3.7V16h-3" /></svg>;
  }
  if (id === 'records') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 16.5V3.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5z" /><path d="M5.5 9h9M5.5 13h6" /></svg>;
  }
  if (id === 'intelligence') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="2" /><circle cx="4" cy="5" r="1.5" /><circle cx="16" cy="5" r="1.5" /><circle cx="4" cy="15" r="1.5" /><circle cx="16" cy="15" r="1.5" /><path d="m8.5 8.5-3.4-2.4m6.4 2.4 3.4-2.4m-6.4 3.9-3.4 2.4m6.4-2.4 3.4 2.4" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="2.5" y="6.5" width="15" height="10" rx="1" /><path d="M7 6.5V4h6v2.5M2.5 10h15m-9 0v2h3v-2" /></svg>;
}

interface ContextDestination {
  context: StudioContext;
  href: string;
  label: string;
}

const contextDestinations: Record<StudioContext, { heading: string; links: ContextDestination[] }> = {
  overview: {
    heading: 'Overview',
    links: [],
  },
  commons: {
    heading: 'Commons',
    links: [],
  },
  'network:people': {
    heading: 'Network',
    links: [
      { context: 'network:people', href: '/workspace/network/people', label: 'People & crews' },
      { context: 'network:institutions', href: '/workspace/network/institutions', label: 'Institutions & assets' },
      { context: 'network:capabilities', href: '/workspace/network/capabilities', label: 'Capability directory' },
    ],
  },
  'network:institutions': {
    heading: 'Network',
    links: [
      { context: 'network:people', href: '/workspace/network/people', label: 'People & crews' },
      { context: 'network:institutions', href: '/workspace/network/institutions', label: 'Institutions & assets' },
      { context: 'network:capabilities', href: '/workspace/network/capabilities', label: 'Capability directory' },
    ],
  },
  'network:capabilities': {
    heading: 'Network',
    links: [
      { context: 'network:people', href: '/workspace/network/people', label: 'People & crews' },
      { context: 'network:institutions', href: '/workspace/network/institutions', label: 'Institutions & assets' },
      { context: 'network:capabilities', href: '/workspace/network/capabilities', label: 'Capability directory' },
    ],
  },
  workbench: {
    heading: 'Workbench',
    links: [
      { context: 'workbench', href: '/workspace/workbench', label: 'All pilot lanes' },
    ],
  },
  'records:canon': {
    heading: 'Records',
    links: [
      { context: 'records:canon', href: '/workspace/records/canon', label: 'Canon' },
      { context: 'records:annals', href: '/workspace/records/annals', label: 'Annals' },
      { context: 'records:roll', href: '/workspace/records/roll', label: 'Roll' },
    ],
  },
  'records:annals': {
    heading: 'Records',
    links: [
      { context: 'records:canon', href: '/workspace/records/canon', label: 'Canon' },
      { context: 'records:annals', href: '/workspace/records/annals', label: 'Annals' },
      { context: 'records:roll', href: '/workspace/records/roll', label: 'Roll' },
    ],
  },
  'records:roll': {
    heading: 'Records',
    links: [
      { context: 'records:canon', href: '/workspace/records/canon', label: 'Canon' },
      { context: 'records:annals', href: '/workspace/records/annals', label: 'Annals' },
      { context: 'records:roll', href: '/workspace/records/roll', label: 'Roll' },
    ],
  },
  intelligence: {
    heading: 'Intelligence',
    links: [
      { context: 'intelligence:coin-lab', href: '/workspace/intelligence', label: 'Trust and economic intelligence' },
    ],
  },
  'intelligence:coin-lab': {
    heading: 'Intelligence',
    links: [
      { context: 'intelligence:coin-lab', href: '/workspace/intelligence', label: 'Trust and economic intelligence' },
    ],
  },
};

function StudioLinks({ currentContext, onNavigate }: { currentContext: StudioContext; onNavigate?: () => void }) {
  const { heading, links } = contextDestinations[currentContext];
  return (
    <nav aria-label={`${heading} destinations`} className="studio-context-destinations">
      {links.length ? links.map(link => (
        <Link
          aria-current={currentContext === link.context ? 'page' : undefined}
          className={`studio-context-destination${currentContext === link.context ? ' is-active' : ''}`}
          href={link.href}
          key={link.context}
          onClick={onNavigate}
        >
          <span aria-hidden="true" className="studio-context-destination-mark" />
          {link.label}
        </Link>
      )) : (
        <p className="studio-context-empty">
          {currentContext === 'overview' ? 'Choose a module to begin.' : 'No destinations in this context.'}
        </p>
      )}
    </nav>
  );
}

function ProfileEntry({ name, onOpen, open }: { name: string; onOpen: () => void; open: boolean }) {
  const displayName = name || 'Unnamed profile';
  const initials = name ? name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() : '?';
  return (
    <button
      aria-label={`Open identity cabinet for ${displayName}`}
      aria-controls="identity-cabinet"
      aria-expanded={open}
      aria-haspopup="dialog"
      className={`studio-profile-entry${open ? ' is-open' : ''}`}
      onClick={onOpen}
      type="button"
      title={`Open identity cabinet for ${displayName}`}
    >
      <span aria-hidden="true" className="studio-profile-avatar">{initials}</span>
      <span className="studio-profile-copy"><strong>{displayName}</strong><small>Local browser profile</small></span>
      <svg aria-hidden="true" className="studio-profile-arrow" viewBox="0 0 16 16"><path d="m4.5 6.5 3.5 3 3.5-3" /></svg>
    </button>
  );
}

export function StudioNavigation({
  currentContext,
  sidebarCollapsed,
  onToggleSidebar,
  onResetSidebar,
  environmentLabel,
  recordSelected,
  inspectorOpen,
  onToggleInspector,
}: StudioNavigationProps) {
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const inspectorToggleRef = useRef<HTMLButtonElement>(null);
  const showIdentity = !!profile;
  const profileName = showIdentity ? profile?.display_name || '' : '';

  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;
    if (mobileOpen && !drawer.open) drawer.showModal();
    else if (!mobileOpen && drawer.open) drawer.close();
  }, [mobileOpen]);

  function openIdentity() {
    if (mobileOpen) {
      setMobileOpen(false);
      window.setTimeout(() => setIdentityOpen(true), 0);
    } else {
      setIdentityOpen(true);
    }
  }

  function restoreMenuFocus() {
    window.requestAnimationFrame(() => menuButtonRef.current?.focus());
  }

  useEffect(() => {
    if (recordSelected && !inspectorOpen) {
      window.requestAnimationFrame(() => inspectorToggleRef.current?.focus());
    }
  }, [inspectorOpen, recordSelected]);

  function renderRailModule(moduleId: StudioModuleId, href: string, label: string, current: boolean) {
    return (
      <Link
        aria-current={current ? 'location' : undefined}
        className={`studio-rail-link${current ? ' is-active' : ''}`}
        href={href}
        key={moduleId}
      >
        <ContextIcon id={moduleId} />
        <span className="studio-rail-label">{label}</span>
      </Link>
    );
  }

  return (
    <>
      <header className="studio-topbar">
        <button
          aria-controls="studio-mobile-drawer"
          aria-expanded={mobileOpen}
          aria-label="Open context navigation"
          className="studio-mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          ref={menuButtonRef}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M3 5.5h14M3 10h14M3 14.5h14" /></svg>
        </button>
        <BrandMark className="studio-topbar-brand" href="/workspace" size="sm" />
        <span className="studio-topbar-divider" aria-hidden="true" />
        <span className="studio-topbar-context">{getStudioContextLabel(currentContext)}</span>
        <span aria-label={`Environment: ${environmentLabel}`} className="studio-environment-indicator">
          {environmentLabel}
        </span>
        <span className="studio-topbar-spacer" />
        <WorkspaceQuickSearch destinations={WORKSPACE_SEARCH_DESTINATIONS} />
        {recordSelected && (
          <button
            aria-controls="record-inspector"
            aria-expanded={inspectorOpen}
            aria-label={inspectorOpen ? 'Hide record details' : 'Show record details'}
            className="studio-inspector-toggle"
            onClick={onToggleInspector}
            ref={inspectorToggleRef}
            type="button"
          >
            {inspectorOpen ? 'Hide details' : 'Show details'}
          </button>
        )}
        <button
          aria-controls="workspace-context-navigation"
          aria-label={sidebarCollapsed ? 'Show context navigation' : 'Hide context navigation'}
          aria-pressed={sidebarCollapsed}
          className="studio-context-toggle"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Show context navigation' : 'Hide context navigation'}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="2.5" y="3" width="15" height="14"/><path d="M7.5 3v14"/></svg>
        </button>
        <button
          aria-label="Reset workspace layout"
          className="studio-layout-reset"
          onClick={onResetSidebar}
          title="Reset workspace layout"
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4.5 7.5A6 6 0 1 1 4 11"/><path d="M4.5 3.5v4h4" /></svg>
        </button>
        {showIdentity && <ProfileEntry name={profileName} onOpen={() => setIdentityOpen(true)} open={identityOpen} />}
      </header>

      <nav aria-label="Primary workspace modules" className="studio-module-rail">
        {STUDIO_FLOW_MODULES.map(module => renderRailModule(
          module.id,
          module.href,
          module.label,
          getStudioModuleForContext(currentContext) === module.id,
        ))}
      </nav>

      <aside
        aria-label="Workspace context navigation"
        className={`studio-sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}
        id="workspace-context-navigation"
      >
        <div className="studio-sidebar-heading">
          <span>Current workspace</span>
          <span className="studio-sidebar-context">{getStudioContextLabel(currentContext)}</span>
        </div>
        {contextDestinations[currentContext].links.length > 0 && (
          <div className="studio-nav-label">{contextDestinations[currentContext].heading}</div>
        )}
        <StudioLinks currentContext={currentContext} />
        <div className="studio-sidebar-bottom">
          <div className="studio-session-indicator"><span>DATA CONTEXT</span><small>Local, sample, and imported records remain distinct.</small></div>
        </div>
      </aside>

      <dialog
        aria-label="Workspace navigation"
        className="studio-mobile-drawer"
        id="studio-mobile-drawer"
        onCancel={event => { event.preventDefault(); setMobileOpen(false); }}
        onClose={() => {
          setMobileOpen(false);
          restoreMenuFocus();
        }}
        onClick={event => { if (event.target === event.currentTarget) setMobileOpen(false); }}
        onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setMobileOpen(false); } }}
        ref={drawerRef}
      >
        <div className="studio-mobile-drawer-panel">
          <header className="studio-mobile-drawer-header">
            <BrandMark className="studio-brand-mark" href="/workspace" size="sm" />
            <button aria-label="Close workspace navigation" autoFocus className="studio-drawer-close" onClick={() => setMobileOpen(false)} type="button">×</button>
          </header>
          <div className="studio-nav-label">{getStudioContextLabel(currentContext)}</div>
          <StudioLinks
            currentContext={currentContext}
            onNavigate={() => setMobileOpen(false)}
          />
          {showIdentity && <ProfileEntry name={profileName} onOpen={openIdentity} open={identityOpen} />}
          <div className="studio-session-indicator"><span>DATA CONTEXT</span><small>Local, sample, and imported records remain distinct.</small></div>
        </div>
      </dialog>

      {showIdentity && <IdentityCabinet currentContext={currentContext} onClose={() => setIdentityOpen(false)} open={identityOpen} />}
    </>
  );
}
