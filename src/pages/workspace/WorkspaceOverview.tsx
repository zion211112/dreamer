import { Link } from 'wouter';
import type { ComponentChildren } from 'preact';
import { useAuth } from '../../lib/auth/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { getWorkspaceHomePersona } from '../../lib/workspace-overview';

interface ModuleCard {
  id: string;
  name: string;
  job: string;
  href: string;
  featured?: boolean;
}

const MODULE_ICONS: Record<string, ComponentChildren> = {
  commons: (
    <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="7" /><circle cx="10" cy="10" r="3" /><path d="m10 10 5-5M10 2v2m8 6h-2" /></svg>
  ),
  network: (
    <svg viewBox="0 0 20 20"><circle cx="7" cy="6.5" r="2.5" /><path d="M2.5 16v-1.2a4.5 4.5 0 0 1 9 0V16zM13 4.5a2.3 2.3 0 0 1 0 4.5m1.5 2a3.8 3.8 0 0 1 3 3.7V16h-3" /></svg>
  ),
  workbench: (
    <svg viewBox="0 0 20 20"><rect x="2.5" y="6.5" width="15" height="10" rx="1" /><path d="M7 6.5V4h6v2.5M2.5 10h15m-9 0v2h3v-2" /></svg>
  ),
  records: (
    <svg viewBox="0 0 20 20"><path d="M4 16.5V3.5a1.5 1.5 0 0 1 1.5-1.5h11a1.5 1.5 0 0 1 1.5 1.5v13a1.5 1.5 0 0 1-1.5 1.5h-11a1.5 1.5 0 0 1-1.5-1.5z" /><path d="M5.5 9h9M5.5 13h6" /></svg>
  ),
  intelligence: (
    <svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="2" /><circle cx="4" cy="5" r="1.5" /><circle cx="16" cy="5" r="1.5" /><circle cx="4" cy="15" r="1.5" /><circle cx="16" cy="15" r="1.5" /><path d="m8.5 8.5-3.4-2.4m6.4 2.4 3.4-2.4m-6.4 3.9-3.4 2.4m6.4-2.4 3.4 2.4" /></svg>
  ),
};

const MODULE_CARDS: ModuleCard[] = [
  {
    id: 'commons',
    name: 'Commons',
    job: 'Discover needs, offers, and opportunities across the field',
    href: '/workspace/commons',
  },
  {
    id: 'network',
    name: 'Network',
    job: 'People, crews, institutions, and capability relationships',
    href: '/workspace/network/people',
  },
  {
    id: 'workbench',
    name: 'Workbench',
    job: 'Scope, assemble, and coordinate productive work',
    href: '/workspace/workbench',
    featured: true,
  },
  {
    id: 'records',
    name: 'Records',
    job: 'Canon, annals, and the roll of recorded evidence',
    href: '/workspace/records/roll',
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    job: 'Agents, matching, forecasting, and economic signals',
    href: '/workspace/intelligence',
  },
];

export function WorkspaceOverview() {
  const { profile, loading } = useAuth();
  const persona = getWorkspaceHomePersona(profile?.role);
  const displayName = profile?.display_name.trim();
  const organizationName = profile?.organization_name?.trim();
  const title = loading
    ? 'Your workspace'
    : displayName && displayName.length > 2
      ? `Welcome back, ${displayName}.`
      : `Your ${persona.roleLabel.toLowerCase()} workspace.`;

  return (
    <WorkspaceLayout currentContext="overview">
      <div className="workspace-overview">
        <header className="workspace-overview-masthead">
          <span className="workspace-overview-monogram" aria-hidden="true">A</span>
          <div className="workspace-overview-welcome">
            <h1 className="workspace-overview-thesis">{title}</h1>
            <p className="workspace-overview-introduction">{persona.introduction}</p>
          </div>
          {!loading && profile && (
            <div className="workspace-overview-profile-context">
              <span className="workspace-overview-profile-mark" aria-hidden="true" />
              <span>{persona.roleLabel}</span>
              {organizationName && <span>{organizationName}</span>}
            </div>
          )}
        </header>

        <section aria-label="Workspace modules" className="workspace-overview-modules">
          {MODULE_CARDS.map(card => (
            <Link
              key={card.id}
              className={`workspace-overview-module-card${card.featured ? ' workspace-overview-module-card--featured' : ''}`}
              href={card.href}
            >
              <span className="workspace-overview-module-icon" aria-hidden="true">
                {MODULE_ICONS[card.id]}
              </span>
              <span className="workspace-overview-module-copy">
                <span className="workspace-overview-module-name">{card.name}</span>
                <span className="workspace-overview-module-job">{card.job}</span>
              </span>
            </Link>
          ))}
        </section>

        <div className="workspace-overview-path-strip">
          <div className="workspace-overview-path-strip-header">
            <h2 className="workspace-overview-path-strip-title">{persona.pathTitle}</h2>
            <p className="workspace-overview-path-strip-desc">{persona.pathDescription}</p>
          </div>
          <ol className="workspace-overview-path-actions">
            {persona.actions.map(action => (
              <li key={action.href}>
                <Link className="workspace-overview-path-action" href={action.href}>
                  <small className="workspace-overview-path-action-stage">{action.stage}</small>
                  <strong className="workspace-overview-path-action-label">{action.label}</strong>
                  <span className="workspace-overview-path-action-desc">{action.description}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="workspace-overview-desk">
          <div className="workspace-overview-desk-header">
            <h3 className="workspace-overview-desk-title">On your desk</h3>
            <span className="workspace-overview-desk-notice">No linked updates</span>
          </div>
          <div className="workspace-overview-desk-empty">
            <span className="workspace-overview-desk-empty-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /></svg>
            </span>
            <div className="workspace-overview-desk-empty-copy">
              <h3>No linked updates yet</h3>
              <p>Personal assignments and review requests are not linked here yet. This space is reserved for work that needs your attention.</p>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
