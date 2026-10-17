import { ArrowRight, Check, Link2, Play, Plus, RotateCcw, ShieldCheck, Unlink, X } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { store, pipelineSteps, runChecks, type Peer } from '@/lib/workflows';
import type { ModuleName } from '@/lib/workspace-data';

type Nav = (module: ModuleName, page: string) => void;
const useFlow = () => useSyncExternalStore(store.subscribe, store.get, store.getServer);
const tone = (s: string) => ['Verified', 'Passed', 'Published'].includes(s) ? 'ok' : ['Revoked', 'Failed', 'Rejected'].includes(s) ? 'bad' : 'wait';
const Pill = ({ s }: { s: string }) => <span className={`wf-pill ${tone(s)}`}>{s}</span>;
const Empty = ({ text, cta, onClick }: { text: string; cta?: string; onClick?: () => void }) => <div className="wf-empty"><p>{text}</p>{cta && <Button variant="outline" size="sm" onClick={onClick}>{cta}<ArrowRight size={12} /></Button>}</div>;
const Head = ({ title, hint, children }: { title: string; hint: string; children?: React.ReactNode }) => <div className="wf-head"><div><h2>{title}</h2><p>{hint}</p></div>{children}</div>;

function Peers() {
  const s = useFlow();
  const [name, setName] = useState(''); const [role, setRole] = useState<Peer['role']>('Validator');
  return <section className="wf">
    <Head title="Peers" hint="Invite a peer, then verify its identity. Verified peers can co-sign build attestations." />
    <form className="wf-form" onSubmit={e => { e.preventDefault(); store.dispatch({ type: 'invitePeer', name, role }); setName(''); }}>
      <input aria-label="Peer name" placeholder="node.name" value={name} maxLength={32} onChange={e => setName(e.target.value)} />
      <select aria-label="Peer role" value={role} onChange={e => setRole(e.target.value as Peer['role'])}><option>Validator</option><option>Relay</option><option>Observer</option></select>
      <Button size="sm" type="submit" disabled={!name.trim()}><Plus size={13} />Invite</Button>
    </form>
    <div className="wf-list">{s.peers.map(p => <div key={p.id} className="wf-row">
      <code>{p.id}</code><div className="wf-main"><strong>{p.name}</strong><span>{p.role}</span></div><Pill s={p.status} />
      <div className="wf-actions">
        {p.status === 'Invited' && <Button size="sm" onClick={() => store.dispatch({ type: 'verifyPeer', id: p.id })}><ShieldCheck size={13} />Verify</Button>}
        {p.status !== 'Revoked' && <Button size="sm" variant="ghost" onClick={() => store.dispatch({ type: 'revokePeer', id: p.id })}>Revoke</Button>}
      </div>
    </div>)}</div>
  </section>;
}

