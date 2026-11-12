import type { UserRole } from './auth/types';

export interface WorkspaceHomeAction {
  href: string;
  stage: string;
  label: string;
  description: string;
}

export interface WorkspaceHomePersona {
  roleLabel: string;
  introduction: string;
  pathTitle: string;
  pathDescription: string;
  actions: readonly WorkspaceHomeAction[];
}

const memberPersona: WorkspaceHomePersona = {
  roleLabel: 'Member',
  introduction: 'Keep the work that matters to you clear, connected, and moving.',
  pathTitle: 'From need to undertaking',
  pathDescription: 'Each step builds on the one before it.',
  actions: [
    { href: '/workspace/commons', stage: 'Signal', label: 'Describe the need', description: 'Name what is missing and what success means.' },
    { href: '/workspace/network/people', stage: 'Capability', label: 'Find the right people', description: 'Connect the work with people who can help.' },
    { href: '/workspace/workbench', stage: 'Commitment', label: 'Shape the undertaking', description: 'Give the work a clear scope and next move.' },
  ],
};

const workspacePersonas: Record<UserRole, WorkspaceHomePersona> = {
  founder: {
    roleLabel: 'Founder',
    introduction: 'Build momentum from the needs, people, and commitments around your venture.',
    pathTitle: 'From need to undertaking',
    pathDescription: 'Each step builds on the one before it.',
    actions: [
      { href: '/workspace/commons', stage: 'Signal', label: 'Describe the need', description: 'Name what is missing and what success means.' },
      { href: '/workspace/network/people', stage: 'Capability', label: 'Find the right people', description: 'Explore nearby skills and potential collaborators.' },
      { href: '/workspace/workbench', stage: 'Commitment', label: 'Shape the undertaking', description: 'Turn an idea into a scoped commitment.' },
    ],
  },
  institution: {
    roleLabel: 'Institution',
    introduction: 'Bring your institution’s needs, capabilities, and commitments into view.',
    pathTitle: 'From local signal to clear record',
    pathDescription: 'Connect what is needed to what was done.',
    actions: [
      { href: '/workspace/commons', stage: 'Signal', label: 'Share a local signal', description: 'Make a need or opportunity visible to others.' },
      { href: '/workspace/network/people', stage: 'Capability', label: 'Connect a capable crew', description: 'Bring people and resources around the need.' },
      { href: '/workspace/records/roll', stage: 'Record', label: 'Preserve the outcome', description: 'Capture what happened with traceable evidence.' },
    ],
  },
  coordinator: {
    roleLabel: 'Coordinator',
    introduction: 'Keep local needs, people, and commitments moving together.',
    pathTitle: 'From signal to evidence',
    pathDescription: 'Keep each response connected to its source.',
    actions: [
      { href: '/workspace/commons', stage: 'Signal', label: 'Surface what needs a response', description: 'Bring a local need into shared view.' },
      { href: '/workspace/workbench', stage: 'Commitment', label: 'Coordinate people and scope', description: 'Keep delivery aligned with the agreed work.' },
      { href: '/workspace/records/roll', stage: 'Evidence', label: 'Trace the result', description: 'Follow the commitment through its evidence.' },
    ],
  },
  admin: {
    roleLabel: 'Administrator',
    introduction: 'Keep local work, stewardship, and evidence in view.',
    pathTitle: 'From local need to accountable work',
    pathDescription: 'Make the relationships behind each outcome visible.',
    actions: [
      { href: '/workspace/commons', stage: 'Signal', label: 'Review local needs', description: 'See signals and proposals that need attention.' },
      { href: '/workspace/network/people', stage: 'Stewardship', label: 'Find a steward', description: 'Connect work with people and capabilities.' },
      { href: '/workspace/records/roll', stage: 'Evidence', label: 'Inspect the evidence', description: 'Review recorded decisions and outcomes.' },
    ],
  },
};

export function getWorkspaceHomePersona(role: UserRole | null | undefined): WorkspaceHomePersona {
  return role ? workspacePersonas[role] : memberPersona;
}
