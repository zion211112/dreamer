import type { SimulationEvent, SimulationStage, SimulationPlanSource } from '../../lib/workbench-simulation';

const labels: Record<SimulationStage, string> = {
  candidate_drafted: 'Tender candidate',
  tender_review_simulated: 'Tender review',
  assembly_simulated: 'Assembly',
  delivery_simulated: 'Delivery',
  acceptance_simulated: 'Acceptance',
  roll_preview: 'Roll preview',
};

export function SimulationTrace({
  events,
  planSource,
}: {
  events: readonly SimulationEvent[];
  planSource: SimulationPlanSource;
}) {
  return (
    <section aria-labelledby="workbench-sim-trace-title" className="workbench-sim-trace">
      <header>
        <div>
          <p className="workbench-sim-kicker">EVENT TRACE / {planSource.toUpperCase()} PLAN</p>
          <h2 id="workbench-sim-trace-title">Simulation history</h2>
        </div>
        <span>{String(events.length).padStart(2, '0')} events</span>
      </header>
      {events.length === 0 ? <p className="workbench-sim-empty">No stage actions recorded yet.</p> : (
        <ol>
          {events.map(event => (
            <li key={event.id}>
              <span className="workbench-sim-trace-mark" aria-hidden="true" />
              <div>
                <strong>{labels[event.stage]}</strong>
                <p>{event.note}</p>
                {event.evidence && <small>Scenario evidence · {event.evidence.join(' · ')}</small>}
              </div>
              <span className="workbench-sim-trace-actor">{event.actorRole === 'user' ? 'USER' : 'SIMULATED ROLE'}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
