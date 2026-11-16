interface CommonsOpportunitiesProps {
  selectedOpportunityId: string;
  setSelectedOpportunityId: (id: string) => void;
}

type WorkDiscipline = 'Animation' | 'Software' | 'Fabrication';

interface CommonsOpportunity {
  id: string;
  title: string;
  context: string;
  discipline: WorkDiscipline;
  summary: string;
  scope: string;
  deliverables: string[];
  capability: string[];
  terms: string;
  payment: string;
  acceptance: string;
}

const COMMONS_OPPORTUNITIES: CommonsOpportunity[] = [
  {
    id: 'school-learning-animation',
    title: 'School learning animations',
    context: 'School Console · learning',
    discipline: 'Animation',
    summary: 'Turn a challenging classroom concept into a concise visual explanation educators can use.',
    scope: 'Develop a storyboard and short animation for a learning objective selected with educators. The publishing institution sets scope, rights, and engagement terms in its brief.',
    deliverables: ['Storyboard', 'Short animation', 'Source files and attribution note'],
    capability: ['Storyboarding', '2D or motion design', 'Learning-focused communication'],
    terms: 'The institution must disclose paid or unpaid status, fee, payment trigger, expenses, and rights before a real application is opened.',
    payment: 'Not specified in this local workflow',
    acceptance: 'The selected learning objective is addressed; the institution reviews the agreed format, accessibility, and attribution.',
  },
  {
    id: 'kemetos-agi1-software',
    title: 'Kemetos AGI1',
    context: 'Kemetos AGI1 · software',
    discipline: 'Software',
    summary: 'Contribute a bounded engineering or research task to the AGI1 workstream.',
    scope: 'The institution defines a specific issue, repository or research boundary, review method, and contribution rights before the work is authorized.',
    deliverables: ['Implementation or research note', 'Test or verification evidence', 'Contribution summary'],
    capability: ['Software development', 'Technical documentation', 'Research'],
    terms: 'The institution must disclose paid or unpaid status, fee, payment trigger, expenses, and rights before a real application is opened.',
    payment: 'Not specified in this local workflow',
    acceptance: 'The agreed change or research result is reviewed against the brief and its stated verification criteria.',
  },
  {
    id: 'thiba-hydro-fabrication',
    title: 'Thiba Hydro',
    context: 'Thiba Hydro · fabrication',
    discipline: 'Fabrication',
    summary: 'Prepare and deliver a fabrication task against a defined site, safety, and inspection scope.',
    scope: 'The institution defines the fabrication requirement, site access, safety controls, materials, inspection method, and engagement terms before authorization.',
    deliverables: ['Fabrication plan', 'Completed work evidence', 'Inspection and safety record'],
    capability: ['Fabrication', 'Site coordination', 'Safety and quality control'],
    terms: 'The institution must disclose paid or unpaid status, fee, payment trigger, expenses, and rights before a real application is opened.',
    payment: 'Not specified in this local workflow',
    acceptance: 'The institution inspects the delivery against the agreed dimensions, material requirements, safety controls, and evidence.',
  },
];

export function CommonsOpportunities({
  selectedOpportunityId,
  setSelectedOpportunityId,
}: CommonsOpportunitiesProps) {
  const selectedOpportunity = COMMONS_OPPORTUNITIES.find((opportunity) => opportunity.id === selectedOpportunityId)
    ?? COMMONS_OPPORTUNITIES[0];

  return (
    <section aria-labelledby="commons-opportunities-title" className="commons-opportunities">
      <header className="commons-opportunities-head">
        <div>
          <p className="eyebrow">Commons · opportunities</p>
          <h2 id="commons-opportunities-title">Example opportunities</h2>
        </div>
        <span>Not open for applications</span>
      </header>
      <div className="commons-opportunity-workspace">
        <nav aria-label="Example work contexts" className="commons-opportunity-list">
          {COMMONS_OPPORTUNITIES.map((opportunity) => (
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
              <dd>{selectedOpportunity.deliverables.join(', ')}</dd>
            </div>
            <div>
              <dt>Skills</dt>
              <dd>{selectedOpportunity.capability.join(', ')}</dd>
            </div>
          </dl>
          <p className="commons-opportunity-disclosure">Example only · Terms not published · No application or work is open.</p>
        </article>
      </div>
    </section>
  );
}
