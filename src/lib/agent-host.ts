/* ============================================================================
   APT-LABS — Agent Host (mock proto)
   Local agent host that connects the docked Page Agent to simulation state.
   Design rule: proposes-never-executes. The agent reads state and drafts
   evidence notes / gate rationales; a human always executes through the UI.
   No external data, no external model endpoint — deterministic demo stub.
   ============================================================================ */

import { buildStageAction } from './simulation-machine';
import type {
  SimulationAction,
  SimulationStage,
  WorkbenchSimulation,
} from './workbench-simulation';
import type { SchoolTenderDraft } from './school-console-storage';

export interface AgentProposal {
  id: string;
  type: 'evidence-note' | 'gate-rationale' | 'stage-suggestion';
  targetStage: SimulationStage;
  content: string;
  confidence: number;
  status: 'draft' | 'submitted';
  createdAt: string;
}

export interface AgentState {
  available: boolean;
  lastProposal: AgentProposal | null;
  proposals: AgentProposal[];
}

const PROPOSALS_KEY = 'aptlabs:agent-proposals:v1';

function readProposals(): AgentProposal[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(PROPOSALS_KEY);
  } catch {
    return [];
  }
  if (raw === null) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isAgentProposal);
  } catch {
    return [];
  }
}

function writeProposals(proposals: AgentProposal[]): void {
  try {
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(proposals));
  } catch {
    // ignore storage failures in demo
  }
}

function isAgentProposal(value: unknown): value is AgentProposal {
  return (
    isRecord(value)
    && typeof value.id === 'string'
    && typeof value.type === 'string'
    && ['evidence-note', 'gate-rationale', 'stage-suggestion'].includes(value.type)
    && typeof value.targetStage === 'string'
    && typeof value.content === 'string'
    && typeof value.confidence === 'number'
    && (value.status === 'draft' || value.status === 'submitted')
    && typeof value.createdAt === 'string'
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function newId(prefix: string): string {
  const uuid = globalThis.crypto?.randomUUID?.();
  return uuid ? `${prefix}-${uuid}` : `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export class AgentHost {
  private available: boolean;
  private proposals: AgentProposal[] = [];

  constructor() {
    // Agent is "available" in this demo — a local host that can draft proposals.
    this.available = true;
    this.proposals = readProposals();
  }

  isAvailable(): boolean {
    return this.available;
  }

  getProposals(): AgentProposal[] {
    return [...this.proposals];
  }

  /** Read simulation state and draft a proposal. Never executes. */
  draftProposalForStage(
    simulation: WorkbenchSimulation,
    sourceDraft: SchoolTenderDraft | null,
  ): AgentProposal | null {
    const stage = simulation.stage as SimulationStage;
    const existing = this.proposals.find(p => p.targetStage === stage && p.status === 'draft');
    if (existing) return existing;

    let content = '';
    let type: AgentProposal['type'] = 'stage-suggestion';
    let confidence = 0.7;

    switch (stage) {
      case 'candidate_drafted':
        type = 'gate-rationale';
        content = `Tender review draft: The need "${sourceDraft?.assetName ?? simulation.source.assetName}" is well-scoped. Recommend proceeding to assembly once crew wage allocations are confirmed.`;
        confidence = 0.85;
        break;
      case 'tender_review_simulated':
        type = 'gate-rationale';
        content = `Assembly draft: All roles are allocated. Recommend proceeding to delivery with the evidence package prepared against the blueprint lines.`;
        confidence = 0.8;
        break;
      case 'assembly_simulated':
        type = 'evidence-note';
        content = `Delivery evidence: Materials received and crew assigned per blueprint. Recommend recording delivery with line-item confirmation.`;
        confidence = 0.75;
        break;
      case 'delivery_simulated':
        type = 'gate-rationale';
        content = `Acceptance draft: Evidence reviewed against acceptance criteria. Recommend acceptance if inspection passes.`;
        confidence = 0.8;
        break;
      case 'acceptance_simulated':
        type = 'stage-suggestion';
        content = `Deployment draft: Accepted work is ready for Roll preview (physical-asset work kind). SBT attestation will be minted on acceptance.`;
        confidence = 0.9;
        break;
      case 'roll_preview':
        return null;
    }

    const proposal: AgentProposal = {
      id: newId('agent-proposal'),
      type,
      targetStage: stage,
      content,
      confidence,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.proposals.unshift(proposal);
    writeProposals(this.proposals);
    return proposal;
  }

  /** Submit a draft proposal (marks it submitted — still not executed). */
  submitProposal(proposalId: string): AgentProposal | null {
    const proposal = this.proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'draft') return null;
    proposal.status = 'submitted';
    writeProposals(this.proposals);
    return proposal;
  }

  /** Convert a proposal into a SimulationAction suggestion (human must execute). */
  suggestAction(proposal: AgentProposal): SimulationAction | null {
    return buildStageAction(proposal.targetStage as SimulationStage, proposal.content, proposal.content.split('\n'));
  }
}

// Singleton instance for the docked Page Agent to use.
export const agentHost = new AgentHost();