function Connections({ nav }: { nav: Nav }) {
  const s = useFlow();
  const v = s.peers.filter(p => p.status === 'Verified');
  const [a, setA] = useState(''); const [b, setB] = useState('');
  const name = (id: string) => s.peers.find(p => p.id === id)?.name ?? id;
  return <section className="wf">
    <Head title="Connections" hint="Link two verified peers. Revoking a peer removes its links." />
    {v.length < 2 ? <Empty text={`Connections need two verified peers. You have ${v.length}.`} cta="Go to peers" onClick={() => nav('Network', 'Peers')} /> :
      <form className="wf-form" onSubmit={e => { e.preventDefault(); store.dispatch({ type: 'connect', a, b }); }}>
        <select aria-label="First peer" value={a} onChange={e => setA(e.target.value)}><option value="">Select peer</option>{v.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <span className="wf-sep">↔</span>
        <select aria-label="Second peer" value={b} onChange={e => setB(e.target.value)}><option value="">Select peer</option>{v.filter(p => p.id !== a).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <Button size="sm" type="submit" disabled={!a || !b || a === b}><Link2 size={13} />Connect</Button>
      </form>}
    {s.connections.length > 0 && <div className="wf-list">{s.connections.map(c => <div key={c.id} className="wf-row">
      <code>{c.id}</code><div className="wf-main"><strong>{name(c.a)} ↔ {name(c.b)}</strong></div>
      <div className="wf-actions"><Button size="sm" variant="ghost" onClick={() => store.dispatch({ type: 'disconnect', id: c.id })}><Unlink size={13} />Remove</Button></div>
    </div>)}</div>}
  </section>;
}

function Packages({ nav }: { nav: Nav }) {
  const s = useFlow();
  return <section className="wf">
    <Head title="Packages" hint="Run a pipeline to compile, test, attest and package a release." />
    <div className="wf-list">{s.packages.map(p => { const running = s.runs.some(r => r.pkg === p.id && r.status === 'Running'); return <div key={p.id} className="wf-row">
      <code>v{p.version}</code><div className="wf-main"><strong>{p.name}</strong><span>{p.summary}</span></div>
      <div className="wf-actions"><Button size="sm" disabled={running} onClick={() => { store.dispatch({ type: 'startRun', pkg: p.id }); nav('Builds', 'Pipelines'); }}><Play size={13} />{running ? 'Running' : 'Run pipeline'}</Button></div>
    </div>; })}</div>
  </section>;
}

function Pipelines({ nav }: { nav: Nav }) {
  const s = useFlow();
  const running = s.runs.filter(r => r.status === 'Running').map(r => r.id).join();
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => running.split(',').forEach(id => store.dispatch({ type: 'advanceRun', id })), 650);
    return () => clearInterval(t);
  }, [running]);
  const pkg = (id: string) => s.packages.find(p => p.id === id)!;
  return <section className="wf">
    <Head title="Pipelines" hint="Each run needs a verified peer at the Attest step." />
    {s.runs.length === 0 ? <Empty text="No runs yet." cta="Choose a package" onClick={() => nav('Builds', 'Packages')} /> :
      <div className="wf-list">{s.runs.map(r => <div key={r.id} className="wf-run">
        <div className="wf-run-top"><code>{r.id}</code><strong>{pkg(r.pkg).name}</strong><Pill s={r.status} />
          {r.status === 'Failed' && <Button size="sm" variant="ghost" onClick={() => store.dispatch({ type: 'startRun', pkg: r.pkg })}><RotateCcw size={13} />Retry</Button>}
          {r.status === 'Passed' && <Button size="sm" variant="ghost" onClick={() => nav('Operations', 'Approvals')}>Review<ArrowRight size={12} /></Button>}
        </div>
        <ol className="wf-steps">{pipelineSteps.map((st, i) => <li key={st} className={i < r.step || r.status === 'Passed' ? 'done' : i === r.step ? (r.status === 'Failed' ? 'bad' : 'now') : ''}>{i < r.step || r.status === 'Passed' ? <Check size={11} /> : r.status === 'Failed' && i === r.step ? <X size={11} /> : <span>{i + 1}</span>}{st}</li>)}</ol>
        {r.reason && <p className="wf-reason">{r.reason}. <button onClick={() => nav('Network', 'Peers')}>Verify a peer</button></p>}
      </div>)}</div>}
  </section>;
}

function Artifacts({ nav }: { nav: Nav }) {
  const s = useFlow();
  return <section className="wf">
    <Head title="Artifacts" hint="Outputs of passed pipelines, with their signer and approval state." />
    {s.artifacts.length === 0 ? <Empty text="No artifacts yet. Passed pipelines produce them." cta="Run a pipeline" onClick={() => nav('Builds', 'Packages')} /> :
      <div className="wf-list">{s.artifacts.map(a => <div key={a.id} className="wf-row"><code>{a.hash}</code><div className="wf-main"><strong>{a.pkg}@{a.version}</strong><span>Signed by {a.signer}</span></div><Pill s={a.status} /></div>)}</div>}
  </section>;
}

