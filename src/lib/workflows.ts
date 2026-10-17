// Local prototype state for the Network → Builds → Operations workflow.
// Everything here is in-memory; nothing is sent to a network.

export type PeerStatus = 'Invited' | 'Verified' | 'Revoked';
export type Peer = { id: string; name: string; role: 'Validator' | 'Relay' | 'Observer'; status: PeerStatus };
export type Connection = { id: string; a: string; b: string };
export type Pkg = { id: string; name: string; version: string; summary: string };
export type RunStatus = 'Running' | 'Passed' | 'Failed';
export type Run = { id: string; pkg: string; step: number; status: RunStatus; reason?: string };
export type ArtifactStatus = 'Awaiting approval' | 'Published' | 'Rejected';
export type Artifact = { id: string; pkg: string; version: string; hash: string; signer: string; status: ArtifactStatus };
export type LogEntry = { id: string; text: string; area: 'Network' | 'Builds' | 'Operations' };

export type State = { peers: Peer[]; connections: Connection[]; packages: Pkg[]; runs: Run[]; artifacts: Artifact[]; log: LogEntry[]; seq: number };

export const pipelineSteps = ['Compile', 'Test', 'Attest', 'Package'] as const;
export const ATTEST_STEP = 2;

export const initialState: State = {
  peers: [
    { id: 'PEER-1', name: 'node.athena', role: 'Validator', status: 'Verified' },
    { id: 'PEER-2', name: 'node.thoth', role: 'Relay', status: 'Invited' },
  ],
  connections: [],
  packages: [
    { id: 'PKG-1', name: 'kemet-kernel', version: '0.4.2', summary: 'Core coordination runtime' },
    { id: 'PKG-2', name: 'identity-resolver', version: '0.3.1', summary: 'Identity lookup service' },
    { id: 'PKG-3', name: 'ledger-indexer', version: '0.2.8', summary: 'Ledger indexing service' },
  ],
  runs: [], artifacts: [], log: [], seq: 1,
};

export type Action =
  | { type: 'invitePeer'; name: string; role: Peer['role'] }
  | { type: 'verifyPeer' | 'revokePeer'; id: string }
  | { type: 'connect'; a: string; b: string }
  | { type: 'disconnect'; id: string }
  | { type: 'startRun'; pkg: string }
  | { type: 'advanceRun'; id: string }
  | { type: 'decide'; id: string; approve: boolean }
  | { type: 'reset' };

export function hash(text: string) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const x = (h >>> 0).toString(16).padStart(8, '0');
  return `0x${x.slice(0, 4)}…${x.slice(4)}`;
}

const verified = (s: State) => s.peers.filter(p => p.status === 'Verified');
const log = (s: State, area: LogEntry['area'], text: string): State => ({ ...s, seq: s.seq + 1, log: [{ id: `LOG-${s.seq}`, area, text }, ...s.log] });

