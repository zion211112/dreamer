import type {
  SimulationAction,
  SimulationStage,
  SimulationStatus,
  WorkbenchViewStage,
} from './workbench-simulation';

export type SimulationGate = 'proceed' | 'blocked' | 'auto';

export interface SimulationStageCard {
  readonly id: SimulationStage;
  readonly label: string;
  readonly rollApplicable: boolean;
  readonly terminal: boolean;
  readonly advance: null | {
    readonly type: 'tender-review' | 'assembly' | 'delivery' | 'acceptance' | 'deployment';
    readonly label: string;
    readonly needsEvidence: boolean;
    readonly needsNote: boolean;
    readonly defaultOutcome?: 'proceed' | 'blocked' | 'accepted' | 'returned' | 'rejected';
  };
}

export const SIMULATION_STAGES: Record<SimulationStage, SimulationStageCard> = {
  candidate_drafted: {
    id: 'candidate_drafted',
    label: 'Tender review',
    rollApplicable: false,
    terminal: false,
    advance: {
      type: 'tender-review',
      label: 'Record simulated step',
      needsEvidence: false,
      needsNote: true,
      defaultOutcome: 'proceed',
    },
  },
  tender_review_simulated: {
    id: 'tender_review_simulated',
    label: 'Assembly',
    rollApplicable: false,
    terminal: false,
    advance: {
      type: 'assembly',
      label: 'Record simulated step',
      needsEvidence: false,
      needsNote: true,
      defaultOutcome: 'proceed',
    },
  },
  assembly_simulated: {
    id: 'assembly_simulated',
    label: 'Delivery evidence',
    rollApplicable: false,
    terminal: false,
    advance: {
      type: 'delivery',
      label: 'Record simulated delivery',
      needsEvidence: true,
      needsNote: false,
    },
  },
  delivery_simulated: {
    id: 'delivery_simulated',
    label: 'Acceptance',
    rollApplicable: false,
    terminal: false,
    advance: {
      type: 'acceptance',
      label: 'Record simulated step',
      needsEvidence: false,
      needsNote: true,
      defaultOutcome: 'accepted',
    },
  },
  acceptance_simulated: {
    id: 'acceptance_simulated',
    label: 'Deployment preview',
    rollApplicable: false,
    terminal: false,
    advance: {
      type: 'deployment',
      label: 'Create Roll preview',
      needsEvidence: false,
      needsNote: true,
    },
  },
  roll_preview: {
    id: 'roll_preview',
    label: 'Roll preview',
    rollApplicable: true,
    terminal: true,
    advance: null,
  },
};

export function stageOrder(): SimulationStage[] {
  return Object.keys(SIMULATION_STAGES) as SimulationStage[];
}

export function stageCard(stage: SimulationStage): SimulationStageCard {
  return SIMULATION_STAGES[stage];
}

export function stageIndex(stage: SimulationStage): number {
  return stageOrder().indexOf(stage);
}

export function buildStageAction(
  stage: SimulationStage,
  note: string,
  evidence: string[],
  outcome?: string,
): SimulationAction | null {
  const card = SIMULATION_STAGES[stage];
  if (!card?.advance) return null;

  const normalizedNote = note.trim();
  const normalizedEvidence = evidence.map((item) => item.trim()).filter(Boolean);

  switch (card.advance.type) {
    case 'tender-review':
      return {
        type: 'tender-review',
        outcome: (outcome ?? card.advance.defaultOutcome ?? 'proceed') as 'proceed' | 'blocked',
        note: normalizedNote,
      };
    case 'assembly':
      return {
        type: 'assembly',
        outcome: (outcome ?? card.advance.defaultOutcome ?? 'proceed') as 'proceed' | 'blocked',
        note: normalizedNote,
      };
    case 'delivery':
      return { type: 'delivery', evidence: normalizedEvidence };
    case 'acceptance':
      return {
        type: 'acceptance',
        outcome: (outcome ?? card.advance.defaultOutcome ?? 'accepted') as
          | 'accepted'
          | 'returned'
          | 'rejected',
        note: normalizedNote,
      };
    case 'deployment':
      return { type: 'deployment', note: normalizedNote };
    default:
      return null;
  }
}

export function gateState(simulation: {
  readonly stage: SimulationStage;
  readonly status: SimulationStatus;
}): SimulationGate {
  if (simulation.status === 'blocked') return 'blocked';
  if (simulation.status !== 'active') return 'auto';
  return SIMULATION_STAGES[simulation.stage].advance ? 'proceed' : 'auto';
}

export interface AdvanceOption {
  readonly action: SimulationAction;
  readonly label: string;
  readonly disabled: boolean;
  readonly reason?: string;
}

export function advanceOption(
  stage: SimulationStage,
  status: SimulationStatus,
  note: string,
  evidence: string[],
  outcome?: string,
): AdvanceOption | null {
  const card = SIMULATION_STAGES[stage];
  if (!card?.advance || status !== 'active') return null;

  const normalizedNote = note.trim();
  const normalizedEvidence = evidence.map((item) => item.trim()).filter(Boolean);

  if (card.advance.needsNote && !normalizedNote) {
    return {
      action: buildStageAction(stage, normalizedNote, normalizedEvidence, outcome) as SimulationAction,
      label: card.advance.label,
      disabled: true,
      reason: 'Add a review note before continuing.',
    };
  }
  if (card.advance.needsEvidence && normalizedEvidence.length === 0) {
    return {
      action: buildStageAction(stage, normalizedNote, normalizedEvidence, outcome) as SimulationAction,
      label: card.advance.label,
      disabled: true,
      reason: 'Add delivery evidence before continuing.',
    };
  }

  return {
    action: buildStageAction(stage, normalizedNote, normalizedEvidence, outcome) as SimulationAction,
    label: card.advance.label,
    disabled: false,
  };
}

export function navigationStages(): WorkbenchViewStage[] {
  return ['need', ...stageOrder()] as WorkbenchViewStage[];
}
