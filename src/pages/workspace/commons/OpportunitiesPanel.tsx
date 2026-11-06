import { WORK_OPPORTUNITIES } from '../../../lib/local-workbench';

interface CommonsOpportunitiesProps {
  selectedOpportunityId: string;
  setSelectedOpportunityId: (id: string) => void;
}

export function CommonsOpportunities({
  selectedOpportunityId,
  setSelectedOpportunityId,
}: CommonsOpportunitiesProps) {
  const selectedOpportunity = WORK_OPPORTUNITIES.find(opportunity => opportunity.id === selectedOpportunityId)
    ?? WORK_OPPORTUNITIES[0];

  return (
    <section aria-labelledby="commons-opportunities-title" className="commons-opportunities">
      <header className="commons-opportunities-head">
        <div>
          <p className="eyebrow">COMMONS / OPPORTUNITIES</p>
          <h2 id="commons-opportunities-title">Example opportunities</h2>
        </div>
        <span>Not open for applications</span>
      </header>
      <div className="commons-opportunity-workspace">
        <nav aria-label="Example work contexts" className="commons-opportunity-list">
          {WORK_OPPORTUNITIES.map(opportunity => (
            <button
              aria-pressed={selectedOpportunity.id === opportunity.id}
              className={selectedOpportunity.id === opportunity.id ? 'is-selected' : ''}
              key={opportunity.id}
              onClick={() => setSelectedOpportunityId(opportunity.id)}
              type="button"
            >
              <span>{opportunity.discipline} · Example</span>
              <strong>{opportunity.title}</strong>
              <small>{opportunity.context}</small>
            </button>
          ))}
        </nav>
        <article className="commons-opportunity-detail">
          <div className="commons-opportunity-meta">
            <span>{selectedOpportunity.discipline}</span>
            <span>Example path</span>
          </div>
          <h3>{selectedOpportunity.title}</h3>
          <p>{selectedOpportunity.summary}</p>
          <dl>
            <div>
              <dt>Scope</dt>
              <dd>{selectedOpportunity.scope}</dd>
            </div>
            <div>
              <dt>What it could produce</dt>
              <dd>{selectedOpportunity.deliverables.join(' · ')}</dd>
            </div>
            <div>
              <dt>Skills</dt>
              <dd>{selectedOpportunity.capability.join(' · ')}</dd>
            </div>
          </dl>
          <p className="commons-opportunity-disclosure">Example only · Terms not published · No application or work is open.</p>
        </article>
      </div>
    </section>
  );
}
