import type { UserRole } from './auth/types';

export interface WorkspaceHomeAction {
  href: string;
  label: string;
}

export interface WorkspaceHomePersona {
  roleLabel: string;
  actions: readonly WorkspaceHomeAction[];
}

const memberPersona: WorkspaceHomePersona = {
  roleLabel: 'Member',
  actions: [
    { href: '/workspace/commons', label: 'Describe the need' },
    { href: '/workspace/network/people', label: 'Find the right people' },
    { href: '/workspace/workbench', label: 'Shape the undertaking' },
  ],
};

const workspacePersonas: Record<UserRole, WorkspaceHomePersona> = {
  founder: {
    roleLabel: 'Founder',
    actions: [
      { href: '/workspace/commons', label: 'Describe the need' },
      { href: '/workspace/network/people', label: 'Find the right people' },
      { href: '/workspace/workbench', label: 'Shape the undertaking' },
    ],
  },
  institution: {
    roleLabel: 'Institution',
    actions: [
      { href: '/workspace/commons', label: 'Share a local signal' },
      { href: '/workspace/network/people', label: 'Connect a capable crew' },
      { href: '/workspace/records/roll', label: 'Preserve the outcome' },
    ],
  },
  coordinator: {
    roleLabel: 'Coordinator',
    actions: [
      { href: '/workspace/commons', label: 'Surface what needs a response' },
      { href: '/workspace/workbench', label: 'Coordinate people and scope' },
      { href: '/workspace/records/roll', label: 'Trace the result' },
    ],
  },
  admin: {
    roleLabel: 'Administrator',
    actions: [
      { href: '/workspace/commons', label: 'Review local needs' },
      { href: '/workspace/network/people', label: 'Find a steward' },
      { href: '/workspace/records/roll', label: 'Inspect the evidence' },
    ],
  },
};

export function getWorkspaceHomePersona(role: UserRole | null | undefined): WorkspaceHomePersona {
  return role ? workspacePersonas[role] : memberPersona;
}
