import { isWorkbenchSimulation, type WorkbenchSimulation } from './workbench-simulation';

const simulationStorageKey = 'aptlabs:workbench-simulations:v1';

export function readWorkbenchSimulations(): WorkbenchSimulation[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(simulationStorageKey);
  } catch {
    throw new Error('This browser could not read saved Workbench simulations. Check storage settings and reload.');
  }
  if (raw === null) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Saved Workbench simulations are damaged. Existing source records were not changed.');
  }
  if (!Array.isArray(parsed) || !parsed.every(isWorkbenchSimulation)
    || new Set(parsed.map(simulation => simulation.id)).size !== parsed.length) {
    throw new Error('Saved Workbench simulations have an unsupported or invalid format.');
  }
  return parsed;
}

export function writeWorkbenchSimulations(simulations: WorkbenchSimulation[]): void {
  if (!Array.isArray(simulations) || !simulations.every(isWorkbenchSimulation)) {
    throw new Error('The Workbench simulation data is invalid and was not saved.');
  }
  try {
    localStorage.setItem(simulationStorageKey, JSON.stringify(simulations));
  } catch {
    throw new Error('This browser could not save the Workbench simulation. Source records were not changed.');
  }
}

export function saveWorkbenchSimulation(simulation: WorkbenchSimulation): void {
  if (!isWorkbenchSimulation(simulation)) throw new Error('The Workbench simulation is invalid and was not saved.');
  const saved = readWorkbenchSimulations();
  const existingIndex = saved.findIndex(item => item.id === simulation.id);
  if (existingIndex < 0) saved.unshift(simulation);
  else saved[existingIndex] = simulation;
  writeWorkbenchSimulations(saved);
}

export function deleteWorkbenchSimulation(simulationId: string): void {
  const saved = readWorkbenchSimulations();
  const remaining = saved.filter(item => item.id !== simulationId);
  if (remaining.length !== saved.length) writeWorkbenchSimulations(remaining);
}
