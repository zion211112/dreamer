import { Link } from 'wouter';
import { useAuth } from '../../lib/auth/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { getWorkspaceHomePersona } from '../../lib/workspace-overview';

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
        <header className="workspace-overview-heading">
          <div className="workspace-overview-welcome">
            <h1>{title}</h1>
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

        <div className="workspace-overview-home-grid">
          <section aria-labelledby="workspace-updates-title" className="workspace-overview-updates">
            <div className="workspace-overview-section-heading">
              <h2 id="workspace-updates-title">On your desk</h2>
              <span className="workspace-overview-updates-context">No linked updates</span>
            </div>
            <div className="workspace-overview-updates-empty">
              <span className="workspace-overview-updates-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /></svg>
              </span>
              <div>
                <h3>No linked updates yet</h3>
                <p>Personal assignments and review requests are not linked here yet. This space is reserved for work that needs your attention.</p>
              </div>
            </div>
          </section>

          <section aria-labelledby="workspace-next-title" className="workspace-overview-next">
            <div className="workspace-overview-section-heading">
              <div>
                <h2 id="workspace-next-title">{persona.pathTitle}</h2>
                <p>{persona.pathDescription}</p>
              </div>
            </div>
            <div className="workspace-overview-path">
              <svg className="workspace-overview-path-line" viewBox="0 0 1000 80" preserveAspectRatio="none" aria-hidden="true">
                <path d="M150 40C260 4 365 4 500 40S740 76 850 40" />
                <path d="M150 40C260 4 365 4 500 40S740 76 850 40" />
              </svg>
              <ol className="workspace-overview-action-list">
              {persona.actions.map(action => (
                <li key={action.href}>
                  <Link className="workspace-overview-action" href={action.href}>
                    <span className="workspace-overview-action-node" aria-hidden="true" />
                    <span className="workspace-overview-action-copy">
                      <small className="workspace-overview-action-stage">{action.stage}</small>
                      <strong>{action.label}</strong>
                      <span>{action.description}</span>
                    </span>
                    <span className="workspace-overview-action-arrow" aria-hidden="true">&rarr;</span>
                  </Link>
                </li>
              ))}
              </ol>
            </div>
          </section>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
