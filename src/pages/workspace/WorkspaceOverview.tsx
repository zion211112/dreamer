import { Link } from 'wouter';
import { WorkspaceLayout } from './WorkspaceLayout';
import { WORKSPACE_OVERVIEW_ITEMS } from '../../lib/workspace-overview';

export function WorkspaceOverview() {
  return (
    <WorkspaceLayout currentContext="overview">
      <div className="workspace-overview">
        <header className="workspace-overview-heading">
          <h1>APT-LABS makes fragmented productive capacity visible.</h1>
          <p>
            One workspace for institutions, crews, and stewards to coordinate work â€” from need
            to verified outcome. Browser-local by design; all demo data labeled illustrative.
          </p>
        </header>

        <section aria-labelledby="workspace-surfaces-title" className="workspace-overview-surfaces">
          <header className="workspace-overview-section-heading">
            <h2 id="workspace-surfaces-title">Five working surfaces</h2>
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
                  Open <span aria-hidden="true">â†’</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
