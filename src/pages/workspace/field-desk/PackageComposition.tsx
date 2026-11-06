import { useState } from 'preact/hooks';
import type { SimulationPlan } from '../../../lib/workbench-simulation';

export function PackageComposition({ plan }: { plan: SimulationPlan }) {
  const [view, setView] = useState<'packages' | 'composition'>('packages');

  return (
    <section aria-labelledby="workbench-sim-package-title" className="workbench-sim-package-view">
      <header className="workbench-sim-section-head">
        <div><p className="workbench-sim-kicker">ASSEMBLY / SIMULATED</p><h2 id="workbench-sim-package-title">Work packages</h2></div>
        <div aria-label="Package view" className="workbench-sim-toggle" role="group">
          <button aria-pressed={view === 'packages'} onClick={() => setView('packages')} type="button">List</button>
          <button aria-pressed={view === 'composition'} onClick={() => setView('composition')} type="button">Composition</button>
        </div>
      </header>
      {view === 'packages' ? (
        <ol className="workbench-sim-package-list">
          {plan.packages.map((item, index) => (
            <li key={item.id}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><strong>{item.title}</strong><small>{item.roleType} · {item.deliverables.join(' / ')}</small></div>
            </li>
          ))}
        </ol>
      ) : (
        <ol aria-label="Package dependency composition" className="workbench-sim-composition">
          {plan.packages.map(item => (
            <li key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.roleType}</span>
              <small>{item.dependsOn.length
                ? `Depends on ${item.dependsOn.map(id => plan.packages.find(candidate => candidate.id === id)?.title ?? `Unresolved package ${id}`).join(', ')}`
                : 'No package dependency recorded'}</small>
            </li>
          ))}
        </ol>
      )}
      <p className="workbench-sim-muted">Package roles are scenario roles, not assigned providers.</p>
    </section>
  );
}
