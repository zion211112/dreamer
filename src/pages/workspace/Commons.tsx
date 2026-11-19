import { useState } from 'preact/hooks';
import { WorkspaceLayout } from './WorkspaceLayout';
import { Button } from '@/components/ui/Button';
import { CommonsArrival } from './commons/CommonsArrival';
import { useCommons } from './commons/useCommons';
import { KnowledgeDetail } from './commons/KnowledgeDetail';
import { InquiryDetail } from './commons/InquiryDetail';
import { createUndertakingFromProposal, registerUndertaking } from '@/modules/workbench';

export function Commons() {
  const {
    commonsView,
    setCommonsView,
    setSelectedId,
    setShowContributionMenu,
    setSearch,
    visibleSignals,
    selected,
    actorEmail,
    setError,
    navigate,
  } = useCommons();

  const [detailView, setDetailView] = useState<'knowledge' | 'inquiry' | null>(null);
  const [detailId, setDetailId] = useState<string>('');

  function handleHandOff(inquiry: any) {
    const proposal = {
      id: `proposal-${inquiry.id}`,
      institutionId: 'institution-kirinyaga',
      institutionName: inquiry.institution,
      sourceSignalId: inquiry.id,
      title: inquiry.title,
      rationale: inquiry.context,
      rule: 'Shared processing capacity governed so farmers retain ownership.',
      status: 'approved' as const,
      createdBy: actorEmail || 'steward',
      createdAt: new Date().toISOString(),
      events: [],
    };
    const workItem = createUndertakingFromProposal(proposal, actorEmail || 'steward', inquiry.institution);
    if (workItem) {
      registerUndertaking(workItem);
      setDetailView(null);
      navigate('/workspace/workbench/open');
    } else {
      setError('Only an approved proposal can become an undertaking.');
    }
  }

  return (
    <WorkspaceLayout currentContext="commons">
      {commonsView === 'arrival' ? (
        <CommonsArrival
          onExplore={(query: string) => {
            setSearch(query);
            setCommonsView('signals');
          }}
          onOpenPath={(id: string) => {
            if (id === 'share') {
              setShowContributionMenu(true);
            } else {
              setCommonsView('signals');
            }
          }}
        />
      ) : detailView === 'knowledge' ? (
        <KnowledgeDetail itemId={detailId} onBack={() => setDetailView(null)} />
      ) : detailView === 'inquiry' ? (
        <InquiryDetail
          inquiryId={detailId}
          onBack={() => setDetailView(null)}
          onHandOff={handleHandOff}
        />
      ) : (
        <div className="commons-shell">
          <div className="commons-mast">
            <div className="commons-mast-inner">
              <div className="commons-mast-brand">
                <span className="mark">A</span>
                <span className="label">APT-LABS · Commons</span>
              </div>
              <div className="commons-mast-loc">
                <span className="dot" aria-hidden="true" />
                Kenya · Shared Knowledge
              </div>
            </div>
          </div>

          <div className="commons-body">
            <header className="commons-head">
              <div className="commons-head-eyebrow">A place for shared intelligence</div>
              <h1 className="commons-head-title">
                What are we trying to{' '}
                <span className="commons-accent">understand,</span> improve or make&nbsp;possible?
              </h1>
              <p className="commons-head-sub">
                Not a feed, not a forum. The living civic knowledge commons — bring a real question, meet what others already know, and leave with something more useful.
              </p>
              <form className="commons-search" onSubmit={(e) => { e.preventDefault(); setCommonsView('signals'); }}>
                <div className="commons-search-inner">
                  <span className="commons-search-ico" aria-hidden="true">🔎</span>
                  <input
                    type="text"
                    placeholder="Search needs, knowledge, practices, opportunities…"
                    className="commons-search-input"
                  />
                  <Button variant="primary" size="lg" type="submit">
                    Explore
                  </Button>
                </div>
              </form>
              <nav className="commons-nav" aria-label="Commons destinations">
                <a
                  className={`commons-nav-item ${commonsView === 'signals' ? 'is-active' : ''}`}
                  onClick={() => setCommonsView('signals')}
                >
                  Explore
                </a>
                <a
                  className={`commons-nav-item ${commonsView === 'signals' ? 'is-active' : ''}`}
                  onClick={() => setCommonsView('signals')}
                >
                  Knowledge
                </a>
                <a
                  className={`commons-nav-item ${commonsView === 'signals' ? 'is-active' : ''}`}
                  onClick={() => setCommonsView('signals')}
                >
                  Inquiries
                </a>
                <button
                  className={`commons-nav-item commons-nav-item--primary ${commonsView === 'signals' ? 'is-active' : ''}`}
                  onClick={() => setShowContributionMenu(true)}
                >
                  Contribute
                </button>
              </nav>
            </header>

            <div className="commons-weave" aria-hidden="true"></div>

            <main className="commons-main">
              <section className="commons-section" id="inquiries">
                <div className="commons-section-head">
                  <div>
                    <span className="commons-section-kicker">Questions worth examining</span>
                    <h2 className="commons-section-title">Current inquiries</h2>
                  </div>
                  <a className="commons-section-more" href="#">View all →</a>
                </div>
                <div className="commons-inquiries">
                  {visibleSignals.map((signal) => (
                    <article
                      key={signal.id}
                      className={`commons-inquiry ${selected?.id === signal.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedId(signal.id);
                        setDetailView('inquiry');
                        setDetailId(signal.id);
                      }}
                    >
                      <span className={`commons-inquiry-type ${signal.status}`}>
                        {signal.status}
                      </span>
                      <div className="commons-inquiry-body">
                        <h3 className="commons-inquiry-title">{signal.title}</h3>
                        <div className="commons-inquiry-meta">
                          <span>{signal.location}</span>
                          <span>{signal.institutionName}</span>
                          <span>{signal.updates.length} contributions</span>
                          <span>{signal.evidenceOnHand?.length ?? 0} evidence</span>
                        </div>
                      </div>
                      <div className="commons-inquiry-side">
                        <span className="commons-inquiry-status">
                          {signal.status === 'new' ? 'Examining' : signal.status === 'triaged' ? 'Reviewing' : signal.status === 'brief' ? 'Brief ready' : 'Resolved'}
                        </span>
                        <div className="commons-inquiry-count">
                          <span className="num">{signal.updates.length}</span>
                          <span className="lab">contributions</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <div className="commons-weave" aria-hidden="true"></div>

              <section className="commons-section" id="knowledge">
                <div className="commons-section-head">
                  <div>
                    <span className="commons-section-kicker">What has already been learned</span>
                    <h2 className="commons-section-title">From the knowledge commons</h2>
                  </div>
                  <a className="commons-section-more" href="#">Open Knowledge House →</a>
                </div>
                <div className="commons-knowledge-cols">
                  <div className="commons-knowledge-col">
                    <span className="commons-knowledge-label">Field knowledge</span>
                    <div className="commons-knowledge-list">
                      {[
                        { id: 'knowledge-1', title: 'Inverter load-test record — microgrid commissioning', excerpt: 'Measured output, test conditions and review trail for shared grid handover.', badge: 'verified' as const, label: 'Verified' },
                        { id: 'knowledge-2', title: 'Tool circulation log — shared equipment stewardship', excerpt: 'A register of shared tool use, maintenance notes and access history.', badge: 'supported' as const, label: 'Supported' },
                        { id: 'knowledge-3', title: 'Water resilience audit — field research method', excerpt: 'Practical assessment of shared water infrastructure and maintenance needs.', badge: 'supported' as const, label: 'Supported' },
                        { id: 'knowledge-4', title: 'Repair guide & community workshop', excerpt: 'An open, locally tested guide paired with a neighborhood repair workshop.', badge: 'verified' as const, label: 'Verified' },
                      ].map((k) => (
                        <div
                          key={k.id}
                          className="commons-knowledge-item"
                          onClick={() => { setDetailView('knowledge'); setDetailId(k.id); }}
                        >
                          <div className="commons-knowledge-body">
                            <h3 className="commons-knowledge-title">{k.title}</h3>
                            <p className="commons-knowledge-excerpt">{k.excerpt}</p>
                          </div>
                          <span className={`commons-knowledge-badge ${k.badge}`}>{k.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="commons-knowledge-col">
                    <span className="commons-knowledge-label">Emerging possibilities</span>
                    <div className="commons-knowledge-list">
                      {[
                        { id: 'knowledge-5', title: 'Shared lab access — three Nyeri schools', excerpt: 'Scheduled practicals, mobile instruction, maintenance rota. Ready to examine.', badge: 'ready' as const, label: 'Brief ready' },
                        { id: 'knowledge-6', title: 'Processing cooperative — Kirinyaga rice growers', excerpt: 'A shared facility governed so every farmer keeps ownership through the process.', badge: 'synthesis' as const, label: 'Synthesis' },
                        { id: 'knowledge-7', title: 'Cold-chain pilot for vaccine transport', excerpt: 'A plausible next step; needs temperature evidence before a brief.', badge: 'proposition' as const, label: 'Proposition' },
                        { id: 'knowledge-8', title: 'Seasonal judgement for solar-drying capacity', excerpt: "A farmer's accumulated judgement, not yet independently verified.", badge: 'reported' as const, label: 'Reported' },
                      ].map((k) => (
                        <div
                          key={k.id}
                          className="commons-knowledge-item"
                          onClick={() => { setDetailView('knowledge'); setDetailId(k.id); }}
                        >
                          <div className="commons-knowledge-body">
                            <h3 className="commons-knowledge-title">{k.title}</h3>
                            <p className="commons-knowledge-excerpt">{k.excerpt}</p>
                          </div>
                          <span className={`commons-knowledge-badge ${k.badge}`}>{k.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="commons-section" id="briefs">
                <div className="commons-section-head">
                  <div>
                    <span className="commons-section-kicker">Developed · ready for consideration</span>
                    <h2 className="commons-section-title">Opportunity briefs</h2>
                  </div>
                  <a className="commons-section-more" href="#">Not an approval →</a>
                </div>
                <div className="commons-briefs">
                  <div className="commons-brief">
                    <div className="commons-brief-body">
                      <h3 className="commons-brief-title">Shared laboratory access for three Nyeri schools</h3>
                      <div className="commons-brief-meta">
                        <span>Problem</span><span>·</span><span>Context</span><span>·</span><span>3 evidence</span><span>·</span><span>2 unknowns</span><span>·</span><span>Next: define a testable undertaking</span>
                      </div>
                    </div>
                    <Button variant="primary">Develop brief →</Button>
                  </div>
                  <div className="commons-brief">
                    <div className="commons-brief-body">
                      <h3 className="commons-brief-title">Processing cooperative for Kirinyaga rice growers</h3>
                      <div className="commons-brief-meta">
                        <span>Problem</span><span>·</span><span>4 actors</span><span>·</span><span>2 previous attempts</span><span>·</span><span>Next: governance model</span>
                      </div>
                    </div>
                    <Button variant="ghost">Examine →</Button>
                  </div>
                </div>
              </section>

              <div className="commons-contribute">
                <div className="commons-contribute-copy">
                  <h3>Have something to contribute?</h3>
                  <p>A practice, a case, a question, or an opportunity worth examining. Every contribution carries its provenance.</p>
                </div>
                <Button variant="primary">Contribute knowledge ↗</Button>
              </div>

              <footer className="commons-colophon">
                <div className="commons-colophon-poem">
                  Bring what you know. Examine what we know.<em> Build what we can.</em>
                  Leave knowledge that outlasts the undertaking.
                </div>
                <div className="commons-colophon-fine">
                  APT-LABS · Commons · Illustrative content · Not live data
                </div>
              </footer>
            </main>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}
