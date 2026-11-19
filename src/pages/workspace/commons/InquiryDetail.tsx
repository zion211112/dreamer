import { Button } from '@/components/ui/Button';

type ContributionType = 'Evidence' | 'Experience' | 'Question' | 'Counterpoint' | 'Method' | 'Proposal';

type Inquiry = {
  id: string;
  type: 'Need' | 'Question' | 'Opportunity';
  title: string;
  location: string;
  institution: string;
  lifecycle: 'Open' | 'Examining' | 'Synthesis' | 'Brief ready' | 'Handed off' | 'Closed';
  knowledgeStatus: 'Reported Experience' | 'Supported' | 'Independently Verified' | 'Disputed' | 'Unknown';
  context: string;
  desiredOutcome: string;
  contributions: Array<{ id: string; type: ContributionType; author: string; role: string; text: string; at: string; }>;
  linkedKnowledge: Array<{ id: string; title: string; type: string; }>;
  brief?: {
    problem: string;
    context: string;
    existingKnowledge: string;
    previousApproaches: string;
    unknowns: string;
    approaches: string;
    actors: string;
    nextStep: string;
  };
};

const INQUIRIES: Inquiry[] = [
  {
    id: 'inquiry-1',
    type: 'Question',
    title: 'How can small producers share processing capacity without losing control of their produce?',
    location: 'Kirinyaga',
    institution: 'Kirinyaga cooperative',
    lifecycle: 'Examining',
    knowledgeStatus: 'Supported',
    context: 'A cooperative in Kirinyaga asks whether a shared milling facility can be governed so every farmer retains ownership of their harvest through the process.',
    desiredOutcome: 'A governance model where farmers retain control while sharing processing capacity.',
    contributions: [
      { id: 'c1', type: 'Evidence', author: 'Milling capacity log', role: 'Source document', text: 'Source document with scope attached.', at: '2026-09-20' },
      { id: 'c2', type: 'Experience', author: 'Lucia Santos', role: 'Facilitator', text: 'Ran a similar shared-processing model in Oaxaca.', at: '2026-09-18' },
      { id: 'c3', type: 'Question', author: 'Kwame Mensah', role: 'Researcher', text: 'Who sets the pricing rule?', at: '2026-09-17' },
      { id: 'c4', type: 'Counterpoint', author: 'Grower rep.', role: 'Member', text: 'Shared use raised spoilage last year.', at: '2026-09-16' },
      { id: 'c5', type: 'Method', author: 'Jabari Otieno', role: 'Technician', text: 'Scheduled access windows with per-farmer metering.', at: '2026-09-15' },
      { id: 'c6', type: 'Proposal', author: 'Steward', role: 'Institution', text: 'Pilot a three-farmer shared mill with metered access.', at: '2026-09-14' },
    ],
    linkedKnowledge: [
      { id: 'knowledge-2', title: 'Tool circulation log — shared equipment stewardship', type: 'Practice' },
      { id: 'knowledge-3', title: 'Water resilience audit — field research method', type: 'Guide' },
    ],
    brief: {
      problem: 'Small producers lack processing capacity and risk losing control of produce when sharing facilities.',
      context: 'Kirinyaga cooperative; peak harvest wet season; 12 smallholder farmers affected.',
      existingKnowledge: 'Shared equipment stewardship practices and water resilience audit method available in Knowledge House.',
      previousApproaches: 'Spoilage reported under ungoverned shared use last year.',
      unknowns: 'Pricing rule authority; spoilage mitigation under wet conditions.',
      approaches: 'Scheduled access windows with per-farmer metering; three-farmer pilot shared mill.',
      actors: 'Lucia Santos (facilitator), Kwame Mensah (researcher), Jabari Otieno (technician), Kirinyaga cooperative.',
      nextStep: 'Develop a defined, testable undertaking and hand off to Workbench.',
    },
  },
  {
    id: 'inquiry-2',
    type: 'Need',
    title: 'Reducing post-harvest rice losses in the short Mwea wet window',
    location: 'Mwea',
    institution: 'Mwea Water Coop',
    lifecycle: 'Synthesis',
    knowledgeStatus: 'Independently Verified',
    context: 'Mwea smallholders lose paddy to moisture, handling and timing during the short wet window.',
    desiredOutcome: 'A drying and storage method that survives the wet window without spoilage.',
    contributions: [
      { id: 'c7', type: 'Evidence', author: 'Inverter load-test record', role: 'Source', text: 'Measured output and test conditions.', at: '2026-09-12' },
      { id: 'c8', type: 'Experience', author: 'Mwea farmer', role: 'Practitioner', text: 'Raised drying beds outperformed tarp spreading last season.', at: '2026-09-10' },
    ],
    linkedKnowledge: [
      { id: 'knowledge-1', title: 'Inverter load-test record — microgrid commissioning', type: 'Case' },
    ],
    brief: {
      problem: 'Post-harvest rice losses during the short Mwea wet window.',
      context: 'Mwea; moisture, handling and timing constraints.',
      existingKnowledge: 'Inverter load-test record and seasonal drying judgement available.',
      previousApproaches: 'Tarp spreading failed under wet conditions.',
      unknowns: 'Optimal raised-bed design for smallholder budgets.',
      approaches: 'Raised drying beds vs. tarp spreading by season; solar-drying capacity planning.',
      actors: 'Mwea Water Coop; smallholder farmers.',
      nextStep: 'Brief ready — authorise pilot in Workbench.',
    },
  },
];

