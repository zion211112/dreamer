import { Link } from 'wouter';
import { useAuth } from '../../lib/auth/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { getWorkspaceHomePersona } from '../../lib/workspace-overview';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Archive,
  Activity,
} from 'lucide-preact';

interface ModuleCard {
  id: string;
  name: string;
  job: string;
  href: string;
  featured?: boolean;
}

const MODULE_ICONS: Record<string, any> = {
  commons: LayoutDashboard,
  network: Users,
  workbench: Briefcase,
  records: Archive,
  intelligence: Activity,
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
          {MODULE_CARDS.map(card => {
            const Icon = MODULE_ICONS[card.id];
            return (
              <Link
                key={card.id}
                className={`workspace-overview-module-card${card.featured ? ' workspace-overview-module-card--featured' : ''}`}
                href={card.href}
              >
                <span className="workspace-overview-module-icon" aria-hidden="true">
                  <Icon />
                </span>
              <span className="workspace-overview-module-copy">
                <span className="workspace-overview-module-name">{card.name}</span>
                <span className="workspace-overview-module-job">{card.job}</span>
                </span>
              </Link>
            );
          })}
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

        <section aria-label="Six structures of productive work" className="workspace-overview-structures">
          <h2 className="workspace-overview-structures-title">The six structures</h2>
          <p className="workspace-overview-structures-desc">
            Every undertaking in APT-LABS is made legible through these six structures. They are not departments — they are the things that exist whether or not anyone names them.
          </p>
          <div className="workspace-overview-structures-grid">
            <div className="workspace-structure">
              <span className="workspace-structure-mark" aria-hidden="true">◉</span>
              <h4 className="workspace-structure-name">Actors</h4>
              <p className="workspace-structure-desc">People, crews, institutions — who can act and under what authority.</p>
            </div>
            <div className="workspace-structure">
              <span className="workspace-structure-mark" aria-hidden="true">◎</span>
              <h4 className="workspace-structure-name">Resources</h4>
              <p className="workspace-structure-desc">Materials, equipment, capital — what is contributed and consumed.</p>
            </div>
            <div className="workspace-structure">
              <span className="workspace-structure-mark" aria-hidden="true">●</span>
              <h4 className="workspace-structure-name">Intentions</h4>
              <p className="workspace-structure-desc">Needs, signals, proposals — what is wanted and why.</p>
            </div>
            <div className="workspace-structure">
              <span className="workspace-structure-mark" aria-hidden="true">◐</span>
              <h4 className="workspace-structure-name">Commitments</h4>
              <p className="workspace-structure-desc">Obligations accepted, rates agreed, escrow locked.</p>
            </div>
            <div className="workspace-structure">
              <span className="workspace-structure-mark" aria-hidden="true">◑</span>
              <h4 className="workspace-structure-name">Activity</h4>
              <p className="workspace-structure-desc">Work in motion — gate by gate, execution to acceptance.</p>
            </div>
            <div className="workspace-structure">
              <span className="workspace-structure-mark" aria-hidden="true">○</span>
              <h4 className="workspace-structure-name">Knowledge</h4>
              <p className="workspace-structure-desc">Lessons, designs, criteria carried into the next undertaking.</p>
            </div>
          </div>
        </section>

        <section aria-label="Production grammar" className="workspace-overview-grammar">
          <h2 className="workspace-overview-grammar-title">Production grammar</h2>
          <p className="workspace-overview-grammar-desc">
            An undertaking moves through eight stages. Acceptance is not settlement; settlement is not learning.
          </p>
          <ol className="workspace-overview-grammar-steps">
            <li className="workspace-grammar-step is-current">
              <span className="workspace-grammar-step-number">01</span>
              <span className="workspace-grammar-step-label">Intake</span>
            </li>
            <li className="workspace-grammar-step">
              <span className="workspace-grammar-step-number">02</span>
              <span className="workspace-grammar-step-label">Diagnose</span>
            </li>
            <li className="workspace-grammar-step">
              <span className="workspace-grammar-step-number">03</span>
              <span className="workspace-grammar-step-label">Compose</span>
            </li>
            <li className="workspace-grammar-step">
              <span className="workspace-grammar-step-number">04</span>
              <span className="workspace-grammar-step-label">Authorise</span>
            </li>
            <li className="workspace-grammar-step">
              <span className="workspace-grammar-step-number">05</span>
              <span className="workspace-grammar-step-label">Produce</span>
            </li>
            <li className="workspace-grammar-step">
              <span className="workspace-grammar-step-number">06</span>
              <span className="workspace-grammar-step-label">Inspect</span>
            </li>
            <li className="workspace-grammar-step">
              <span className="workspace-grammar-step-number">07</span>
              <span className="workspace-grammar-step-label">Settle</span>
            </li>
            <li className="workspace-grammar-step">
              <span className="workspace-grammar-step-number">08</span>
              <span className="workspace-grammar-step-label">Learn</span>
            </li>
          </ol>
        </section>

        <div className="workspace-overview-desk">
          <div className="workspace-overview-desk-header">
            <h3 className="workspace-overview-desk-title">On your desk</h3>
            <span className="workspace-overview-desk-notice">No linked updates</span>
          </div>
          <div className="workspace-overview-desk-empty">
            <span className="workspace-overview-desk-empty-mark" aria-hidden="true">
              <Activity />
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
