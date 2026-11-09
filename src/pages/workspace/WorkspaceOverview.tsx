import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { WORKSPACE_OVERVIEW_ITEMS } from '../../lib/workspace-overview';

export function WorkspaceOverview() {
  return (
    <WorkspaceLayout currentContext="overview">
      <div className="workspace-overview">
        <header className="workspace-overview-heading">
          <p className="workspace-overview-eyebrow">APT-LABS / WORKSPACE</p>
          <h1>Work, made legible.</h1>
          <p>
            Connect local capacity to meaningful work, and keep the evidence and decisions
            around it clear.
          </p>
        </header>

        <section aria-labelledby="workspace-surfaces-title" className="workspace-overview-surfaces">
          <header className="workspace-overview-section-heading">
            <h2 id="workspace-surfaces-title">Five working surfaces</h2>
            <span>ONE SHARED SYSTEM</span>
          </header>
          <ol className="workspace-overview-module-list">
            {WORKSPACE_OVERVIEW_ITEMS.map((item, index) => (
              <li className="workspace-overview-module" key={item.moduleId}>
                <span aria-hidden="true" className="workspace-overview-module-index">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="workspace-overview-module-copy">
                  <h3>{item.label}</h3>
                  <p>{item.summary}</p>
                </div>
                <Link
                  aria-label={`Open ${item.label}`}
                  className="workspace-overview-module-link"
                  href={item.href}
                >
                  Open <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
