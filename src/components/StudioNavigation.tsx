import { useEffect, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { useAuth } from '../lib/auth/hooks';
import {
  STUDIO_FLOW_MODULES,
  getStudioModuleForContext,
  getStudioModuleLabel,
  type StudioContext,
  type StudioModuleId,
} from '../lib/studio-navigation';
import { BrandMark } from './BrandMark';
import { IdentityCabinet } from './IdentityCabinet';

interface StudioNavigationProps {
  currentContext: StudioContext;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleCrosshair: () => void;
  crosshairEnabled: boolean;
  showIdentity: boolean;
}

function ContextIcon({ id }: { id: StudioModuleId }) {
  if (id === 'commons') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3"/><path d="M10 10l5-5M10 2v2M18 10h-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>;
  }
  if (id === 'network') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="7" cy="6.5" r="2.5"/><path d="M2.5 16v-1.2a4.5 4.5 0 0 1 9 0V16zM13 4.5a2.3 2.3 0 0 1 0 4.5m1.5 2a3.8 3.8 0 0 1 3 3.7V16h-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>;
  }
  if (id === 'workbench') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><rect x="11" y="11" width="6" height="6" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>;
  }
  if (id === 'records') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 16.5V3.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M5.5 9h9M5.5 13h6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>;
  }
  if (id === 'intelligence') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z"/><path d="M10 6v4l2.5 2.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="2.5" y="6.5" width="15" height="10" rx="1"/><path d="M7 6.5V4h6v2.5M2.5 10h15m-9 0v2h3v-2" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>;
}

interface ContextDestination {
  context: StudioContext;
  href: string;
  label: string;
}

