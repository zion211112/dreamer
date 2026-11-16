import { useEffect, useRef, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
import { useAuth } from '../lib/auth/hooks';
import {
  createPortablePeopleRecord,
  readPeopleNetworkRecord,
  type NetworkEntity,
  type PeopleNetworkRecord,
} from '../lib/people-network';

interface IdentityCabinetProps {
  open: boolean;
  onClose: () => void;
  currentContext: string;
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '??';
}

export function IdentityCabinet({ open, onClose, currentContext }: IdentityCabinetProps) {
  const { profile, user, signOut: supabaseSignOut } = useAuth();
  const [, navigate] = useLocation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [network, setNetwork] = useState<PeopleNetworkRecord | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (open) {
      try {
        setLoadError('');
        setActionStatus('');
        const nextNetwork = readPeopleNetworkRecord();
        setNetwork(nextNetwork);
        panel.scrollTop = 0;
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Local identity records could not be read.');
        setNetwork(null);
      }
    }
  }, [open]);

  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (open && event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const profileName = profile?.display_name?.trim() || '';
  const networkProfile = profileName ? network?.entities.find(entity => entity.type === 'person' && entity.name === profileName) ?? null : null;
  const contextLabel = currentContext.replace('-', ' ');
  const localEvidence = networkProfile && network
    ? network.relationships
      .filter(relationship => relationship.sourceId === networkProfile.id && relationship.kind === 'evidence')
      .map(relationship => network.entities.find(entity => entity.id === relationship.targetId))
      .filter((entity): entity is NetworkEntity => Boolean(entity))
    : [];
  const networkLinks = networkProfile && network
    ? network.relationships
      .filter(relationship => relationship.sourceId === networkProfile.id && ['membership', 'affiliation'].includes(relationship.kind))
      .map(relationship => ({
        relationship,
        entity: network.entities.find(entity => entity.id === relationship.targetId),
      }))
      .filter((link): link is { relationship: typeof network.relationships[number]; entity: NetworkEntity } => Boolean(link.entity))
    : [];

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
    onClose();
    navigate('/sign-in');
  }

  return (
    <aside
      ref={panelRef}
      aria-labelledby="identity-panel-title"
      aria-modal="true"
      className={`identity-panel${open ? ' is-open' : ''}`}
      id="identity-panel"
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="identity-overlay" onClick={onClose} />
      <div className="identity-panel-wrap">
        <header className="identity-panel-header">
          <div>
            <h2 id="identity-panel-title">Identity</h2>
            <p className="identity-panel-description">Local browser profile and its records.</p>
          </div>
          <button aria-label="Close identity panel" className="identity-close-button" onClick={onClose} type="button">×</button>
        </header>

        {loadError ? (
          <div className="identity-panel-body">
            <p className="identity-error" role="alert">{loadError}</p>
          </div>
        ) : (
          <div className="identity-panel-body">
            <section className="identity-profile-card">
              <div className="identity-profile-summary">
                <span aria-hidden="true" className="identity-avatar">{getInitials(profileName || '?')}</span>
                <div>
                  <h3>{profileName || 'Unnamed profile'}</h3>
                  <span className="identity-source-label">Local browser profile</span>
                </div>
              </div>
              <div className="identity-session-grid">
                <div className="identity-session-item">
                  <span>Session</span>
                  <strong>{profile ? 'Signed in' : 'Not signed in'}</strong>
                </div>
                <div className="identity-session-item">
                  <span>Studio context</span>
                  <strong>{contextLabel}</strong>
                </div>
                {user?.email && (
                  <div className="identity-session-item identity-session-email">
                    <span>Email</span>
                    <strong>{user.email}</strong>
                  </div>
                )}
              </div>
            </section>

            <div className="identity-panel-content">
              <section className="identity-section">
                <header className="identity-section-head">
                  <span className="identity-section-kicker">Self-described</span>
                  <h4 className="identity-section-title">Capabilities</h4>
                </header>
                {networkProfile?.capabilities.length ? (
                  <div className="identity-capability-list">
                    {networkProfile.capabilities.map(capability => <span key={capability} className="identity-chip">{capability}</span>)}
                  </div>
                ) : <p className="identity-muted">No capabilities are recorded for this local profile.</p>}
                {networkProfile?.role && <p className="identity-provenance">Profile role: {networkProfile.role}</p>}
              </section>

              <section className="identity-section">
                <header className="identity-section-head">
                  <span className="identity-section-kicker">{localEvidence.length.toString().padStart(2, '0')} profile records</span>
                  <h4 className="identity-section-title">Credentials & claims</h4>
                </header>
                {localEvidence.length ? (
                  <div className="identity-evidence-list">
                    {localEvidence.map(evidence => (
                      <article className="identity-evidence-card" key={evidence.id}>
                        <div className="identity-evidence-mark" aria-hidden="true">{evidence.role === 'Credential record' ? 'SBT' : 'EVD'}</div>
                        <div className="identity-evidence-copy">
                          <strong>{evidence.name}</strong>
                          <p>{evidence.summary}</p>
                          <span>{evidence.context ?? 'Profile record'}</span>
                        </div>
                        <span className="identity-reported-tag">Reported</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="identity-muted">No issuer-verified credentials are recorded in this browser.</p>
                )}
              </section>

              <section className="identity-section">
                <header className="identity-section-head">
                  <span className="identity-section-kicker">Local people record</span>
                  <h4 className="identity-section-title">Memberships & authority</h4>
                </header>
                {networkLinks.length ? (
                  <ul className="identity-network-links">
                    {networkLinks.map(({ relationship, entity }) => (
                      <li key={relationship.id}>
                        <span>{relationship.verb} <strong>{entity.name}</strong></span>
                        <small>{relationship.kind} · local People record</small>
                      </li>
                    ))}
                  </ul>
                ) : <p className="identity-muted">No membership or affiliation is recorded in this local profile.</p>}
              </section>

              <section className="identity-section identity-portability">
                <header className="identity-section-head">
                  <span className="identity-section-kicker">Portability & session</span>
                  <h4 className="identity-section-title">Actions</h4>
                </header>
                <div className="identity-action-grid">
                  <button onClick={() => { onClose(); navigate('/workspace/network/people'); }} type="button" className="identity-btn identity-btn--ghost">
                    View People profile
                  </button>
                  <button onClick={exportRecord} type="button" className="identity-btn identity-btn--ghost">
                    Export People record
                  </button>
                </div>
                {actionStatus && <p className="identity-action-status" role="status">{actionStatus}</p>}
                <button className="identity-btn identity-btn--danger" onClick={signOut} type="button">End session</button>
              </section>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
