// The commitment machine: lib/board.ts, compiled in memory with the project's
// own compiler, exactly as tests/learning-demo.test.cjs does it.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const source = fs.readFileSync(path.join(__dirname, '../lib/board.ts'), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 }
});
const mod = { exports: {} };
new Function('exports', 'require', 'module', compiled.outputText)(mod.exports, require, mod);
const {
  parseSkills, RATIFY, upDown, upNeeded, windowClosesAt,
  activeBuilders, validAttestations,
  deriveState, boardStatus, boardOrder, STATE,
  submitClaim, acceptClaim, withdrawClaim, logProgress, attest, park, forkParentId, lineageOf
} = mod.exports;

const T0 = Date.UTC(2026, 8, 18, 12, 0, 0);
const H = 3600000;
const D = 24 * H;

function mk(over = {}) {
  return {
    id: 'T-1', by: 'AptLabs', title: 't', body: 'b', domain: 'Other', type: 'NEED',
    needs: { labor: 1, materials: '', funds: 0, intellect: '', nothing: false },
    location: '', done: 'done line', contact: 'dm', waRequests: [],
    votes: 0, votedBy: {}, comments: [], attachments: [],
    createdTs: T0, tierAtPost: 'visitor',
    risk: 'low', skills: [], claims: [], progress: [], attestations: [],
    parkedBy: null, parkedAt: null,
    ...over
  };
}
const upVotes = (n) => Object.fromEntries(Array.from({ length: n }, (_, i) => [`v${i}`, { value: 1, ts: T0 + 1000 }]));
const claim = (by, role, status, ts = T0 + D) => ({ by, role, reason: 'a reason', status, ts });
const att = (by, evidence, hall, ts = T0 + 3 * D) => ({ by, evidence, hall, ts });

test('skills parse to the yard, and only the yard', () => {
  assert.deepEqual(parseSkills('Civil, swahili')['skills'], ['civil', 'swahili']);
  assert.deepEqual(parseSkills('')['skills'], []);
  assert.ok(parseSkills('civil, bogus')['err']);
  assert.deepEqual(parseSkills('civil, CIVIL, civil')['skills'], ['civil']);
});

test('a fresh proposal is open, and the bar is closed-form per risk class', () => {
  assert.equal(deriveState(mk(), T0 + H), 'proposed');
  assert.equal(upNeeded(mk()), RATIFY.low.minVoters);
  assert.equal(upNeeded(mk({ risk: 'medium' })), RATIFY.medium.minVoters);
  assert.equal(upNeeded(mk({ risk: 'high' })), RATIFY.high.minVoters);
  assert.equal(windowClosesAt(mk()) - T0, 72 * H);
  assert.equal(windowClosesAt(mk({ risk: 'high' })) - T0, 96 * H);
});

test('the share shortfall counts, not percentages', () => {
  assert.equal(upNeeded(mk({ votedBy: { ...upVotes(1), x: { value: -1, ts: T0 }, y: { value: -1, ts: T0 }, z: { value: -1, ts: T0 } } })), 1);
  assert.equal(upNeeded(mk({ risk: 'high', votedBy: { ...upVotes(3), x: { value: -1, ts: T0 }, y: { value: -1, ts: T0 }, z: { value: -1, ts: T0 } } })), 2);
});

test('ratification fires the moment the bar is met; the window is a deadline', () => {
  assert.equal(deriveState(mk({ votedBy: upVotes(2) }), T0 + H), 'ratified');
  assert.equal(deriveState(mk({ risk: 'high', votedBy: upVotes(5) }), T0 + H), 'ratified');
  assert.equal(deriveState(mk({ risk: 'high', votedBy: upVotes(3) }), T0 + 97 * H), 'lapsed');
  assert.ok(boardStatus(mk({ risk: 'high', votedBy: upVotes(3) }), T0 + 97 * H).includes('fork'));
});

test('a seated builder claims, first progress activates, claims never decay', () => {
  let b = mk({ votedBy: upVotes(2) });
  const r1 = submitClaim(b, 'Fundi_1', 'member', 'builder', 'i have the hands', T0 + D);
  assert.equal(r1.err, null);
  b = r1.b;
  // a raised hand is motion, not a seat: still ratified, not claimed
  assert.equal(deriveState(b, T0 + D), 'ratified');
  const r2 = acceptClaim(b, 'Shemsu_Node', 'Fundi_1', 'builder', 'hall', T0 + D + 1000);
  assert.equal(r2.err, null);
  b = r2.b;
  assert.deepEqual(activeBuilders(b), ['Fundi_1']);
  assert.equal(deriveState(b, T0 + D + 1000), 'claimed');
  const r3 = logProgress(b, 'Fundi_1', 'piers are in', T0 + 2 * D);
  assert.equal(r3.err, null);
  assert.equal(deriveState(r3.b, T0 + 2 * D), 'active');
  // ninety days later, with no further signal, the claimed build still runs
  assert.equal(deriveState(r3.b, T0 + 120 * D), 'active');
});