const contextDestinations: Record<StudioContext, { heading: string; links: ContextDestination[] }> = {
  commons: { heading: 'Commons', links: [] },
  'network:people': {
    heading: 'Network',
    links: [
      { context: 'network:people', href: '/workspace/network/people', label: 'People & crews' },
      { context: 'network:institutions', href: '/workspace/network/institutions', label: 'Institutions & assets' },
      { context: 'network:capabilities', href: '/workspace/network/capabilities', label: 'Capabilities & relations' },
    ],
  },
  'network:institutions': {
    heading: 'Network',
    links: [
      { context: 'network:people', href: '/workspace/network/people', label: 'People & crews' },
      { context: 'network:institutions', href: '/workspace/network/institutions', label: 'Institutions & assets' },
      { context: 'network:capabilities', href: '/workspace/network/capabilities', label: 'Capabilities & relations' },
    ],
  },
  'network:capabilities': {
    heading: 'Network',
    links: [
      { context: 'network:people', href: '/workspace/network/people', label: 'People & crews' },
      { context: 'network:institutions', href: '/workspace/network/institutions', label: 'Institutions & assets' },
      { context: 'network:capabilities', href: '/workspace/network/capabilities', label: 'Capabilities & relations' },
    ],
  },
  workbench: {
    heading: 'Workbench',
    links: [
      { context: 'workbench:field-desk', href: '/workspace/workbench/field-desk', label: 'Field desk' },
      { context: 'workbench:school-console', href: '/workspace/workbench/school-console', label: 'School console' },
    ],
  },
  'workbench:field-desk': {
    heading: 'Workbench',
    links: [
      { context: 'workbench:field-desk', href: '/workspace/workbench/field-desk', label: 'Field desk' },
      { context: 'workbench:school-console', href: '/workspace/workbench/school-console', label: 'School console' },
    ],
  },
  'workbench:school-console': {
    heading: 'Workbench',
    links: [
      { context: 'workbench:field-desk', href: '/workspace/workbench/field-desk', label: 'Field desk' },
      { context: 'workbench:school-console', href: '/workspace/workbench/school-console', label: 'School console' },
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
  intelligence: { heading: 'Intelligence', links: [] },
  'intelligence:coin-lab': { heading: 'Intelligence', links: [] },
};

function StudioLinks({ currentContext, onNavigate }: { currentContext: StudioContext; onNavigate?: () => void }) {
  const { heading, links } = contextDestinations[currentContext];
  return (
    <nav aria-label={`${heading} destinations`} className="sublime-context-destinations">
      {links.length ? links.map(link => (
        <Link
          aria-current={currentContext === link.context ? 'page' : undefined}
          className={`sublime-context-destination${currentContext === link.context ? ' is-active' : ''}`}
          href={link.href}
          key={link.context}
          onClick={onNavigate}
        >
          <span aria-hidden="true" className="sublime-context-destination-mark" />
          {link.label}
        </Link>
      )) : (
        <p className="sublime-context-empty">No destinations in this context.</p>
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
      className={`sublime-profile-entry${open ? ' is-open' : ''}`}
      onClick={onOpen}
      type="button"
      title={`Open identity cabinet for ${displayName}`}
    >
      <span aria-hidden="true" className="sublime-profile-avatar">{initials}</span>
      <span className="sublime-profile-copy"><strong>{displayName}</strong><small>Local browser profile</small></span>
      <svg aria-hidden="true" className="sublime-profile-arrow" viewBox="0 0 16 16"><path d="m4.5 6.5 3.5 3 3.5-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>
  );
}

export function StudioNavigation({
  currentContext,
  sidebarCollapsed,
  onToggleSidebar,
  onToggleCrosshair,
  crosshairEnabled,
  showIdentity,
}: StudioNavigationProps) {
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const activeModule = getStudioModuleForContext(currentContext) || 'commons';
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

  function renderRailModule(moduleId: StudioModuleId, href: string, label: string, current: boolean) {
    return (
      <Link
        aria-current={current ? 'location' : undefined}
        aria-label={label}
        className={`sublime-rail-link${current ? ' is-active' : ''}`}
        href={href}
        key={moduleId}
        title={label}
      >
        <ContextIcon id={moduleId} />
      </Link>
    );
  }

  return (
    <>
      <header className="sublime-topbar">
        <button
          aria-controls="sublime-mobile-drawer"
          aria-expanded={mobileOpen}
          aria-label="Open workspace navigation"
          className="sublime-mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          ref={menuButtonRef}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M3 5.5h14M3 10h14M3 14.5h14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <BrandMark className="sublime-topbar-brand" size="sm" />
        <span className="sublime-topbar-divider" aria-hidden="true" />
        <span className="sublime-topbar-context"><strong>Field Desk</strong><span aria-hidden="true">/</span>{getStudioModuleLabel(currentContext)}</span>
        <span className="sublime-topbar-spacer" />
        <button
          aria-label={sidebarCollapsed ? 'Show workspace navigation pane' : 'Hide workspace navigation pane'}
          aria-pressed={sidebarCollapsed}
          className="sublime-context-toggle"
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Show navigation pane' : 'Hide navigation pane'}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="2.5" y="3" width="15" height="14"/><path d="M7.5 3v14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>
        <button
          aria-label={crosshairEnabled ? 'Hide crosshair' : 'Show crosshair'}
          aria-pressed={crosshairEnabled}
          className="sublime-crosshair-toggle"
          onClick={onToggleCrosshair}
          title={crosshairEnabled ? 'Hide crosshair (C)' : 'Show crosshair (C)'}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M10 2v16M2 10h16" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2,2"/></svg>
        </button>
        {showIdentity && <ProfileEntry name={profileName} onOpen={() => setIdentityOpen(true)} open={identityOpen} />}
      </header>

      <nav aria-label="Primary workspace modules" className="sublime-module-rail">
        {STUDIO_FLOW_MODULES.map(module => renderRailModule(
          module.id,
          module.href,
          module.label,
          getStudioModuleForContext(currentContext) === module.id,
        ))}
      </nav>

      <aside aria-label="Workspace context navigation" className={`sublime-sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}>
        <div className="sublime-sidebar-heading">
          <span>Current workspace</span>
          <span className="sublime-sidebar-context">{getStudioModuleLabel(currentContext)}</span>
        </div>
        <div className="sublime-nav-label">{contextDestinations[currentContext].heading}</div>
        <StudioLinks currentContext={currentContext} />
        <div className="sublime-sidebar-bottom">
          <div className="sublime-session-indicator"><span>DATA CONTEXT</span><small>Local, sample, and imported records remain distinct.</small></div>
        </div>
      </aside>

      <dialog
        aria-label="Workspace navigation"
        className="sublime-mobile-drawer"
        id="sublime-mobile-drawer"
        onCancel={event => { event.preventDefault(); setMobileOpen(false); }}
        onClose={() => setMobileOpen(false)}
        onClick={event => { if (event.target === event.currentTarget) setMobileOpen(false); }}
        onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setMobileOpen(false); } }}
        ref={drawerRef}
      >
        <div className="sublime-mobile-drawer-panel">
          <header className="sublime-mobile-drawer-header">
            <BrandMark className="sublime-brand-mark" size="sm" />
            <button aria-label="Close workspace navigation" autoFocus className="sublime-drawer-close" onClick={() => setMobileOpen(false)} type="button">×</button>
          </header>
          <div className="sublime-nav-label">Workspace</div>
          <StudioLinks
            currentContext={currentContext}
            onNavigate={() => {
              setMobileOpen(false);
              window.requestAnimationFrame(() => {
                window.requestAnimationFrame(() => menuButtonRef.current?.focus());
              });
            }}
          />
          {showIdentity && <ProfileEntry name={profileName} onOpen={openIdentity} open={identityOpen} />}
          <div className="sublime-session-indicator"><span>DATA CONTEXT</span><small>Local, sample, and imported records remain distinct.</small></div>
        </div>
      </dialog>

      {showIdentity && <IdentityCabinet currentContext={activeModule} onClose={() => setIdentityOpen(false)} open={identityOpen} />}
    </>
  );
}
