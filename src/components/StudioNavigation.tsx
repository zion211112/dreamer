import { useEffect, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { useAuth } from '../lib/auth/hooks';
import {
  getStudioModuleForContext,
  getStudioModuleLabel,
  STUDIO_MODULES,
  type StudioContext,
} from '../lib/studio-navigation';
import { BrandMark } from './BrandMark';
import { IdentityCabinet } from './IdentityCabinet';

interface StudioNavigationProps {
  currentContext: StudioContext;
}

function ContextIcon({ id }: { id: string }) {
  if (id === 'people') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="7" cy="6.5" r="2.5" /><path d="M2.5 16v-1.2a4.5 4.5 0 0 1 9 0V16zM13 4.5a2.3 2.3 0 0 1 0 4.5m1.5 2a3.8 3.8 0 0 1 3 3.7V16h-3" /></svg>;
  }
  if (id === 'institutions') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M2.5 7 10 3l7.5 4M4 8v7m4-7v7m4-7v7m4-7v7M2.5 17h15M2.5 7h15" /></svg>;
  }
  if (id === 'radar') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3" /><path d="m10 10 5-5M10 2v2m8 6h-2" /></svg>;
  }
  if (id === 'apt-coin-lab') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.25" /><path d="m12.5 12.5 4 4M6.5 8.5h4m-2-2v4" /></svg>;
  }
  if (id === 'roll') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M4 16.5V3.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5z" /><path d="M5.5 9h9M5.5 13h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="2.5" y="6.5" width="15" height="10" rx="1" /><path d="M7 6.5V4h6v2.5M2.5 10h15m-9 0v2h3v-2" /></svg>;
}

function StudioLinks({
  currentContext,
  onNavigate,
}: {
  currentContext: StudioContext;
  onNavigate?: () => void;
}) {
  const activeModule = getStudioModuleForContext(currentContext);

  return (
    <nav aria-label="Studio destinations" className="studio-destinations">
      {STUDIO_MODULES.map(module => {
        const isActive = activeModule === module.id;
        const isDefaultDestination = currentContext === module.defaultContext;

        return (
          <Link
            aria-label={module.label}
            aria-current={isDefaultDestination ? 'page' : isActive ? 'location' : undefined}
            className={`studio-destination${isActive ? ' is-active' : ''}`}
            href={module.href}
            key={module.id}
            onClick={onNavigate}
            title={module.label}
          >
            <span aria-hidden="true" className="studio-destination-icon"><ContextIcon id={module.id} /></span>
            <span className="studio-destination-label">{module.label}</span>
          </Link>
        );
      })}
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
      <span className="studio-profile-copy">
        <strong>{displayName}</strong>
        <small>Local browser profile</small>
      </span>
      <svg aria-hidden="true" className="studio-profile-arrow" viewBox="0 0 16 16">
        <path d="m4.5 6.5 3.5 3 3.5-3" />
      </svg>
    </button>
  );
}

function readSidebarPreference(): { collapsed: boolean; notice: string } {
  try {
    return { collapsed: localStorage.getItem('studioSidebarCollapsed') === 'true', notice: '' };
  } catch (error) {
    console.error('Could not read the Studio sidebar preference.', error);
    return { collapsed: false, notice: 'Sidebar preference could not be read; showing expanded.' };
  }
}