function Approvals({ nav }: { nav: Nav }) {
  const s = useFlow();
  const queue = s.artifacts.filter(a => a.status === 'Awaiting approval'), done = s.artifacts.filter(a => a.status !== 'Awaiting approval');
  return <section className="wf">
    <Head title="Approvals" hint="Publish or reject artifacts produced by Builds." />
    {queue.length === 0 ? <Empty text="Nothing waiting for approval." cta="Run a pipeline" onClick={() => nav('Builds', 'Packages')} /> :
      <div className="wf-list">{queue.map(a => <div key={a.id} className="wf-row"><code>{a.hash}</code><div className="wf-main"><strong>{a.pkg}@{a.version}</strong><span>Signed by {a.signer}</span></div>
        <div className="wf-actions"><Button size="sm" onClick={() => store.dispatch({ type: 'decide', id: a.id, approve: true })}><Check size={13} />Publish</Button><Button size="sm" variant="ghost" onClick={() => store.dispatch({ type: 'decide', id: a.id, approve: false })}>Reject</Button></div></div>)}</div>}
    {done.length > 0 && <><div className="wf-sub">Decided</div><div className="wf-list">{done.map(a => <div key={a.id} className="wf-row"><code>{a.hash}</code><div className="wf-main"><strong>{a.pkg}@{a.version}</strong></div><Pill s={a.status} /></div>)}</div></>}
  </section>;
}

function ActivityLog() {
  const s = useFlow();
  return <section className="wf">
    <Head title="Activity" hint="Every action taken in this session, newest first.">{s.log.length > 0 && <Button size="sm" variant="ghost" onClick={() => store.dispatch({ type: 'reset' })}><RotateCcw size={13} />Reset session</Button>}</Head>
    {s.log.length === 0 ? <Empty text="No activity yet. Actions in Network, Builds and Operations appear here." /> :
      <ol className="wf-log">{s.log.map(l => <li key={l.id}><span>{l.area}</span>{l.text}</li>)}</ol>}
  </section>;
}

function Checks({ nav }: { nav: Nav }) {
  const s = useFlow(); const checks = runChecks(s); const passed = checks.filter(c => c.ok).length;
  return <section className="wf">
    <Head title="Checks" hint="Computed from the current session state."><span className="wf-count">{passed}/{checks.length} passing</span></Head>
    <div className="wf-list">{checks.map(c => <div key={c.label} className="wf-row"><span className={`wf-dot ${c.ok ? 'ok' : 'bad'}`}>{c.ok ? <Check size={12} /> : <X size={12} />}</span><div className="wf-main"><strong>{c.label}</strong><span>{c.detail}</span></div>
      {!c.ok && c.fix && <div className="wf-actions"><Button size="sm" variant="ghost" onClick={() => nav(c.fix!.module, c.fix!.page)}>Resolve<ArrowRight size={12} /></Button></div>}</div>)}</div>
  </section>;
}

export const workflowModules: ModuleName[] = ['Network', 'Builds', 'Operations'];
export function Workflow({ module, page, onNavigate }: { module: ModuleName; page: string; onNavigate: Nav }) {
  const nav = onNavigate;
  const views: Record<string, React.ReactNode> = {
    'Network/Peers': <Peers />, 'Network/Connections': <Connections nav={nav} />,
    'Builds/Packages': <Packages nav={nav} />, 'Builds/Pipelines': <Pipelines nav={nav} />, 'Builds/Artifacts': <Artifacts nav={nav} />,
    'Operations/Approvals': <Approvals nav={nav} />, 'Operations/Activity': <ActivityLog />, 'Operations/Checks': <Checks nav={nav} />,
  };
  return <>
    <ol className="wf-flow" aria-label="Workflow">{[['Network', 'Peers', 'Verify peers'], ['Builds', 'Packages', 'Build & attest'], ['Operations', 'Approvals', 'Approve & publish']].map(([m, p, l], i) =>
      <li key={m}><button className={m === module ? 'active' : ''} onClick={() => nav(m as ModuleName, p!)}><span>{i + 1}</span>{l}</button></li>)}</ol>
    {views[`${module}/${page}`]}
  </>;
}
