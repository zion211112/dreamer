import { useEffect, useRef, useState } from 'preact/hooks';
import { Link, useLocation } from 'wouter';
import { useAuth } from '../lib/auth/hooks';
import { createPortablePeopleRecord } from '../lib/people-network';

interface IdentityCabinetProps {
  open: boolean;
  onClose: (restoreFocus?: boolean) => void;
  triggerRef: { current: HTMLButtonElement | null };
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '??';
}

export function IdentityCabinet({ open, onClose, triggerRef }: IdentityCabinetProps) {
  const { profile, user, signOut: supabaseSignOut } = useAuth();
  const [, navigate] = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    if (!open) return;

    setActionStatus('');
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
        onClose(false);
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, onClose, triggerRef]);

  function exportRecord() {
    try {
      const blob = new Blob([createPortablePeopleRecord()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'aptlabs-people-network.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setActionStatus('Portable People record exported.');
    } catch (error) {
      setActionStatus(error instanceof Error ? error.message : 'The People record could not be exported.');
    }
  }

  async function signOut() {
    try {
      localStorage.removeItem('authUser');
      localStorage.removeItem('workspaceContext');
      await supabaseSignOut();
    } catch {
      setActionStatus('This browser could not end the local session. Check storage settings and try again.');
      return;
    }
    onClose(false);
    navigate('/sign-in');
  }

  const profileName = profile?.display_name?.trim() || 'Unnamed profile';

  function handleMenuKeyDown(event: KeyboardEvent) {
    const items = Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number | null = null;

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === 'Tab') {
      onClose(false);
      return;
    }
    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length;
    if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = items.length - 1;

    if (nextIndex !== null && items[nextIndex]) {
      event.preventDefault();
      items[nextIndex].focus();
    }
  }

  return open ? (
    <div
      aria-label="Account menu"
      className="identity-menu"
      id="identity-cabinet"
      onKeyDown={handleMenuKeyDown}
      ref={menuRef}
      role="menu"
    >
      <header className="identity-menu-header">
        <span aria-hidden="true" className="identity-menu-avatar">{getInitials(profileName)}</span>
        <div className="identity-menu-account">
          <span className="identity-menu-label">Signed in as</span>
          <strong>{profileName}</strong>
          <span>{user?.email || 'Local browser profile'}</span>
        </div>
      </header>
      <div aria-orientation="horizontal" className="identity-menu-separator" role="separator" />
      <Link
        className="identity-menu-item"
        href="/workspace/network/people"
        onClick={() => onClose(false)}
        role="menuitem"
        tabIndex={-1}
      >
        View People profile
      </Link>
      <button className="identity-menu-item" onClick={exportRecord} role="menuitem" tabIndex={-1} type="button">
        Export People record
      </button>
      {actionStatus && <p className="identity-menu-status" role="status">{actionStatus}</p>}
      <div aria-orientation="horizontal" className="identity-menu-separator" role="separator" />
      <button className="identity-menu-item identity-menu-item--danger" onClick={signOut} role="menuitem" tabIndex={-1} type="button">
        Sign out
      </button>
    </div>
  ) : null;
}