function inquiryTypeColor(t: string) {
  switch (t) {
    case 'Need': return { bg: 'var(--clay-pale)', color: 'var(--clay)', border: 'var(--clay-pale)' };
    case 'Question': return { bg: 'var(--olive-pale)', color: 'var(--olive)', border: 'var(--olive-pale)' };
    default: return { bg: 'var(--brass-pale)', color: 'var(--brass)', border: 'var(--brass-pale)' };
  }
}

function lifecycleColor(l: string) {
  switch (l) {
    case 'Brief ready': return { bg: 'var(--brass-pale)', color: 'var(--brass)', border: 'var(--brass-pale)' };
    case 'Handed off': return { bg: 'var(--olive-pale)', color: 'var(--olive)', border: 'var(--olive-pale)' };
    case 'Closed': return { bg: 'var(--sage-pale)', color: 'var(--sage)', border: 'var(--sage-pale)' };
    default: return { bg: 'var(--bg-subtle)', color: 'var(--dim)', border: 'var(--line)' };
  }
}

function contribColor(t: ContributionType) {
  switch (t) {
    case 'Evidence': return { bg: 'var(--olive-pale)', color: 'var(--olive)', border: 'var(--olive-pale)' };
    case 'Experience': return { bg: 'var(--sage-pale)', color: 'var(--sage)', border: 'var(--sage-pale)' };
    case 'Question': return { bg: 'var(--brass-pale)', color: 'var(--brass)', border: 'var(--brass-pale)' };
    case 'Counterpoint': return { bg: 'var(--clay-pale)', color: 'var(--clay)', border: 'var(--clay-pale)' };
    case 'Method': return { bg: 'var(--sage-pale)', color: 'var(--sage)', border: 'var(--sage-pale)' };
    default: return { bg: 'var(--brass-pale)', color: 'var(--brass)', border: 'var(--brass-pale)' };
  }
}

