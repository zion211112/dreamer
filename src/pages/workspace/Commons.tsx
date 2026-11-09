import { WorkspaceLayout } from './WorkspaceLayout';
import { PageHead } from '../../components/PageHead';

export function Commons() {
  return (
    <WorkspaceLayout currentContext="commons">
      <div className="signal-desk">
        <div className="signal-desk-head">
          <PageHead
            eyebrow="Commons"
            title="Signals & decisions"
            subtitle="Field signals triaged into opportunities and governance decisions for the active institution."
          />
          <div className="signal-head-actions">
            <div className="commons-contribute">
              <button
                className="signal-primary-action"
                type="button"
              >
                + Contribute
              </button>
            </div>
          </div>
        </div>

        <nav className="commons-modebar" aria-label="Commons views">
          <button
            aria-pressed={true}
            className="is-active"
            type="button"
          >
            Signals <span>0</span>
          </button>
          <button
            aria-pressed={false}
            type="button"
          >
            Opportunities
          </button>
          <button
            aria-pressed={false}
            type="button"
          >
            Decisions <span>0</span>
          </button>
        </nav>

        <section aria-label="Field signal workspace" className="signal-workspace">
          <div className="signal-queue">
            <div className="commons-signal-tools">
              <div className="signal-search">
                <span className="signal-search-icon" aria-hidden="true">&#8226;</span>
                <input
                  type="search"
                  placeholder="Search signalsâ€¦"
                  className="signal-search-input"
                  aria-label="Search signals"
                />
              </div>
              <details className="commons-signal-filter">
                <summary>Filter</summary>
                <div className="signal-filters">
                  <button type="button">All</button>
                  <button type="button">New</button>
                  <button type="button">Triaged</button>
                  <button type="button">Brief</button>
                </div>
              </details>
            </div>
            <ul className="signal-list" role="list">
              <li className="signal-list-item">
                <span className="signal-status-mark signal-status-new" aria-hidden="true"></span>
                <div className="signal-list-copy">
                  <strong>Community workshop bench capacity</strong>
                  <span className="commons-signal-meta">Kibera Makerspace Â· physical-asset</span>
                  <span className="commons-signal-meta">Signal â€¢ needs crew</span>
                </div>
                <span className="signal-list-date">2026-11</span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </WorkspaceLayout>
  );
}