export function reduce(s: State, a: Action): State {
  switch (a.type) {
    case 'invitePeer': {
      const name = a.name.trim().toLowerCase();
      if (!name || s.peers.some(p => p.name === name)) return s;
      return log({ ...s, peers: [...s.peers, { id: `PEER-${s.seq}`, name, role: a.role, status: 'Invited' }] }, 'Network', `Invited ${name} as ${a.role.toLowerCase()}`);
    }
    case 'verifyPeer': case 'revokePeer': {
      const p = s.peers.find(x => x.id === a.id); if (!p) return s;
      const status: PeerStatus = a.type === 'verifyPeer' ? 'Verified' : 'Revoked';
      const connections = status === 'Revoked' ? s.connections.filter(c => c.a !== p.id && c.b !== p.id) : s.connections;
      return log({ ...s, connections, peers: s.peers.map(x => x.id === a.id ? { ...x, status } : x) }, 'Network', `${status} ${p.name}`);
    }
    case 'connect': {
      const ids = verified(s).map(p => p.id);
      if (a.a === a.b || !ids.includes(a.a) || !ids.includes(a.b)) return s;
      if (s.connections.some(c => (c.a === a.a && c.b === a.b) || (c.a === a.b && c.b === a.a))) return s;
      const n = (id: string) => s.peers.find(p => p.id === id)!.name;
      return log({ ...s, connections: [...s.connections, { id: `CON-${s.seq}`, a: a.a, b: a.b }] }, 'Network', `Connected ${n(a.a)} ↔ ${n(a.b)}`);
    }
    case 'disconnect':
      return log({ ...s, connections: s.connections.filter(c => c.id !== a.id) }, 'Network', 'Removed a connection');
    case 'startRun': {
      const pkg = s.packages.find(p => p.id === a.pkg);
      if (!pkg || s.runs.some(r => r.pkg === a.pkg && r.status === 'Running')) return s;
      return log({ ...s, runs: [{ id: `RUN-${s.seq}`, pkg: a.pkg, step: 0, status: 'Running' }, ...s.runs] }, 'Builds', `Started pipeline for ${pkg.name}`);
    }
    case 'advanceRun': {
      const run = s.runs.find(r => r.id === a.id); if (!run || run.status !== 'Running') return s;
      const pkg = s.packages.find(p => p.id === run.pkg)!;
      const update = (patch: Partial<Run>) => s.runs.map(r => r.id === run.id ? { ...r, ...patch } : r);
      if (run.step === ATTEST_STEP && verified(s).length === 0)
        return log({ ...s, runs: update({ status: 'Failed', reason: 'No verified peer to co-sign the attestation' }) }, 'Builds', `${pkg.name} failed at Attest`);
      const step = run.step + 1;
      if (step < pipelineSteps.length) return { ...s, runs: update({ step }) };
      const signer = verified(s)[0]!.name;
      const artifact: Artifact = { id: `ART-${s.seq}`, pkg: pkg.name, version: pkg.version, hash: hash(`${pkg.name}@${pkg.version}#${s.seq}`), signer, status: 'Awaiting approval' };
      return log({ ...s, runs: update({ step, status: 'Passed' }), artifacts: [artifact, ...s.artifacts] }, 'Builds', `${pkg.name} passed · artifact sent for approval`);
    }
    case 'decide': {
      const art = s.artifacts.find(x => x.id === a.id); if (!art || art.status !== 'Awaiting approval') return s;
      const status: ArtifactStatus = a.approve ? 'Published' : 'Rejected';
      return log({ ...s, artifacts: s.artifacts.map(x => x.id === a.id ? { ...x, status } : x) }, 'Operations', `${status} ${art.pkg}@${art.version}`);
    }
    case 'reset': return initialState;
  }
}

export type Check = { label: string; ok: boolean; detail: string; fix?: { module: 'Network' | 'Builds' | 'Operations'; page: string } };
export function runChecks(s: State): Check[] {
  const v = verified(s).length, invited = s.peers.filter(p => p.status === 'Invited').length;
  const failed = s.runs.filter(r => r.status === 'Failed').length, waiting = s.artifacts.filter(a => a.status === 'Awaiting approval').length;
  return [
    { label: 'Signing peer available', ok: v > 0, detail: v ? `${v} verified peer${v > 1 ? 's' : ''}` : 'Verify at least one peer', fix: { module: 'Network', page: 'Peers' } },
    { label: 'No pending invitations', ok: invited === 0, detail: invited ? `${invited} awaiting verification` : 'All peers resolved', fix: { module: 'Network', page: 'Peers' } },
    { label: 'Pipelines clean', ok: failed === 0, detail: failed ? `${failed} failed run${failed > 1 ? 's' : ''}` : s.runs.length ? 'No failures' : 'No runs yet', fix: { module: 'Builds', page: 'Pipelines' } },
    { label: 'Approval queue clear', ok: waiting === 0, detail: waiting ? `${waiting} artifact${waiting > 1 ? 's' : ''} waiting` : 'Nothing waiting', fix: { module: 'Operations', page: 'Approvals' } },
  ];
}

// Tiny external store so state survives page switches inside the workspace.
let state = initialState;
const listeners = new Set<() => void>();
export const store = {
  get: () => state,
  getServer: () => initialState,
  dispatch(a: Action) { const next = reduce(state, a); if (next !== state) { state = next; listeners.forEach(l => l()); } },
  subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; },
};
