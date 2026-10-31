import { describe, expect, it } from 'vitest';
import {
  advanceWorkbenchSimulation,
  createWorkbenchSimulation,
  selectSchoolNeedSource,
  type SimulationAction,
  type SimulationPlan,
  type SimulationSource,
} from './workbench-simulation';
import { initialConsoleSnapshot, type ConsoleSnapshot } from './school-console-storage';

const source: SimulationSource = {
  consoleDraftId: 'school-need-1',
  assetName: 'Classroom learning materials',
  need: 'Prepare learning materials for the next term.',
  assetBuildCost: null,
};

const nonPhysicalPlan: SimulationPlan = {
  workKind: 'non-physical',
  institutionLabel: 'Sample School',
  scope: 'Prepare and review a learning-material package.',
  packages: [{
    id: 'package-1',
    title: 'Learning materials',
    deliverables: ['Reviewed learning-material set'],
    roleType: 'learning designer',
    dependsOn: [],
  }],
  costAssumptions: null,
  compensationTerms: 'User-defined scenario terms',
  rightsTerms: 'User-defined scenario rights',
  safetyRequirements: 'Review content for learner safety',
  acceptanceCriteria: ['Materials reviewed against the agreed brief'],
  unresolvedFacts: [],
};

describe('Workbench simulation', () => {
  it('projects only selected Console fields and retains unresolved stable references', () => {
    const snapshot: ConsoleSnapshot = {
      ...initialConsoleSnapshot,
      lessonDraft: 'private lesson text',
      feeNotes: [{ id: 'fee-1', description: 'private finance note', amountKes: 500 }],
      learnerNames: ['private learner'],
      tenderDrafts: [{
        id: source.consoleDraftId,
        assetName: source.assetName,
        need: source.need,
        assetBuildCost: '',
        projectedAnnualYield: 'sensitive unrelated value',
        localSpendPercentage: '',
        crewWageAllocation: { anchor: '', builder: '', apprentice: '' },
        economicModelNote: '',
        blueprintLines: [],
        createdAt: '2026-10-31T00:00:00.000Z',
      }],
    };
    const selected = selectSchoolNeedSource(snapshot, source.consoleDraftId, {
      commonsSignalId: 'stale-signal-id',
      institutionId: 'stale-institution-id',
      assetRecordId: 'stale-asset-id',
    });

    expect(selected).toEqual({
      consoleDraftId: source.consoleDraftId,
      assetName: source.assetName,
      need: source.need,
      assetBuildCost: null,
      commonsSignalId: 'stale-signal-id',
      institutionId: 'stale-institution-id',
      assetRecordId: 'stale-asset-id',
    });
    expect(JSON.stringify(selected)).not.toContain('private');
    expect(snapshot.tenderDrafts[0].projectedAnnualYield).toBe('sensitive unrelated value');
  });

  it('does not serialize extra fields passed with a selected source', () => {
    const extendedSource = Object.assign({}, source, { learnerNames: ['private learner'] });
    const extendedPlan = Object.assign({}, nonPhysicalPlan, { privateConsoleFields: 'must not persist' });
    const simulation = createWorkbenchSimulation(extendedSource, extendedPlan);

    expect(JSON.stringify(simulation)).not.toContain('private learner');
    expect(JSON.stringify(simulation)).not.toContain('privateConsoleFields');
    expect(Object.keys(simulation.source)).toEqual([
      'consoleDraftId',
      'assetName',
      'need',
      'assetBuildCost',
    ]);
  });

  it('rejects missing needs and invalid non-decimal costs', () => {
    const snapshot: ConsoleSnapshot = {
      ...initialConsoleSnapshot,
      tenderDrafts: [{
        id: source.consoleDraftId,
        assetName: source.assetName,
        need: source.need,
        assetBuildCost: '1e3',
        projectedAnnualYield: '',
        localSpendPercentage: '',
        crewWageAllocation: { anchor: '', builder: '', apprentice: '' },
        economicModelNote: '',
        blueprintLines: [],
        createdAt: '2026-10-31T00:00:00.000Z',
      }],
    };

    expect(() => selectSchoolNeedSource(snapshot, 'missing')).toThrow(/not found/i);
    expect(() => selectSchoolNeedSource(snapshot, source.consoleDraftId)).toThrow(/cost/i);
  });

  it('rejects unresolved physical-work facts before simulation can start', () => {
    const physicalPlan: SimulationPlan = {
      ...nonPhysicalPlan,
      workKind: 'physical-asset',
      proposedOutputAssetName: 'Classroom learning room',
      unresolvedFacts: ['Site access and safety remain unconfirmed.'],
    };

    expect(() => createWorkbenchSimulation(source, physicalPlan)).toThrow(/resolve physical-work facts/i);
    expect(() => createWorkbenchSimulation(source, {
      ...physicalPlan,
      unresolvedFacts: [],
    })).toThrow(/none identified/i);
    expect(() => createWorkbenchSimulation(source, {
      ...physicalPlan,
      proposedOutputAssetName: '',
      unresolvedFacts: ['None identified'],
    })).toThrow(/name the proposed physical output/i);
  });

  it('rejects circular work-package dependencies', () => {
    const circularPlan: SimulationPlan = {
      ...nonPhysicalPlan,
      packages: [
        { id: 'package-1', title: 'Plan', roleType: 'planner', deliverables: ['Plan'], dependsOn: ['package-2'] },
        { id: 'package-2', title: 'Review', roleType: 'reviewer', deliverables: ['Review'], dependsOn: ['package-1'] },
      ],
    };

    expect(() => createWorkbenchSimulation(source, circularPlan)).toThrow(/cannot contain a cycle/i);
  });

  it('rejects skipped or replayed stage actions', () => {
    const simulation = createWorkbenchSimulation(source, nonPhysicalPlan);

    expect(() => advanceWorkbenchSimulation(simulation, {
      type: 'delivery',
      evidence: ['Should not pass'],
    })).toThrow(/stage/i);

    const reviewed = advanceWorkbenchSimulation(simulation, {
      type: 'tender-review',
      outcome: 'proceed',
      note: 'Scenario review proceeds.',
    });
    expect(() => advanceWorkbenchSimulation(reviewed, {
      type: 'tender-review',
      outcome: 'proceed',
      note: 'Duplicate review.',
    })).toThrow(/stage/i);
  });

  it('completes non-physical work without creating a Roll preview', () => {
    let simulation = createWorkbenchSimulation(source, nonPhysicalPlan);
    simulation = advanceWorkbenchSimulation(simulation, {
      type: 'tender-review',
      outcome: 'proceed',
      note: 'Scenario review proceeds.',
    });
    simulation = advanceWorkbenchSimulation(simulation, {
      type: 'assembly',
      outcome: 'proceed',
      note: 'Scenario packages are composed.',
    });
    simulation = advanceWorkbenchSimulation(simulation, {
      type: 'delivery',
      evidence: ['Reviewed sample materials'],
    });
    simulation = advanceWorkbenchSimulation(simulation, {
      type: 'acceptance',
      outcome: 'accepted',
      note: 'Scenario criteria are met.',
    });

    expect(simulation.stage).toBe('acceptance_simulated');
    expect(simulation.status).toBe('completed');
    expect(simulation.rollPreview).toBeNull();
  });

  it('creates a Roll preview only after physical acceptance and deployment', () => {
    const physicalPlan: SimulationPlan = {
      ...nonPhysicalPlan,
      workKind: 'physical-asset',
      proposedOutputAssetName: 'Classroom learning room',
      unresolvedFacts: ['None identified'],
    };
    let simulation = createWorkbenchSimulation(source, physicalPlan);
    const actions: SimulationAction[] = [
      { type: 'tender-review', outcome: 'proceed', note: 'Scenario review proceeds.' },
      { type: 'assembly', outcome: 'proceed', note: 'Scenario packages are composed.' },
      { type: 'delivery', evidence: ['Installation checklist completed in scenario'] },
      { type: 'acceptance', outcome: 'accepted', note: 'Scenario criteria are met.' },
    ];
    for (const action of actions) simulation = advanceWorkbenchSimulation(simulation, action);

    expect(simulation.stage).toBe('acceptance_simulated');
    expect(simulation.rollPreview).toBeNull();

    simulation = advanceWorkbenchSimulation(simulation, {
      type: 'deployment',
      note: 'Scenario deployment recorded.',
    });
    expect(simulation.stage).toBe('roll_preview');
    expect(simulation.status).toBe('completed');
    expect(simulation.rollPreview?.assetName).toBe('Classroom learning room');
  });

  it('allows pause, resume, and cancellation without permitting stage skips', () => {
    let simulation = createWorkbenchSimulation(source, nonPhysicalPlan);
    simulation = advanceWorkbenchSimulation(simulation, { type: 'pause' });

    expect(simulation.status).toBe('paused');
    expect(() => advanceWorkbenchSimulation(simulation, {
      type: 'tender-review',
      outcome: 'proceed',
      note: 'Must not advance while paused.',
    })).toThrow(/paused/i);

    simulation = advanceWorkbenchSimulation(simulation, { type: 'resume' });
    expect(simulation.status).toBe('active');
    simulation = advanceWorkbenchSimulation(simulation, { type: 'cancel', note: 'User ended this scenario.' });
    expect(simulation.status).toBe('cancelled');
    expect(() => advanceWorkbenchSimulation(simulation, {
      type: 'tender-review',
      outcome: 'proceed',
      note: 'Must not advance after cancellation.',
    })).toThrow(/no longer active/i);
  });

  it('keeps returned and rejected acceptance outcomes terminal', () => {
    for (const outcome of ['returned', 'rejected'] as const) {
      let simulation = createWorkbenchSimulation(source, nonPhysicalPlan);
      simulation = advanceWorkbenchSimulation(simulation, {
        type: 'tender-review',
        outcome: 'proceed',
        note: 'Scenario review proceeds.',
      });
      simulation = advanceWorkbenchSimulation(simulation, {
        type: 'assembly',
        outcome: 'proceed',
        note: 'Scenario packages are composed.',
      });
      simulation = advanceWorkbenchSimulation(simulation, {
        type: 'delivery',
        evidence: ['Reviewed sample materials'],
      });
      simulation = advanceWorkbenchSimulation(simulation, {
        type: 'acceptance',
        outcome,
        note: `Scenario work is ${outcome}.`,
      });

      expect(simulation.status).toBe('blocked');
      expect(simulation.rollPreview).toBeNull();
      expect(() => advanceWorkbenchSimulation(simulation, {
        type: 'deployment',
        note: 'Must not deploy.',
      })).toThrow(/no longer active/i);
    }
  });
});