export function InquiryDetail({ inquiryId, onBack, onHandOff }: { inquiryId: string; onBack: () => void; onHandOff: (inquiry: Inquiry) => void }) {
  const inquiry = INQUIRIES.find((i) => i.id === inquiryId);
  if (!inquiry) return null;
  const it = inquiryTypeColor(inquiry.type);
  const lc = lifecycleColor(inquiry.lifecycle);

  return (
    <article className="inquiry-detail">
      <header className="inquiry-detail-head">
        <button className="inquiry-detail-back" onClick={onBack} type="button">← Back to inquiries</button>
        <div className="inquiry-detail-kickers">
          <span style={{ ...it, borderColor: it.border }} className="inquiry-type-chip">{inquiry.type}</span>
          <span style={{ ...lc, borderColor: lc.border }} className="inquiry-lifecycle-chip">{inquiry.lifecycle}</span>
        </div>
        <h1>{inquiry.title}</h1>
        <div className="inquiry-detail-meta">
          <span>{inquiry.location}</span>
          <span>·</span>
          <span>{inquiry.institution}</span>
        </div>
      </header>

      <div className="inquiry-detail-body">
        <section className="inquiry-section">
          <p className="inquiry-section-eyebrow">Context</p>
          <p className="inquiry-section-lead">{inquiry.context}</p>
          <p className="inquiry-section-lead"><strong>Desired outcome:</strong> {inquiry.desiredOutcome}</p>
        </section>

        <section className="inquiry-section">
          <div className="inquiry-section-head">
            <p className="inquiry-section-eyebrow">Structured contributions ({inquiry.contributions.length})</p>
            <span className="inquiry-contrib-count">{inquiry.contributions.length}</span>
          </div>
          <div className="inquiry-contributions">
            {inquiry.contributions.map((c) => {
              const cc = contribColor(c.type);
              return (
                <div key={c.id} className="inquiry-contribution">
                  <span style={{ ...cc, borderColor: cc.border }} className="inquiry-contrib-type">{c.type}</span>
                  <div>
                    <strong>{c.author}</strong>
                    <span className="inquiry-contrib-role">{c.role}</span>
                    <p className="inquiry-contrib-text">{c.text}</p>
                    <span className="inquiry-contrib-at">{c.at}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="inquiry-section">
          <div className="inquiry-section-head">
            <p className="inquiry-section-eyebrow">Connected knowledge</p>
            <span className="inquiry-link-count">{inquiry.linkedKnowledge.length}</span>
          </div>
          <div className="inquiry-linked-knowledge">
            {inquiry.linkedKnowledge.map((k) => (
              <a key={k.id} href="#" className="inquiry-linked-item">
                <span className="inquiry-linked-type">{k.type}</span>
                <span className="inquiry-linked-title">{k.title}</span>
              </a>
            ))}
          </div>
        </section>
      </div>

      {inquiry.brief && (
        <section className="inquiry-section inquiry-brief">
          <div className="inquiry-section-head">
            <p className="inquiry-section-eyebrow">Opportunity Brief</p>
            <span className="inquiry-brief-status">Ready for consideration · not an approval</span>
          </div>
          <div className="inquiry-brief-grid">
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">Problem or opportunity</span>
              <p className="inquiry-brief-text">{inquiry.brief.problem}</p>
            </div>
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">Context & participants</span>
              <p className="inquiry-brief-text">{inquiry.brief.context}</p>
            </div>
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">Existing knowledge & evidence</span>
              <p className="inquiry-brief-text">{inquiry.brief.existingKnowledge}</p>
            </div>
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">Previous approaches & outcomes</span>
              <p className="inquiry-brief-text">{inquiry.brief.previousApproaches}</p>
            </div>
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">What remains unknown</span>
              <p className="inquiry-brief-text">{inquiry.brief.unknowns}</p>
            </div>
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">Possible approaches & trade-offs</span>
              <p className="inquiry-brief-text">{inquiry.brief.approaches}</p>
            </div>
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">Potential actors & resources</span>
              <p className="inquiry-brief-text">{inquiry.brief.actors}</p>
            </div>
            <div className="inquiry-brief-card">
              <span className="inquiry-brief-label">Suggested next step</span>
              <p className="inquiry-brief-text">{inquiry.brief.nextStep}</p>
            </div>
          </div>
          <div className="inquiry-brief-actions">
            <Button variant="primary" onClick={() => onHandOff(inquiry)} type="button">
              Hand off to Workbench
            </Button>
            <Button variant="ghost" type="button">Export brief</Button>
          </div>
        </section>
      )}

        <footer className="inquiry-detail-foot">
        <Button variant="ghost" onClick={onBack} type="button">Back to inquiries</Button>
        <span className="inquiry-detail-id">ID: {inquiry.id}</span>
      </footer>
    </article>
  );
}
