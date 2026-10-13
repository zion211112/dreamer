'use client';

import { useState } from 'react';
import { MODULES, MODULE_ORDER, TREE, PEOPLE, TOTAL_BUILDS, BUILT_COUNT, ANCHORS, LEDGER, findPage, firstMeaningfulLine, stateColor, type OntoPage, type NavItemId } from '@/lib/ontology';
import { highlight } from '@/lib/editor';
import { useSession } from '@/lib/session';
import type { ViewId } from '@/components/TopNav';

interface ModuleSurfaceProps {
  view: ViewId;
  module: string | null;
  page: string | null;
  onNav: (id: NavItemId) => void;
  onSelectPage: (id: string) => void;
  onOpenPage: (id: string) => void;
  onView: (v: ViewId) => void;
  toast: (msg: string, icon?: string) => void;
}

export function ModuleSurface({ view, module, page, onNav, onSelectPage, onOpenPage, onView, toast }: ModuleSurfaceProps) {
  // A page is open — render the page view.
  if (page) {
    const f = findPage(page);
    if (f) return <PageView f={f} />;
  }

  // Kemet-OS — the one-page landing, stripped to basics.
  if (view === 'kemet') return <KemetOsLanding onNav={onNav} onOpenPage={onOpenPage} onView={onView} />;

  // A module is selected — its landing.
  if (module) return <ModuleLanding moduleId={module} onSelectPage={onSelectPage} toast={toast} />;

  // The workspace dashboard.
  return <WorkspaceView onNav={onNav} onOpenPage={onOpenPage} toast={toast} />;
}

/* ══════════════════════════════════════════════════════════════
   SHARED — main head
   ══════════════════════════════════════════════════════════════ */

