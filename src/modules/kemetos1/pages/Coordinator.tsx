import { useState } from 'preact/hooks';
import { PageHead } from '@/components/PageHead';
import { Button } from '@/components/Button';
import { Input } from '@/components/ui/Input';
import { WorkspaceLayout } from '@/pages/workspace/WorkspaceLayout';
import {
  kemetos1Coordinator,
  type WorkspaceEssence,
  type CoordinationProposal,
} from '../lib/coordinator';
import {
  pilotByKey,
  workItemsForPilot,
  type WorkItem,
  type GateState,
  GATE_LABELS,
} from '@/modules/workbench/data';
import '../styles/kemetos1.css';

function GateChip({ gate }: { gate: GateState }) {
  const label = GATE_LABELS[gate];
  const colorKey = gate === 'accepted' || gate === 'authorized' || gate === 'in_execution'
    ? 'canon'
    : gate === 'proposed'
      ? 'proposed'
      : gate === 'pending_authorization'
        ? 'risk'
        : 'caution';
  return (
    <span className={`k1-item-gate k1-gate--${colorKey}`}>
      {label}
    </span>
  );
}

export function Coordinator() {
  const [essence, setEssence] = useState<WorkspaceEssence | null>(null);
  const [proposal, setProposal] = useState<CoordinationProposal | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const [verifying, setVerifying] = useState<{ email: string; ok: boolean } | null>(null);
  const [email, setEmail] = useState('');

  async function loadEssence() {
    setEssence(await kemetos1Coordinator.graspEssence());
  }

  async function proposeFor(item: WorkItem) {
    const p = await kemetos1Coordinator.proposeNextStep(item);
    setProposal(p);
    setMessage(null);
  }

  async function applyProposal() {
    if (!proposal) return;
    try {
      if (proposal.type === 'brief') {
        await kemetos1Coordinator.applyBrief(proposal);
        setMessage({ kind: 'ok', text: 'Work brief draft saved.' });
      } else if (proposal.nextGate) {
        const item = items.find((i) => i.id === proposal.targetId);
        kemetos1Coordinator.applyWorkUpdate(
          proposal.targetId,
          item?.gate ?? 'draft',
          proposal.nextGate,
          'coordinator',
          'Applied from Kemetos1 coordinator.',
        );
        setMessage({ kind: 'ok', text: `Work update recorded → ${GATE_LABELS[proposal.nextGate]}.` });
      }
      setProposal(null);
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Apply failed.' });
    }
  }

  async function verifyUser(emailValue: string) {
    setVerifying({ email: emailValue, ok: false });
    const ok = kemetos1Coordinator.verifyUser(emailValue, 'kemetos');
    setVerifying({ email: emailValue, ok });
    setMessage({
      kind: ok ? 'ok' : 'error',
      text: ok ? 'User verified as Kemetos steward.' : 'User is not a Kemetos steward.',
    });
  }

  async function routeFromBenbenos(item: WorkItem) {
    try {
      kemetos1Coordinator.routeJob('benbenos', item.id, `Routed from Benbenos pilot: ${item.title}.`);
      setMessage({ kind: 'ok', text: `Job routed from benbenos: ${item.title}.` });
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Routing failed.' });
    }
  }

  async function issueAttestation(item: WorkItem) {
    try {
      kemetos1Coordinator.issueAttestation(item.id, 'coordinator-review', 'Coordinator reviewed and attested this work item.');
      setMessage({ kind: 'ok', text: 'Attestation issued.' });
    } catch (error) {
      setMessage({ kind: 'error', text: error instanceof Error ? error.message : 'Attestation failed.' });
    }
  }

  if (!essence) {
    loadEssence();
    return <p className="k1-empty">Grasping workspace essence…</p>;
  }

  const pilot = pilotByKey('kemetos');
  const items = pilot ? workItemsForPilot('kemetos') : [];

  return (
    <WorkspaceLayout currentContext="workbench">
      <div className="k1-page">
        <PageHead
          eyebrow="APT-LABS / Kemetos1 Coordinator"
          title="Kemetos1"
          subtitle="Coordinator layer — grasps essence, verifies users, updates work, issues attestations, routes jobs."
        />

        {message && (
          <p
            className="k1-notice"
            style={{ color: message.kind === 'ok' ? 'var(--ok)' : 'var(--danger)' }}
            role="alert"
          >
            {message.text}
          </p>
        )}

        {/* Essence — the lean grasp of what's happening now */}
        <section className="k1-essence">
          <div className="k1-essence-head">
            <span className="k1-essence-pilot">Kemetos1 coordinator layer</span>
            <span className="k1-mode">{essence.summary.includes('heuristic') ? 'local-heuristic mode' : 'llm mode'}</span>
          </div>
          <div className="k1-essence-meta">
            <span><b>{essence.signalCount}</b> signals</span>
            <span><b>{essence.activeSignalCount}</b> active</span>
            <span><b>{essence.workItemCount}</b> work items</span>
            <span><b>{essence.openWorkItemCount}</b> open</span>
          </div>
          <p className="k1-summary">{essence.summary}</p>
          <h3 className="k1-section-title">Next steps</h3>
          <ul className="k1-next-steps">
            {essence.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </section>

        {/* Simple user verification */}
        <section className="k1-section">
          <h2 className="k1-section-title">Verify user</h2>
          <div className="k1-actions">
            <Input
              type="email"
              value={email}
              onInput={(event) => setEmail(event.currentTarget.value)}
              placeholder="steward email"
            />
            <Button size="sm" onClick={() => verifyUser(email)}>
              Verify steward
            </Button>
            {verifying && (
              <span className="k1-mode">
                {verifying.email} — {verifying.ok ? 'Verified steward' : 'Not a steward'}
              </span>
            )}
          </div>
        </section>

        {/* Work items — operate the Kemetos pilot */}
        <section className="k1-section">
          <h2 className="k1-section-title">Kemetos work items</h2>
          {items.length === 0 ? (
            <p className="k1-empty">No Kemetos work items.</p>
          ) : (
            <div className="k1-list">
              {items.map((item) => {
                const expanded = proposal?.targetId === item.id;
                return (
                  <div key={item.id} className="k1-item">
                    <div className="k1-item-main">
                      <h3>{item.title}</h3>
                      <p className="k1-item-meta">{item.discipline} · {item.location}</p>
                    </div>
                    <GateChip gate={item.gate} />
                    <div className="k1-actions">
                      <Button variant="ghost" size="sm" onClick={() => proposeFor(item)}>
                        {expanded ? 'Cancel' : 'Propose next'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => routeFromBenbenos(item)}>
                        Route from benbenos
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => issueAttestation(item)}>
                        Issue attestation
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Proposal preview — human applies */}
        {proposal && (
          <section className="k1-proposal">
            <div className="k1-proposal-head">
              <span className="k1-proposal-type">{proposal.type}</span>
              <h3 className="k1-proposal-title">{proposal.title}</h3>
            </div>
            <p>{proposal.rationale}</p>
            <p className="k1-proposal-note">{proposal.suggestedAction}</p>
            <div className="k1-actions">
              <Button variant="primary" size="sm" onClick={applyProposal} disabled={!proposal.nextGate && proposal.type !== 'brief'}>
                Apply
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setProposal(null)}>Dismiss</Button>
            </div>
          </section>
        )}

        <p className="k1-notice">
          Propose-never-executes: the coordinator proposes, a steward applies. Nothing is sent to a remote system.
        </p>
      </div>
    </WorkspaceLayout>
  );
}
