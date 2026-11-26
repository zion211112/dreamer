/**
 * Role-level capabilities. Teacher scope (their assigned classes and subjects)
 * is enforced separately by the API, because it depends on data, not role.
 */

export const BB_ROLES = ['principal', 'registrar', 'teacher', 'bursar'] as const;
export type BBRole = (typeof BB_ROLES)[number];

export const BB_CAPABILITIES = [
  'learners.read',
  'learners.write',
  'classes.write',
  'attendance.write',
  'marks.write',
  'marks.confirm',
  'reports.read',
  'fees.read',
  'fees.write',
  'staff.manage',
  'audit.read',
  'tenders.write',
] as const;
export type BBCapability = (typeof BB_CAPABILITIES)[number];

const ROLE_CAPABILITIES: Record<BBRole, readonly BBCapability[]> = {
  principal: BB_CAPABILITIES,
  registrar: ['learners.read', 'learners.write', 'classes.write', 'attendance.write', 'marks.confirm', 'reports.read', 'fees.read'],
  teacher: ['learners.read', 'attendance.write', 'marks.write', 'reports.read'],
  bursar: ['learners.read', 'fees.read', 'fees.write', 'reports.read'],
};

export function can(role: BBRole, capability: BBCapability): boolean {
  return ROLE_CAPABILITIES[role].includes(capability);
}

export function isBBRole(value: unknown): value is BBRole {
  return typeof value === 'string' && (BB_ROLES as readonly string[]).includes(value);
}
