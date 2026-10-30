import { useEffect, useRef, useState } from 'preact/hooks';
import { Link } from 'wouter';
import { BrandMark } from './BrandMark';
import { IdentityCabinet } from './IdentityCabinet';

const CONTEXTS = [
  { id: 'people', label: 'People', number: '01' },
  { id: 'institutions', label: 'Institutions', number: '02' },
  { id: 'commons', label: 'Commons', number: '03' },
  { id: 'workbench', label: 'Workbench', number: '04' },
] as const;

interface StudioNavigationProps {
  currentContext: 'people' | 'institutions' | 'commons' | 'field-desk' | 'workbench';
}

function getLocalProfileName(): string {
  try {
    const raw = localStorage.getItem('authUser');
    if (!raw) return 'Kemoly Murage';
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return 'Kemoly Murage';
    const user = parsed as { [key: string]: unknown };
    const displayName = typeof user.name === 'string' ? user.name.trim()
      : typeof user.fullName === 'string' ? user.fullName.trim() : '';
    return displayName || 'Kemoly Murage';
  } catch {
    return 'Kemoly Murage';
  }
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '??';
}

function readSidebarPreference(): { collapsed: boolean; notice: string } {
  try {
    return { collapsed: localStorage.getItem('studioSidebarCollapsed') === 'true', notice: '' };
  } catch (error) {
    console.error('Could not read the Studio sidebar preference.', error);
    return { collapsed: false, notice: 'Sidebar preference could not be read; showing expanded.' };
  }
}

function ContextIcon({ id }: { id: string }) {
  if (id === 'people') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="7" cy="6.5" r="2.5" /><path d="M2.5 16v-1.2a4.5 4.5 0 0 1 9 0V16zM13 4.5a2.3 2.3 0 0 1 0 4.5m1.5 2a3.8 3.8 0 0 1 3 3.7V16h-3" /></svg>;
  }
  if (id === 'institutions') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><path d="M2.5 7 10 3l7.5 4M4 8v7m4-7v7m4-7v7m4-7v7M2.5 17h15M2.5 7h15" /></svg>;
  }
  if (id === 'commons') {
    return <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="10" cy="4.5" r="2" /><circle cx="4.5" cy="14.5" r="2" /><circle cx="15.5" cy="14.5" r="2" /><path d="m9 6.3-3.5 6.4m6-6.4 3.5 6.4m-8.5 1.8h7" /></svg>;
  }
  return <svg aria-hidden="true" viewBox="0 0 20 20"><rect x="2.5" y="6.5" width="15" height="10" rx="1" /><path d="M7 6.5V4h6v2.5M2.5 10h15m-9 0v2h3v-2" /></svg>;
}

function StudioLinks({
  currentContext,
  onNavigate,
}: {
  currentContext: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Studio destinations" className="studio-destinations">
      {CONTEXTS.map(context => (
        <Link
          aria-label={`${context.label} · ${context.number}`}
          aria-current={currentContext === context.id ? 'page' : undefined}
          className={`studio-destination${currentContext === context.id ? ' is-active' : ''}`}
          href={`/workspace/${context.id}`}
          key={context.id}
          onClick={onNavigate}
          title={context.label}
        >
          <span aria-hidden="true" className="studio-destination-number">{context.number}</span>
          <span aria-hidden="true" className="studio-destination-icon"><ContextIcon id={context.id} /></span>
          <span className="studio-destination-label">{context.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function ProfileEntry({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button
      aria-label={`Open identity cabinet for ${name}`}
      aria-haspopup="dialog"
      className="studio-profile-entry"
      onClick={onOpen}
      type="button"
      title={`Open identity cabinet for ${name}`}
    >
      <span aria-hidden="true" className="studio-profile-avatar">{getInitials(name)}</span>
      <span className="studio-profile-copy">
        <strong>{name}</strong>
        <small>Local profile · open identity</small>
      </span>
      <svg aria-hidden="true" className="studio-profile-arrow" viewBox="0 0 16 16">
        <path d="M4.5 11.5 11 5m0 0H5.5M11 5v5.5" />
      </svg>
    </button>
  );
}

export function StudioNavigation({ currentContext }: StudioNavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [identityOpen, setIdentityOpen] = useState(false);
  const [sidebarPreference, setSidebarPreference] = useState(readSidebarPreference);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const profileName = getLocalProfileName();
  const activeContext = currentContext === 'field-desk' ? 'workbench' : currentContext;
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
        <StudioLinks currentContext={activeContext} />

        <div className="studio-sidebar-bottom">
          <ProfileEntry name={profileName} onOpen={openIdentity} />
          <div className="studio-session-indicator">
            <span>APT-LABS STUDIO</span>
            <span>BROWSER-LOCAL</span>
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
        <span className="studio-mobile-current">{CONTEXTS.find(context => context.id === activeContext)?.label}</span>
        <button
          aria-haspopup="dialog"
          aria-label={`Open identity cabinet for ${profileName}`}
          className="studio-mobile-profile"
          onClick={() => setIdentityOpen(true)}
          type="button"
        >{getInitials(profileName)}</button>
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
          <StudioLinks currentContext={activeContext} onNavigate={() => setMobileOpen(false)} />
          <div className="studio-sidebar-bottom">
            <ProfileEntry name={profileName} onOpen={openIdentity} />
            <div className="studio-session-indicator">
              <span>APT-LABS STUDIO</span>
              <span>BROWSER-LOCAL</span>
            </div>
          </div>
        </div>
      </dialog>

      <IdentityCabinet
        currentContext={activeContext}
        onClose={() => setIdentityOpen(false)}
        open={identityOpen}
      />
    </>
  );
}