function MainHead({ title, desc, right }: { title: string; desc: string; right?: React.ReactNode }) {
  const mod = MODULES[MODULE_ORDER.find(id => MODULES[id].title === title) || ''];
  return (
    <div className="main-head">
      <div className="title">
        <div className="badge-ic" style={{ color: mod?.color || 'var(--accent)' }}>
          {mod?.icon || '◇'}
        </div>
        <div>
          <h1>{title}</h1>
          <div className="desc">{desc}</div>
        </div>
      </div>
      <div className="updated">{right || 'last updated: just now'}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   KEMET-OS — the aptlabs landing, stripped to the basics:
   who we are, who is on the ledger, what is happening.
   ══════════════════════════════════════════════════════════════ */

function KemetOsLanding({ onNav, onOpenPage, onView }: { onNav: (id: NavItemId) => void; onOpenPage: (id: string) => void; onView: (v: ViewId) => void }) {
  const { me, activity } = useSession();
  const rows = me ? [me, ...LEDGER] : LEDGER;
  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: 'var(--accent)' }}>◇</div>
          <div>
            <h1>Kemet-OS</h1>
            <div className="desc">the aptlabs landing — one page, everything plain</div>
          </div>
        </div>
        <div className="updated">sovereign · open · on the roll</div>
      </div>

      <section className="section hero">
        <div className="section-label">kemetic os · the landing</div>
        <h2>Sovereign work.<br />The <em>record</em>, ours.</h2>
        <p className="lede">
          AptLabs is sovereign infrastructure for builders who make
          physical things. Claim your identity SBT — then build, vote,
          invest, and sign. Every blueprint open. Every claim checkable
          by someone who owes us nothing.
        </p>
        <div className="cta">
          <button className="btn btn-primary" onClick={() => onNav('kernel')}>Claim your identity SBT →</button>
          <button className="btn btn-ghost" onClick={() => onView('workspace')}>Enter the workspace</button>
          <button className="btn btn-ghost" onClick={() => onOpenPage('network/tally/smis')}>SMIS · live vote</button>
        </div>
        <div className="hint">
          <kbd>⌘K</kbd> search · <kbd>⌘0</kbd> kemet-os · <kbd>⌘B</kbd> workspace · <kbd>⌘⇧A</kbd> agent
        </div>
      </section>

      <section className="section">
        <div className="section-label">the ledger · members</div>
        <div className="ledger">
          {rows.map(e => (
            <div className="ledger-row" key={e.sbt}>
              <span className="av" style={{ background: e.color }}>{e.av}</span>
              <span className="who">
                <span className="n">{e.name}{e === me && <span className="you">you</span>}</span>
                <span className="r">{e.role}</span>
              </span>
              <span className="rights">
                {e.rights.map(r => <span key={r}>{r}</span>)}
              </span>
              <span className="sbt">{e.sbt}</span>
              <span className="stamp">✓ on the roll</span>
            </div>
          ))}
        </div>
        <div className="hint" style={{ marginTop: '8px' }}>
          one SBT, one vote · the ledger holds members who can build, vote, sign
        </div>
      </section>

      <section className="section">
        <div className="section-label">activity · live</div>
        <div className="activity">
          {activity.map(a => (
            <div className="row" key={a.p + a.time}>
              <span className="p">{a.p}</span>
              <span className="right">
                <span className={'state-pill ' + a.state}>{a.state}</span>
                <span className="t">· {a.time}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   WORKSPACE — the control dashboard
   ══════════════════════════════════════════════════════════════ */

function WorkspaceView({ onNav, onOpenPage, toast }: { onNav: (id: NavItemId) => void; onOpenPage: (id: string) => void; toast: (msg: string, icon?: string) => void }) {
  const { activity } = useSession();
  return (
    <main className="main" id="main">
      <MainHead title="Command Center" desc="control dashboard — system status, recent activity, quick actions" />

      <section className="section hero">
        <div className="section-label">the lab</div>
        <h2>The kernel, open.<br />The <em>record</em>, yours.</h2>
        <p className="lede">
          Identity, evidence, and proof-of-work — for builders who make physical things.
          Fork the mesh. Sign your work. Publish the blueprint. The second county
          pays nothing for the first county&apos;s learning curve.
        </p>
        <div className="cta">
          <button className="btn btn-primary" onClick={() => onNav('kernel')}>Open the kernel →</button>
          <button className="btn btn-ghost" onClick={() => onOpenPage('operations/audits/protocol')}>Read the protocol</button>
          <button className="btn btn-ghost" onClick={() => toast('Fork request queued · node will be provisioned', '⟐')}>Fork a node</button>
        </div>
        <div className="hint">
          <kbd>⌘K</kbd> search · <kbd>⌘P</kbd> commands · <kbd>⌘⇧A</kbd> agent
        </div>
      </section>

      <section className="section">
        <div className="section-label">people · on the roll</div>
        <div className="people">
          {PEOPLE.map(p => (
            <div className="person" key={p.name}>
              <div className="av" style={{ background: p.color }}>{p.av}</div>
              <div className="who">
                <span className="n">{p.name}</span>
                <span className="r">{p.role}</span>
              </div>
              <span className={'tag ' + p.tag}>{p.tag}</span>
              <span className="meta">{p.meta}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-label">insights · system vitals</div>
        <div className="vitals">
          <div className="vital"><div className="k">modules</div><div className="v">{MODULE_ORDER.length}</div></div>
          <div className="vital"><div className="k">builds</div><div className="v">{TOTAL_BUILDS}</div></div>
          <div className="vital"><div className="k">evidence</div><div className="v">{BUILT_COUNT}<span className="unit">built</span></div></div>
          <div className="vital"><div className="k">anchors</div><div className="v">{ANCHORS.length}<span className="unit">verified</span></div></div>
        </div>
        <div className="activity">
          {activity.map(a => (
            <div className="row" key={a.p + a.time}>
              <span className="p">{a.p}</span>
              <span className="right">
                <span className={'state-pill ' + a.state}>{a.state}</span>
                <span className="t">· {a.time}</span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   MODULE LANDING — guide (kernel) + page cards
   ══════════════════════════════════════════════════════════════ */

function ModuleLanding({ moduleId, onSelectPage, toast }: { moduleId: string; onSelectPage: (id: string) => void; toast: (msg: string, icon?: string) => void }) {
  const mod = MODULES[moduleId];
  const tree = TREE[moduleId];
  const { me, claim, research, submitResearch, postToTally } = useSession();
  const [walk, setWalk] = useState({ step: 1, name: '' });
  const [researchTitle, setResearchTitle] = useState('');

  return (
    <main className="main" id="main">
      <MainHead title={mod.title} desc={mod.desc} />

      {moduleId === 'kernel' && (
        <section className="section">
          <div className="section-label">identity · claim your SBT</div>
          {me ? (
            <div className="guide">
              <div className="step done">
                <span className="n">✓</span>
                <div>
                  <div className="t">you are on the roll</div>
                  <div className="d">{me.name} · {me.sbt} · rights: {me.rights.join(' · ')} — soulbound, unsellable.</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="guide">
              <div className={'step' + (walk.step > 1 ? ' done current-done' : ' current')}>
                <span className="n">{walk.step > 1 ? '✓' : '1'}</span>
                <div>
                  <div className="t">Register</div>
                  <div className="d">Name yourself — no papers, no gatekeeper.</div>
                  {walk.step === 1 && (
                    <div className="walk-row">
                      <input
                        className="walk-input"
                        placeholder="your name"
                        value={walk.name}
                        onChange={e => setWalk(w => ({ ...w, name: e.target.value }))}
                        onKeyDown={e => { if (e.key === 'Enter' && walk.name.trim()) setWalk(w => ({ ...w, step: 2 })); }}
                        autoFocus
                      />
                      <button
                        className="btn btn-ghost sm"
                        disabled={!walk.name.trim()}
                        onClick={() => setWalk(w => ({ ...w, step: 2 }))}
                      >
                        continue →
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={'step' + (walk.step === 2 ? ' current' : walk.step > 2 ? ' done current-done' : '')}>
                <span className="n">{walk.step > 2 ? '✓' : '2'}</span>
                <div>
                  <div className="t">Sign</div>
                  <div className="d">Sign the claim with your wallet. An anchor countersigns.</div>
                  {walk.step === 2 && (
                    <div className="walk-row">
                      <button
                        className="btn btn-primary sm"
                        onClick={() => {
                          setWalk(w => ({ ...w, step: 3 }));
                          toast('◈ claim signed · wanjiru.m countersigned', '◈');
                        }}
                      >
                        sign with wallet
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className={'step' + (walk.step === 3 ? ' current' : '')}>
                <span className="n">3</span>
                <div>
                  <div className="t">Receive</div>
                  <div className="d">Your SBT lands in your wallet. Soulbound: yours, unsellable.</div>
                  {walk.step === 3 && (
                    <div className="walk-row">
                      <button className="btn btn-primary sm" onClick={() => claim(walk.name)}>
                        receive SBT-0207
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="section">
        <div className="section-label">{mod.label} · pages</div>
        <div className="card-grid">
          {tree.pages.map(p => (
            <div className="card" key={p.id} onClick={() => onSelectPage(p.id)}>
              <div className="card-head">
                <div className="card-title">{p.name}</div>
                <span className={'state-pill ' + p.state}>{p.state}</span>
              </div>
              <div className="card-desc">{firstMeaningfulLine(p.content)}</div>
              <div className="card-foot">
                <span>{p.lang}</span>
                <span className="spacer" />
                {moduleId === 'builds' && (
                  <button
                    className="btn btn-ghost sm"
                    title="Post this build to the tally — collaborators and funds"
                    onClick={e => { e.stopPropagation(); postToTally(p.name); }}
                  >
                    → tally
                  </button>
                )}
                <span>{p.lines} lines · {p.size}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {moduleId === 'laboratory' && (
        <section className="section">
          <div className="section-label">laboratory · submit research</div>
          <div className="walk-row">
            <input
              className="walk-input"
              placeholder="title your research…"
              value={researchTitle}
              onChange={e => setResearchTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && researchTitle.trim()) { submitResearch(researchTitle); setResearchTitle(''); } }}
            />
            <button
              className="btn btn-primary sm"
              disabled={!researchTitle.trim()}
              onClick={() => { submitResearch(researchTitle); setResearchTitle(''); }}
            >
              submit to the lab
            </button>
          </div>
          <div className="hint" style={{ marginTop: '8px' }}>
            read the pages above · submit your own — one persona, one session
          </div>
          {research.length > 0 && (
            <div className="activity" style={{ marginTop: '12px' }}>
              {research.map((r, i) => (
                <div className="row" key={r.title + i}>
                  <span className="p">{r.title}</span>
                  <span className="right">
                    <span className="state-pill proto">submitted</span>
                    <span className="t">· {r.by} · {r.time}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE VIEW — the open page, gutter + syntax highlighting
   ══════════════════════════════════════════════════════════════ */

function PageView({ f }: { f: OntoPage & { module: string } }) {
  const mod = MODULES[f.module];
  const { me, tally, vote, invest } = useSession();
  const lines = f.content.split('\n');
  const numbered = lines.map((_, i) => i + 1).join('\n');
  const isSmis = f.id === 'network/tally/smis';

  return (
    <main className="main" id="main">
      <div className="main-head">
        <div className="title">
          <div className="badge-ic" style={{ color: mod.color }}>{mod.icon}</div>
          <div>
            <div className="crumb">
              {f.module}
              <span className="sep">/</span>
              {f.id.split('/').slice(1).join('/')}
            </div>
            <h1>{f.name}</h1>
            <div className="desc">{f.lang} · {f.lines} lines · {f.size}</div>
          </div>
        </div>
        <div className="updated">
          <span className={'state-pill ' + f.state}>{f.state}</span>
        </div>
      </div>

      {isSmis && (
        <section className="section" style={{ maxWidth: '100%' }}>
          <div className="live">
            <div className="live-block">
              <div className="live-label">ballot · live</div>
              <div className="live-nums">
                {tally.for}<span className="unit"> for</span> · {tally.against}<span className="unit"> against</span>
              </div>
              <div className="live-sub">quorum met · closes in 6 days</div>
              <div className="live-actions">
                <button className="btn btn-primary sm" onClick={() => vote('for')}>vote for</button>
                <button className="btn btn-ghost sm" onClick={() => vote('against')}>vote against</button>
              </div>
            </div>
            <div className="live-block">
              <div className="live-label">investment · live</div>
              <div className="live-nums">
                KES {tally.pledged.toLocaleString()}<span className="unit"> of 2,000,000</span>
              </div>
              <div className="live-sub">{tally.backers} backers · smallest stake KES 500</div>
              <div className="live-actions">
                <button className="btn btn-primary sm" onClick={invest}>invest KES 500</button>
              </div>
            </div>
            <div className="live-block">
              <div className="live-label">on the tally</div>
              {tally.builds.length === 0 ? (
                <div className="live-empty">no builds posted yet — post one from builds ▤</div>
              ) : (
                <div className="live-list">
                  {tally.builds.map(b => (
                    <div className="live-row" key={b.name}>
                      <span>{b.name}</span>
                      <span>{b.backers} backers · KES {b.pledged.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="hint">
            one SBT, one vote · returns flow to The Roll, pro-rata{me ? ` · signed in as ${me.name}` : ''}
          </div>
        </section>
      )}

      <section className="section" style={{ maxWidth: '100%' }}>
        <div className="editor">
          <div className="editor-tabs">
            <div className="editor-tab active">
              <span className="dot-state" style={{ background: stateColor(f.state) }} />
              {f.name}
            </div>
          </div>
          <div className="editor-body">
            <div className="editor-gutter">{numbered}</div>
            <div
              className="editor-code"
              dangerouslySetInnerHTML={{ __html: highlight(f.content, f.lang) }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export { stateColor };
