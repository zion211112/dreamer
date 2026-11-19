import { Button } from '@/components/ui/Button';

type KnowledgeItem = {
  id: string;
  type: 'Case' | 'Practice' | 'Guide' | 'Template';
  title: string;
  location: string;
  subject: string;
  knowledgeStatus: 'Reported Experience' | 'Supported' | 'Independently Verified' | 'Disputed' | 'Unknown';
  editorialStatus: 'Draft' | 'Submitted' | 'Under Review' | 'Published' | 'Archived';
  author: string;
  summary: string;
  context: string;
  evidence: string[];
  contributors: Array<{ role: string; name: string; text: string; }>;
  createdAt: string;
};

const KNOWLEDGE: KnowledgeItem[] = [
  {
    id: 'knowledge-1',
    type: 'Case',
    title: 'Inverter load-test record — microgrid commissioning',
    location: 'Nairobi',
    subject: 'Energy',
    knowledgeStatus: 'Independently Verified',
    editorialStatus: 'Published',
    author: 'Field Systems Crew',
    summary: 'Measured output, test conditions and review trail for shared grid handover.',
    context: 'Microgrid commissioning work by the Field Systems Crew; load-test record documents measured output and conditions.',
    evidence: ['Inverter load-test record (measured output, test conditions)', 'Commissioning record review trail'],
    contributors: [
      { role: 'Author', name: 'Field Systems Crew', text: 'Commissioned the microgrid and recorded load-test measurements.' },
      { role: 'Verification', name: 'Workbench simulation', text: 'Cross-checked against simulated production profile.' },
    ],
    createdAt: '2026-09-14T00:00:00.000Z',
  },
  {
    id: 'knowledge-2',
    type: 'Practice',
    title: 'Tool circulation log — shared equipment stewardship',
    location: 'Nairobi',
    subject: 'Shared equipment',
    knowledgeStatus: 'Supported',
    editorialStatus: 'Published',
    author: 'Open Knowledge Stewards',
    summary: 'A register of shared tool use, maintenance notes and access history.',
    context: 'Maintained by the Open Knowledge Stewards crew as part of commons publishing.',
    evidence: ['Tool circulation log (equipment history, maintenance notes)', 'Community review notes'],
    contributors: [
      { role: 'Author', name: 'Yuki Tanaka', text: 'Stewards the community tool library and open documentation.' },
      { role: 'Experience', name: 'Mtaa Repair Circle', text: 'Peer learning around shared tool use.' },
    ],
    createdAt: '2026-08-22T00:00:00.000Z',
  },
  {
    id: 'knowledge-3',
    type: 'Guide',
    title: 'Water resilience audit — field research method',
    location: 'Accra',
    subject: 'Water systems',
    knowledgeStatus: 'Supported',
    editorialStatus: 'Published',
    author: 'Kwame Mensah',
    summary: 'Practical assessment of shared water infrastructure and maintenance needs.',
    context: 'Field research method documented by water systems researcher Kwame Mensah.',
    evidence: ['Water resilience audit report', 'Site survey notes'],
    contributors: [
      { role: 'Author', name: 'Kwame Mensah', text: 'Documents local conditions and technical verification.' },
    ],
    createdAt: '2026-07-10T00:00:00.000Z',
  },
  {
    id: 'knowledge-4',
    type: 'Practice',
    title: 'Repair guide & community workshop',
    location: 'Nairobi',
    subject: 'Repair',
    knowledgeStatus: 'Independently Verified',
    editorialStatus: 'Published',
    author: 'Lucia Santos',
    summary: 'An open, locally tested guide paired with a neighborhood repair workshop.',
    context: 'Co-authored by Lucia Santos with the Mtaa Repair Circle; curated by Open Knowledge Stewards.',
    evidence: ['Repair guide & workshop documentation', 'Community review notes'],
    contributors: [
      { role: 'Author', name: 'Lucia Santos', text: 'Co-operative facilitator; co-authors the repair guide.' },
      { role: 'Curation', name: 'Open Knowledge Stewards', text: 'Curates commons publishing.' },
    ],
    createdAt: '2026-06-05T00:00:00.000Z',
  },
];

function statusColor(status: string) {
  switch (status) {
    case 'Independently Verified': return { bg: 'var(--olive-pale)', color: 'var(--olive)', border: 'var(--olive-pale)' };
    case 'Supported': return { bg: 'var(--sage-pale)', color: 'var(--sage)', border: 'var(--sage-pale)' };
    case 'Reported Experience': return { bg: 'var(--brass-pale)', color: 'var(--brass)', border: 'var(--brass-pale)' };
    case 'Disputed': return { bg: 'var(--clay-pale)', color: 'var(--clay)', border: 'var(--clay-pale)' };
    default: return { bg: 'var(--bg-subtle)', color: 'var(--dim)', border: 'var(--line)' };
  }
}

export function KnowledgeDetail({ itemId, onBack }: { itemId: string; onBack: () => void }) {
  const item = KNOWLEDGE.find((i) => i.id === itemId);
  if (!item) return null;
  const st = statusColor(item.knowledgeStatus);

  return (
    <article className="knowledge-detail">
      <header className="knowledge-detail-head">
        <button className="knowledge-detail-back" onClick={onBack} type="button">← Back to knowledge</button>
        <div className="knowledge-detail-kickers">
          <span className={`knowledge-type-chip ${item.type}`}>{item.type}</span>
          <span style={{ ...st, borderColor: st.border }} className="knowledge-status-chip">{item.knowledgeStatus}</span>
          <span className="knowledge-editorial-chip">{item.editorialStatus}</span>
        </div>
        <h1>{item.title}</h1>
        <div className="knowledge-detail-meta">
          <span>{item.location}</span>
          <span>·</span>
          <span>{item.subject}</span>
          <span>·</span>
          <span>By {item.author}</span>
        </div>
      </header>

      <div className="knowledge-detail-body">
        <section className="knowledge-section">
          <p className="knowledge-section-eyebrow">Summary</p>
          <p className="knowledge-section-lead">{item.summary}</p>
        </section>

        <section className="knowledge-section">
          <div className="knowledge-section-head">
            <p className="knowledge-section-eyebrow">Context</p>
            <a href="#" className="knowledge-edit-link">Edit context →</a>
          </div>
          <p className="knowledge-section-lead">{item.context}</p>
        </section>

        <section className="knowledge-section">
          <div className="knowledge-section-head">
            <p className="knowledge-section-eyebrow">Evidence</p>
            <span className="knowledge-evidence-count">{item.evidence.length} sources</span>
          </div>
          <ul className="knowledge-evidence-list">
            {item.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </section>

        <section className="knowledge-section">
          <div className="knowledge-section-head">
            <p className="knowledge-section-eyebrow">Contributors & provenance</p>
            <span className="knowledge-contrib-count">{item.contributors.length}</span>
          </div>
          <div className="knowledge-contributors">
            {item.contributors.map((c, i) => (
              <div key={i} className="knowledge-contributor">
                <span className="knowledge-contrib-role">{c.role}</span>
                <div>
                  <strong>{c.name}</strong>
                  <p className="knowledge-contrib-text">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="knowledge-detail-foot">
        <Button variant="ghost" onClick={onBack} type="button">Back to knowledge commons</Button>
        <span className="knowledge-detail-id">ID: {item.id} · {new Date(item.createdAt).toLocaleDateString()}</span>
      </footer>
    </article>
  );
}