test('only a seated builder logs progress, with a real line', () => {
  const b = mk({ votedBy: upVotes(2), claims: [claim('Fundi_1', 'builder', 'pending')] });
  assert.ok(logProgress(b, 'Fundi_1', 'piers', T0 + D).err);
  assert.ok(logProgress(b, 'Stranger', 'piers', T0 + D).err);
  assert.ok(logProgress(mk({ claims: [claim('Fundi_1', 'builder', 'active')] }), 'Stranger', 'piers', T0 + D).err);
});

test('attestation: distinct hands, not the builders, with evidence', () => {
  const b0 = mk({ risk: 'medium', votedBy: upVotes(3), claims: [claim('Fundi_1', 'builder', 'active')] });
  let b = logProgress(b0, 'Fundi_1', 'corpus staged', T0 + 2 * D).b;
  assert.equal(deriveState(b, T0 + 2 * D), 'active');
  b = attest(b, 'Keeper_1', 'survey on the floor', 'hall', T0 + 3 * D).b;
  b = attest(b, 'Fundi_1', 'i did it', 'hall', T0 + 3 * D + 1000).b; // building hand, ignored
  assert.equal(validAttestations(b).length, 1);
  assert.equal(deriveState(b, T0 + 3 * D), 'active');
  b = attest(b, 'Shemsu_1', 'photos from both banks', 'hall', T0 + 3 * D + 2000).b;
  assert.equal(deriveState(b, T0 + 3 * D), 'done');
  assert.ok(boardStatus(b, T0 + 3 * D).includes('closed'));
});

test('high risk closes with a hall hand in the quorum', () => {
  const b0 = mk({
    risk: 'high',
    votedBy: upVotes(5),
    claims: [
      claim('Fundi_1', 'builder', 'active', T0 + D),
      { by: 'Zep_1', role: 'reviewer', reason: 'eyes', status: 'active', ts: T0 + D }
    ]
  });
  let b = logProgress(b0, 'Fundi_1', 'decking on', T0 + 2 * D).b;
  b = attest(b, 'Zep_1', 'photos ok', 'member', T0 + 3 * D).b; // seated reviewer, not hall
  assert.equal(deriveState(b, T0 + 3 * D), 'active');
  b = attest(b, 'Shemsu_1', 'load test passed', 'hall', T0 + 3 * D + 1000).b;
  assert.equal(deriveState(b, T0 + 3 * D + 1000), 'done');
});

test('attestation gates: hall or seated reviewer; one attestation per hand', () => {
  const b = mk({ risk: 'low', votedBy: upVotes(2), claims: [claim('Fundi_1', 'builder', 'active')] });
  assert.ok(attest(b, 'Fundi_1', 'i did it', 'hall', T0 + D).err.includes('does not close'));
  assert.ok(attest(b, 'Stranger', 'photos', 'visitor', T0 + D).err);
  const r = attest(b, 'Shemsu_1', 'photos', 'hall', T0 + D);
  assert.equal(r.err, null);
  assert.ok(attest(r.b, 'Shemsu_1', 'again', 'hall', T0 + D + 1000).err.includes('already attested'));
});

test('claim gates: member at the door, hall at the seat, one per role', () => {
  let b = mk({ votedBy: upVotes(2) });
  assert.ok(submitClaim(b, '', 'member', 'builder', 'hands', T0 + D).err);
  assert.ok(submitClaim(b, 'X', 'visitor', 'builder', 'hands', T0 + D).err);
  assert.ok(submitClaim(b, 'X', 'member', 'reviewer', 'eyes', T0 + D).err);
  b = submitClaim(b, 'X', 'member', 'builder', 'hands', T0 + D).b;
  assert.ok(submitClaim(b, 'X', 'member', 'builder', 'more hands', T0 + D).err.includes('already'));
  assert.equal(submitClaim(b, 'X', 'hall', 'reviewer', 'eyes', T0 + D).err, null);
});

