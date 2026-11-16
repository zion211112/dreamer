import { Link } from 'wouter';
import { useAuth } from '../../lib/auth/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { getWorkspaceHomePersona } from '../../lib/workspace-overview';
import { ArrowRight } from 'lucide-preact';

export function WorkspaceOverview() {
  const { profile, loading } = useAuth();
  const persona = getWorkspaceHomePersona(profile?.role);
  const organizationName = profile?.organization_name?.trim();

  return (
    <WorkspaceLayout currentContext="overview">
      <div className="workspace-overview">
        <header className="workspace-overview-header">
          <h1 className="workspace-overview-title">Workspace</h1>
          {!loading && profile && (
            <div className="workspace-overview-profile-context">
              <span className="workspace-overview-profile-mark" aria-hidden="true" />
              <span>{persona.roleLabel}</span>
              {organizationName && <span>{organizationName}</span>}
            </div>
          )}
        </header>

        <div className="workspace-overview-content">
          <section aria-labelledby="workspace-actions-title" className="workspace-overview-actions">
            <h2 id="workspace-actions-title">Quick actions</h2>
            <ul>
              {persona.actions.map(action => (
                <li key={action.href}>
                  <Link href={action.href}>
                    <span>{action.label}</span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="workspace-updates-title" className="workspace-overview-updates">
            <h2 id="workspace-updates-title">Updates</h2>
            <p>No linked updates</p>
          </section>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
