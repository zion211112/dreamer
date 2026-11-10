import { Link } from 'wouter';
import { useAuth } from '../../lib/auth/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { WORKSPACE_HOME_START_ACTIONS } from '../../lib/workspace-overview';

export function WorkspaceOverview() {
  const { profile, loading } = useAuth();
  const displayName = profile?.display_name.trim();
  const profileContext = [
    profile?.role ? `${profile.role[0].toUpperCase()}${profile.role.slice(1)}` : null,
    profile?.organization_name?.trim(),
  ].filter(Boolean).join(' · ');

  return (
    <WorkspaceLayout currentContext="overview">
      <div className="workspace-overview">
        <header className="workspace-overview-heading">
          <p className="workspace-overview-kicker">APT-LABS workspace</p>
          <h1>
            {loading
              ? 'Your workspace'
              : displayName
                ? `Welcome, ${displayName}.`
                : 'Welcome to APT-LABS.'}
          </h1>
          {!loading && profileContext && (
            <p className="workspace-overview-profile-context">{profileContext}</p>
          )}
        </header>

        <div className="workspace-overview-home-grid">
          <section aria-labelledby="workspace-your-work-title" className="workspace-overview-work">
            <h2 id="workspace-your-work-title">Your work</h2>
            <p>
              Personal assignments and review requests are not connected here yet. When work is
              linked to your profile, it will appear in this space.
            </p>
          </section>

          <nav aria-labelledby="workspace-start-title" className="workspace-overview-start">
            <h2 id="workspace-start-title">A useful first step</h2>
            {WORKSPACE_HOME_START_ACTIONS.map(action => (
              <Link className="workspace-overview-start-link" href={action.href} key={action.href}>
                <span>
                  <strong>{action.label}</strong>
                  <small>{action.description}</small>
                </span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
