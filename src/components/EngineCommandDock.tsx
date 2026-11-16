import { useEffect, useState } from 'preact/hooks';
import { Button } from './ui/Button';
import type { PlanStep, ProposedPlan } from '@/lib/engine-agent';
import { createEngineAgent, readStoredIdentity } from '@/lib/engine-agent';
import { advanceGate } from '@/modules/workbench/data';

interface EngineCommandDockProps {
  undertakingId?: string;
  undertakingTitle?: string;
  actor?: string;
  actorRole?: string;
}

export function EngineCommandDock({
  undertakingId,
  undertakingTitle,
  actor,
  actorRole,
}: EngineCommandDockProps) {
  const [agent, setAgent] = useState<any>(null);
  const [context, setContext] = useState<any>(null);
  const [plan, setPlan] = useState<ProposedPlan | null>(null);
  const [status, setStatus] = useState<'idle' | 'planning' | 'gated' | 'executing' | 'executed' | 'error'>('idle');
  const [error, setError] = useState('');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const identity = readStoredIdentity() || {
    id: 'engine-agent-01',
    name: 'EngineAgent',
    role: 'authorizer',
    scope: ['workbench:read', 'workbench:advance', 'records:read'],
    allowedTools: ['workbench:advance', 'records:read'],
  };

  useEffect(() => {
    if (!agent) {
      setAgent(createEngineAgent(identity));
    }
  }, [agent, identity]);

  useEffect(() => {
    if (undertakingId && undertakingTitle && actor && actorRole && agent && !context) {
      setContext(agent.buildContext({
        undertakingId,
        undertakingTitle,
        actor,
        actorRole,
      }));
    }
  }, [agent, undertakingId, undertakingTitle, actor, actorRole, context]);

  const canGate = plan && agent && agent.canUseTool('workbench:advance');

  function proposePlan(): void {
    if (!context || !agent) return;
    setStatus('planning');
    setError('');
    setCurrentStepIndex(0);
    try {
      const steps: Array<{ tool: string; action: string; rationale: string; requiresApproval?: boolean }> = [
        { tool: 'workbench:advance', action: 'Review gate readiness', rationale: 'Confirm call sheet, capital, and crew are complete before advancing.', requiresApproval: true },
        { tool: 'records:read', action: 'Inspect evidence layers', rationale: 'Verify public, participant, and restricted evidence exist for this gate.', requiresApproval: false },
        { tool: 'workbench:advance', action: 'Advance undertaking gate', rationale: 'Move the undertaking to the next operational gate.', requiresApproval: true },
      ];
      const proposed = agent.plan(context, steps);
      setPlan(proposed);
      setStatus('gated');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plan could not be proposed.');
      setStatus('error');
    }
  }

  function authorizePlan(): void {
    if (!plan || !agent || !undertakingId) return;
    const gate = agent.gate(plan.id, actor || '');
    if (!gate.allowed) {
      setError(gate.reason);
      return;
    }
    agent.approvePlan(plan.id, actor || '');
    setStatus('executing');
    setCurrentStepIndex(0);
    executeNextStep();
  }

  function executeNextStep(): void {
    if (!plan || !agent) return;
    const step = plan.steps[currentStepIndex];
    if (!step) {
      setStatus('executed');
      return;
    }
    try {
      if (step.tool === 'workbench:advance' && undertakingId) {
        advanceGate(undertakingId, actor || '', step.action);
      }
      agent.execute(plan.id, step.id, actor || '', `Executed ${step.action}.`);
      setCurrentStepIndex(currentStepIndex + 1);
      // Small tick so the UI shows progress; real execution is synchronous here.
      setTimeout(executeNextStep, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Step ${step.action} failed.`);
      setStatus('error');
    }
  }

  function rejectPlan(reason: string): void {
    if (!plan || !agent) return;
    agent.rejectPlan(plan.id, actor || '', reason);
    setStatus('idle');
    setPlan(null);
    setCurrentStepIndex(0);
  }

  return (
    <section className="engine-command-dock" aria-label="EngineAgent command dock">
      <header className="engine-command-dock-head">
        <h3 className="engine-command-dock-title">EngineAgent · governed execution</h3>
        <span className="engine-command-dock-mode">
          {agent?.identity.role} · {agent?.identity.id}
        </span>
      </header>

      {error && <p className="engine-command-dock-error" role="alert">{error}</p>}

      {context && status === 'idle' && (
        <div className="engine-command-dock-context">
          <p className="engine-command-dock-note">
            Context assembled for <strong>{context.undertakingTitle}</strong> by{' '}
            <strong>{context.actor}</strong> ({context.actorRole}).
          </p>
          <Button onClick={proposePlan}>Propose plan</Button>
        </div>
      )}

      {context && status === 'gated' && plan && (
        <div className="engine-command-dock-plan">
          <h4 className="engine-command-dock-plan-title">Proposed plan</h4>
          <ul className="engine-command-dock-plan-steps">
            {plan.steps.map((step, i) => (
              <li key={step.id} className={`engine-command-dock-plan-step${i === currentStepIndex ? ' is-current' : ''}${i < currentStepIndex ? ' is-done' : ''}`}>
                <span className="engine-command-dock-plan-tool">{step.tool}</span>
                <span className="engine-command-dock-plan-action">{step.action}</span>
                <span className="engine-command-dock-plan-rationale">{step.rationale}</span>
                {step.requiresApproval && <span className="engine-command-dock-plan-requires">requires approval</span>}
              </li>
            ))}
          </ul>
          <div className="engine-command-dock-plan-actions">
            <Button
              variant="ghost"
              onClick={() => rejectPlan('Human steward rejected the plan.')}
              disabled={!canGate}
            >
              Reject
            </Button>
            <Button
              onClick={authorizePlan}
              disabled={!canGate}
            >
              Authorise execution
            </Button>
            <p className="engine-command-dock-plan-note">
              {canGate
                ? 'Authorising permits the EngineAgent to execute the approved steps against this undertaking.'
                : 'You do not hold authority to gate this plan.'}
            </p>
          </div>
        </div>
      )}

      {status === 'executing' && (
        <div className="engine-command-dock-result">
          <p className="engine-command-dock-result-note">
            Executing step {currentStepIndex + 1} of {plan?.steps.length ?? 0}… EngineAgent acts only on
            authorised steps, one at a time.
          </p>
        </div>
      )}

      {status === 'executed' && (
        <div className="engine-command-dock-result">
          <p className="engine-command-dock-result-note">
            Plan executed. All approved steps applied to the undertaking. Traces recorded — EngineAgent does
            not act without human approval.
          </p>
        </div>
      )}

      <div className="engine-command-dock-trace">
        <h4 className="engine-command-dock-trace-title">Execution trace</h4>
        {agent ? (
          <ul className="engine-command-dock-trace-list">
            {agent.readTraces().map((trace: any) => (
              <li key={trace.id} className="engine-command-dock-trace-item">
                <span className="engine-command-dock-trace-actor">{trace.actor}</span>
                <span className="engine-command-dock-trace-action">{trace.action}</span>
                <span className="engine-command-dock-trace-result">{trace.result}</span>
                <span className="engine-command-dock-trace-note">{trace.note}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export type { PlanStep, ProposedPlan };
