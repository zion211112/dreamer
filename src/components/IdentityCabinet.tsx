import { useEffect, useRef, useState } from 'preact/hooks';
import { useLocation } from 'wouter';
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

interface LocalSession {
  email: string | null;
  displayName: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readLocalSession(): LocalSession {
  const raw = localStorage.getItem('authUser');
  if (!raw) return { email: null, displayName: null };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('The local session record is damaged. Sign out and sign in again to reset it.');
  }
  if (!isRecord(parsed)) {
    throw new Error('The local session record has an unsupported format. Sign out and sign in again to reset it.');
  }

  return {
    email: typeof parsed.email === 'string' ? parsed.email : null,
    displayName: typeof parsed.name === 'string' ? parsed.name
      : typeof parsed.fullName === 'string' ? parsed.fullName : null,
  };
}

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] ?? '').join('').toUpperCase() || '??';
}

function SectionHeading({ children, detail }: { children: string; detail?: string }) {
  return (
    <header className="identity-section-heading">
      <h3>{children}</h3>
      {detail && <span>{detail}</span>}
    </header>
  );
}

export function IdentityCabinet({ open, onClose, currentContext }: IdentityCabinetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [location, navigate] = useLocation();
  const [network, setNetwork] = useState<PeopleNetworkRecord | null>(null);
  const [session, setSession] = useState<LocalSession | null>(null);
  const [loadError, setLoadError] = useState('');
  const [actionStatus, setActionStatus] = useState('');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      try {
        setLoadError('');
        setActionStatus('');
        const nextSession = readLocalSession();
        const nextNetwork = readPeopleNetworkRecord();
        setSession(nextSession);
        setNetwork(nextNetwork);
        dialog.showModal();
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : 'Local identity records could not be read.');
        setSession(null);
        setNetwork(null);
        dialog.showModal();
      }
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const profileName = session?.displayName?.trim() || '';
  const profile = profileName ? network?.entities.find(entity => entity.type === 'person' && entity.name === profileName) ?? null : null;
  const currentPath = location.split('?')[0];
  const normalizedContext = currentPath === '/workspace/field-desk' ? 'workbench' : currentContext;
  const contextLabel = normalizedContext.replace('-', ' ');
  const localEvidence = profile && network
    ? network.relationships
      .filter(relationship => relationship.sourceId === profile.id && relationship.kind === 'evidence')
      .map(relationship => network.entities.find(entity => entity.id === relationship.targetId))
      .filter((entity): entity is NetworkEntity => Boolean(entity))
    : [];
  const networkLinks = profile && network
    ? network.relationships
      .filter(relationship => relationship.sourceId === profile.id && ['membership', 'affiliation'].includes(relationship.kind))
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

  function signOut() {
    try {
      localStorage.removeItem('authUser');
      localStorage.removeItem('workspaceContext');
    } catch {
      setActionStatus('This browser could not end the local session. Check storage settings and try again.');
      return;
    }
    onClose();
    navigate('/sign-in');
  }

  return (
    <dialog
      aria-labelledby="identity-cabinet-title"
      className="identity-cabinet"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
        }
      }}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={event => {
        if (event.target === event.currentTarget) onClose();
      }}
      ref={dialogRef}
    >
      <div className="identity-cabinet-panel">
        <header className="identity-cabinet-header">
          <div>
            <span className="identity-eyebrow">PERSON · PROOF · AUTHORITY</span>
            <h2 id="identity-cabinet-title">Identity cabinet</h2>
          </div>
          <button aria-label="Close identity cabinet" className="identity-close-button" onClick={onClose} type="button">×</button>
        </header>

        {loadError ? (
          <div className="identity-cabinet-body">
            <p className="identity-error" role="alert">{loadError}</p>
          </div>
        ) : (
          <div className="identity-cabinet-body">
            <section className="identity-profile-card">
              <div className="identity-profile-summary">
                <span aria-hidden="true" className="identity-avatar">{getInitials((profile?.name ?? profileName) || '?')}</span>
                <div>
                  <h3>{(profile?.name ?? profileName) || 'Unnamed profile'}</h3>
                </div>
              </div>
              <div className="identity-session-grid">
                <div>
                  <span>Session</span>
                  <strong>{session?.email ? 'Signed in' : 'Not signed in'}</strong>
                </div>
                <div>
                  <span>Studio context</span>
                  <strong>{contextLabel}</strong>
                </div>
                {session?.email && (
                  <div className="identity-session-email">
                    <span>Email</span>
                    <strong>{session.email}</strong>
                  </div>
                )}
              </div>
            </section>

            <div className="identity-cabinet-content">
              <section className="identity-section">
                <SectionHeading detail="SELF-DESCRIBED">Capabilities</SectionHeading>
                {profile?.capabilities.length ? (
                  <div className="identity-capability-list">
                    {profile.capabilities.map(capability => <span key={capability}>{capability}</span>)}
                  </div>
                ) : <p className="identity-muted">No capability record is connected to this local profile.</p>}
                {profile?.role && <p className="identity-provenance">Profile role: {profile.role}</p>}
              </section>

              <section className="identity-section">
                <SectionHeading detail={localEvidence.length ? `${localEvidence.length.toString().padStart(2, '0')} PROFILE RECORDS` : ''}>
                  Credentials &amp; claims
                </SectionHeading>
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
                        <span className="identity-reported-tag">REPORTED</span>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="identity-muted">No issuer-verified credentials are connected.</p>
                )}
              </section>

              <section className="identity-section">
                <SectionHeading detail="''">Memberships &amp; authority</SectionHeading>
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
                <SectionHeading>Portability &amp; session</SectionHeading>
                <div className="identity-action-grid">
                  <button onClick={() => { onClose(); navigate('/workspace/people'); }} type="button">View People profile</button>
                  <button onClick={exportRecord} type="button">Export People record</button>
                </div>
                {actionStatus && <p className="identity-action-status" role="status">{actionStatus}</p>}
                <button className="identity-sign-out" onClick={signOut} type="button">End local session</button>
              </section>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