export function StudioNavigation({ currentContext }: StudioNavigationProps) {
  const { profile, loading: authLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [sidebarPreference, setSidebarPreference] = useState(readSidebarPreference);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const activeContext = currentContext === 'field-desk' ? 'workbench' : currentContext === 'roll' ? 'roll' : currentContext;
  const showIdentity = activeContext !== 'workbench' && !!profile;
  const profileName = showIdentity ? profile?.display_name || '' : '';
  const sidebarCollapsed = sidebarPreference.collapsed;

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

  function toggleSidebar() {
    const collapsed = !sidebarCollapsed;
    let notice = '';
    try {
      localStorage.setItem('studioSidebarCollapsed', String(collapsed));
    } catch (error) {
      console.error('Could not save the Studio sidebar preference.', error);
      notice = 'Could not save this sidebar choice. It may reset on reload.';
    }
    setSidebarPreference({ collapsed, notice });
  }

  if (authLoading) {
    return (
      <aside aria-label="Studio sidebar" className={`studio-sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}>
        <div className="studio-sidebar-brand">
          <BrandMark className="studio-brand-mark" size="sm" />
          <span className="studio-brand-divider" aria-hidden="true" />
          <span className="studio-brand-label">STUDIO</span>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside
        aria-label="Studio sidebar"
        className={`studio-sidebar${sidebarCollapsed ? ' is-collapsed' : ''}`}
      >
        <div className="studio-sidebar-brand">
          <BrandMark className="studio-brand-mark" size="sm" />
          <span className="studio-brand-divider" aria-hidden="true" />
          <span className="studio-brand-label">STUDIO</span>
        </div>
        <button
          aria-label={sidebarCollapsed ? 'Expand Studio sidebar' : 'Collapse Studio sidebar'}
          aria-pressed={sidebarCollapsed}
          className="studio-sidebar-toggle"
          onClick={toggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 18 18">
            <path d={sidebarCollapsed ? 'm7 4 5 5-5 5' : 'm11 4-5 5 5 5'} />
          </svg>
        </button>
        {sidebarPreference.notice && (
          <p className="studio-sidebar-notice" role="status">{sidebarPreference.notice}</p>
        )}

        <div className="studio-nav-label">Studio</div>
        <StudioLinks currentContext={currentContext} />

        <div className="studio-sidebar-bottom">
          {showIdentity && <ProfileEntry name={profileName} onOpen={openIdentity} open={identityOpen} />}
          <div className="studio-session-indicator">
            <span>APT-LABS STUDIO</span>
          </div>
        </div>
      </aside>

      <header className="studio-mobile-header">
        <button
          aria-controls="studio-mobile-drawer"
          aria-expanded={mobileOpen}
          aria-label="Open Studio navigation"
          className="studio-mobile-menu-button"
          onClick={() => setMobileOpen(true)}
          type="button"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
          </svg>
        </button>
        <BrandMark className="studio-mobile-brand" size="sm" />
        <span className="studio-mobile-current">{getStudioModuleLabel(activeContext)}</span>
        {showIdentity && (
          <button
            aria-controls="identity-cabinet"
            aria-expanded={identityOpen}
            aria-haspopup="dialog"
            aria-label={`Open identity cabinet for ${profileName}`}
            className={`studio-mobile-profile${identityOpen ? ' is-open' : ''}`}
            onClick={() => setIdentityOpen(true)}
            type="button"
          >{profileName.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '?'}</button>
        )}
      </header>

      <dialog
        aria-label="Studio navigation"
        className="studio-mobile-drawer"
        id="studio-mobile-drawer"
        onKeyDown={event => {
          if (event.key === 'Escape') {
            event.preventDefault();
            setMobileOpen(false);
          }
        }}
        onCancel={event => {
          event.preventDefault();
          setMobileOpen(false);
        }}
        onClose={() => setMobileOpen(false)}
        onClick={event => {
          if (event.target === event.currentTarget) setMobileOpen(false);
        }}
        ref={drawerRef}
      >
        <div className="studio-mobile-drawer-panel">
          <header className="studio-mobile-drawer-header">
            <BrandMark className="studio-brand-mark" size="sm" />
            <button
              aria-label="Close Studio navigation"
              autoFocus
              className="studio-drawer-close"
              onClick={() => setMobileOpen(false)}
              type="button"
            >×</button>
          </header>
          <div className="studio-nav-label">Studio</div>
          <StudioLinks currentContext={currentContext} onNavigate={() => setMobileOpen(false)} />
          <div className="studio-sidebar-bottom">
            {showIdentity && <ProfileEntry name={profileName} onOpen={openIdentity} open={identityOpen} />}
            <div className="studio-session-indicator">
              <span>APT-LABS STUDIO</span>
            </div>
          </div>
        </div>
      </dialog>

      {showIdentity && (
        <IdentityCabinet
          currentContext={activeContext}
          onClose={() => setIdentityOpen(false)}
          open={identityOpen}
        />
      )}
    </>
  );
}