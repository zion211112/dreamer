import type { Profile, UserRole } from './types';

export function canEditProfile(viewer: Profile | null, targetUserId: string): boolean {
  if (!viewer) return false;
  if (viewer.id === targetUserId) return true;
  if (viewer.role === 'admin') return true;
  return false;
}

export function canCreateUndertaking(viewer: Profile | null): boolean {
  if (!viewer) return false;
  return viewer.role === 'institution' || viewer.role === 'coordinator' || viewer.role === 'admin';
}

export function canManageUndertaking(viewer: Profile | null, undertakingInstitutionId: string, undertakingCoordinatorId: string | null): boolean {
  if (!viewer) return false;
  if (viewer.id === undertakingInstitutionId) return true;
  if (undertakingCoordinatorId && viewer.id === undertakingCoordinatorId) return true;
  if (viewer.role === 'admin') return true;
  return false;
}

export function canComposeTeam(viewer: Profile | null, undertakingCoordinatorId: string | null): boolean {
  if (!viewer) return false;
  if (undertakingCoordinatorId && viewer.id === undertakingCoordinatorId) return true;
  if (viewer.role === 'admin') return true;
  return false;
}

export function canSubmitEvidence(viewer: Profile | null, packagePersonId: string): boolean {
  if (!viewer) return false;
  if (viewer.id === packagePersonId) return true;
  if (viewer.role === 'admin') return true;
  return false;
}

export function canAcceptDelivery(viewer: Profile | null, undertakingInstitutionId: string, undertakingCoordinatorId: string | null): boolean {
  if (!viewer) return false;
  if (viewer.id === undertakingInstitutionId) return true;
  if (undertakingCoordinatorId && viewer.id === undertakingCoordinatorId) return true;
  if (viewer.role === 'admin') return true;
  return false;
}

export function canCreateRollEntry(viewer: Profile | null, undertakingInstitutionId: string, undertakingCoordinatorId: string | null): boolean {
  if (!viewer) return false;
  if (viewer.id === undertakingInstitutionId) return true;
  if (undertakingCoordinatorId && viewer.id === undertakingCoordinatorId) return true;
  if (viewer.role === 'admin') return true;
  return false;
}

export function canViewRollEntry(entry: { commissioned_by: { institution_id: string }; participants: Array<{ person_id: string }> }, viewer: Profile | null): { public: boolean; participant: boolean; restricted: boolean } {
  if (!viewer) return { public: true, participant: false, restricted: false };

  const isCommissioner = viewer.id === entry.commissioned_by.institution_id;
  const isParticipant = entry.participants.some(p => p.person_id === viewer.id);
  const isAdmin = viewer.role === 'admin';

  return {
    public: true,
    participant: isCommissioner || isParticipant || isAdmin,
    restricted: isCommissioner || isAdmin,
  };
}

export function getRoleCapabilities(role: UserRole): string[] {
  const base = ['view_network', 'view_roll_public'];
  switch (role) {
    case 'institution':
      return [...base, 'create_undertaking', 'manage_own_undertakings', 'accept_delivery', 'create_roll_entry'];
    case 'founder':
      return [...base, 'create_profile', 'manage_own_profile', 'submit_evidence', 'view_roll_participant'];
    case 'coordinator':
      return [...base, 'create_undertaking', 'manage_undertakings', 'compose_team', 'accept_delivery', 'create_roll_entry', 'view_roll_participant'];
    case 'admin':
      return [...base, 'create_undertaking', 'manage_all_undertakings', 'compose_team', 'accept_delivery', 'create_roll_entry', 'view_roll_all', 'manage_users'];
    default:
      return base;
  }
}

export function hasCapability(viewer: Profile | null, capability: string): boolean {
  if (!viewer) return false;
  return getRoleCapabilities(viewer.role).includes(capability);
}