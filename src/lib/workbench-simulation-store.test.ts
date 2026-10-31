import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  deleteWorkbenchSimulation,
  readWorkbenchSimulations,
  saveWorkbenchSimulation,
} from './workbench-simulation-store';
import { createWorkbenchSimulation, isWorkbenchSimulation, type SimulationPlan, type SimulationSource } from './workbench-simulation';

const simulationKey = 'aptlabs:workbench-simulations:v1';
const source: SimulationSource = {
  consoleDraftId: 'school-need-1',
  assetName: 'Classroom learning materials',
  need: 'Prepare learning materials for the next term.',
  assetBuildCost: null,
};
const plan: SimulationPlan = {
  workKind: 'non-physical',
  institutionLabel: 'Sample School',
  scope: 'Prepare learning materials.',
  packages: [{
    id: 'package-1',
    title: 'Materials',
    deliverables: ['Reviewed set'],
    roleType: 'learning designer',
    dependsOn: [],
  }],
  costAssumptions: null,
  compensationTerms: 'Scenario terms',
  rightsTerms: 'Scenario rights',
  safetyRequirements: 'Review content',
  acceptanceCriteria: ['Materials reviewed'],
  unresolvedFacts: [],
};

function storage() {
  const values = new Map<string, string>([
    ['aptlabs:commons-signals:v1', '[{"preserve":"commons"}]'],
    ['aptlabs:workbench-drafts:v1', '[{"preserve":"brief"}]'],
    ['aptlabs:workbench-local-flow:v1', '{"preserve":"application"}'],
  ]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    values,
  });
  return values;
}

afterEach(() => vi.unstubAllGlobals());

describe('isolated Workbench simulation store', () => {
  it('round-trips records without changing existing module storage', () => {
    const values = storage();
    const simulation = createWorkbenchSimulation(source, plan);

    expect(isWorkbenchSimulation(simulation)).toBe(true);
    saveWorkbenchSimulation(simulation);

    expect(readWorkbenchSimulations()).toEqual([simulation]);
    expect(values.get('aptlabs:commons-signals:v1')).toBe('[{"preserve":"commons"}]');
    expect(values.get('aptlabs:workbench-drafts:v1')).toBe('[{"preserve":"brief"}]');
    expect(values.get('aptlabs:workbench-local-flow:v1')).toBe('{"preserve":"application"}');
    expect([...values.keys()].filter(key => key === simulationKey)).toEqual([simulationKey]);
  });

  it('rejects corrupt JSON and unsupported simulation schema versions', () => {
    const values = storage();
    values.set(simulationKey, '{');
    expect(() => readWorkbenchSimulations()).toThrow(/damaged/i);

    values.set(simulationKey, JSON.stringify([{ schemaVersion: 9 }]));
    expect(() => readWorkbenchSimulations()).toThrow(/unsupported|invalid/i);
  });

  it('rejects unknown persisted fields and lifecycle states that cannot be reached', () => {
    const simulation = createWorkbenchSimulation(source, plan);
    expect(isWorkbenchSimulation({
      ...simulation,
      source: { ...simulation.source, learnerNames: ['private learner'] },
    })).toBe(false);
    expect(isWorkbenchSimulation({
      ...simulation,
      stage: 'roll_preview',
    })).toBe(false);
  });

  it('deletes only the selected simulation', () => {
    const values = storage();
    const first = createWorkbenchSimulation(source, plan);
    const second = createWorkbenchSimulation({ ...source, consoleDraftId: 'school-need-2' }, plan);
    saveWorkbenchSimulation(first);
    saveWorkbenchSimulation(second);

    deleteWorkbenchSimulation(first.id);

    expect(readWorkbenchSimulations()).toEqual([second]);
    expect(values.has('aptlabs:commons-signals:v1')).toBe(true);
  });
});