test('accepting is author or hall; withdrawing is your own seat', () => {
  let b = mk({ votedBy: upVotes(2), claims: [claim('Fundi_1', 'builder', 'pending')] });
  assert.ok(acceptClaim(b, 'Stranger', 'Fundi_1', 'builder', 'member', T0 + D).err);
  assert.equal(acceptClaim(b, 'AptLabs', 'Fundi_1', 'builder', 'member', T0 + D).err, null);
  const mine = acceptClaim({ ...b, by: 'Fundi_1' }, 'Fundi_1', 'Fundi_1', 'builder', 'member', T0 + D + 1000);
  assert.equal(mine.err, null);
  const w = withdrawClaim(mine.b, 'Fundi_1', 'Fundi_1', 'builder', T0 + D + 2000);
  assert.equal(w.err, null);
  assert.deepEqual(activeBuilders(w.b), []);
  assert.ok(withdrawClaim(mine.b, 'Stranger', 'Fundi_1', 'builder', T0 + D + 2000).err);
});

test('stillness parks a silent proposal; a seated claim stays alive', () => {
  assert.equal(deriveState(mk(), T0 + 91 * D), 'parked');
  assert.ok(boardStatus(mk(), T0 + 91 * D).includes('rest'));
  const seated = mk({ claims: [claim('Fundi_1', 'builder', 'active', T0 + 91 * D - 1000)] });
  assert.equal(deriveState(seated, T0 + 91 * D), 'claimed');
});

test('explicit park by author or hall; closed states will not rest or reopen', () => {
  const b = mk({ votedBy: upVotes(2) });
  assert.ok(park(b, 'Stranger', 'member', T0 + D).err);
  const r = park(b, 'AptLabs', 'member', T0 + D);
  assert.equal(r.err, null);
  assert.equal(deriveState(r.b, T0 + D), 'parked');
  assert.ok(park(r.b, 'AptLabs', 'member', T0 + D).err);
  const done = mk({
    votedBy: upVotes(2),
    claims: [claim('Fundi_1', 'builder', 'active')],
    attestations: [att('Shemsu_1', 'proof', true)]
  });
  assert.ok(park(done, 'AptLabs', 'member', T0 + D).err.includes('Fork'));
});

test('board order: open states lead, more votes first, then newer', () => {
  const t = T0 + 20 * H;
  const a = mk({ votedBy: upVotes(2) }); // low bar met -> ratified
  const b = { ...a, id: 'T-2', votedBy: upVotes(3), createdTs: T0 + H }; // ratified, more votes
  const c = { ...a, id: 'T-3', votedBy: {}, createdTs: T0 + H }; // nothing raised -> open
  const closed = { ...a, id: 'T-4', risk: 'high', votedBy: upVotes(3), createdTs: T0 - 80 * H }; // window shut, unmet
  assert.equal(deriveState(closed, t), 'lapsed');
  assert.equal(deriveState(c, t), 'proposed');
  assert.deepEqual(boardOrder([c, closed, a, b], t).map((x) => x.id), ['T-3', 'T-2', 'T-1', 'T-4']);
  assert.equal(STATE.done.rank, 4);
  assert.equal(STATE.lapsed.rank, 6);
  assert.equal(STATE.active.rank, 3);
});

test('fork lineage walks parents and lists children — the family, not the thread', () => {
  const root = { ...mk({ id: 'R' }) };
  const mid = { ...mk({ id: 'M', by: 'kim' }), comments: [{ by: 'kim', text: 'Fork of R', ts: T0 + 1000, fork: true }] };
  const leaf = { ...mk({ id: 'L', by: 'lee' }), comments: [{ by: 'lee', text: 'Fork of M', ts: T0 + 2000, fork: true }] };
  const all = [root, mid, leaf];
  const t = T0 + 4 * D;

  assert.equal(forkParentId(leaf), 'M');
  assert.equal(forkParentId(mid), 'R');
  assert.equal(forkParentId(root), null);

  const lf = lineageOf(leaf, all, t);
  assert.deepEqual(lf.ancestors.map((x) => x.id), ['R', 'M']); // root-first
  assert.equal(lf.children.length, 0);
  assert.equal(lf.hasFork, true);

  const mf = lineageOf(mid, all, t);
  assert.deepEqual(mf.ancestors.map((x) => x.id), ['R']);
  assert.deepEqual(mf.children.map((x) => x.id), ['L']);

  const rf = lineageOf(root, all, t);
  assert.equal(rf.ancestors.length, 0);
  assert.deepEqual(rf.children.map((x) => x.id), ['M']);
});

test('no fork, no lineage — an ordinary build has no family', () => {
  const a = mk({ id: 'A' });
  const b = mk({ id: 'B' });
  const f = lineageOf(a, [a, b], T0 + D);
  assert.equal(f.hasFork, false);
  assert.equal(f.ancestors.length, 0);
  assert.equal(f.children.length, 0);
});