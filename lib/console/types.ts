/**
 * APT-LABS Console Types — Core data models for the working prototype
 * All data persists in localStorage (offline-first, free, no backend)
 */

export type EvidenceState = 'VERIFIED' | 'PROTOTYPE' | 'TARGET' | 'PLANNED' | 'UNKNOWN';

export type PersonRole = 'student' | 'teacher' | 'admin' | 'staff' | 'parent' | 'guest';

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  evidenceState: EvidenceState;
  evidenceNote?: string;
  synced: boolean;
  version: number;
}

export interface Person extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  role: PersonRole;
  organizationId: string;
  qrCode: string;
  checkedIn: boolean;
  lastCheckIn?: string;
  metadata: Record<string, string>;
}

export interface Organization extends BaseEntity {
  name: string;
  type: 'school' | 'university' | 'ngo' | 'government' | 'business' | 'other';
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  settings: OrgSettings;
}

export interface OrgSettings {
  timezone: string;
  weekStart: 0 | 1; // 0 = Sunday, 1 = Monday
  checkInWindowMinutes: number;
  requirePhoto: boolean;
  allowGuestCheckIn: boolean;
}

export interface WorkTask extends BaseEntity {
  title: string;
  description?: string;
  type: 'timetable' | 'duty' | 'room' | 'event' | 'custom';
  assigneeIds: string[];
  locationId?: string;
  startTime: string;
  endTime: string;
  recurring: RecurrenceRule | null;
  constraints: TaskConstraint[];
  priority: 1 | 2 | 3 | 4 | 5; // 1 = highest
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  result?: ScheduleResult;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
  daysOfWeek?: number[]; // 0-6
  dayOfMonth?: number;
  endDate?: string;
  count?: number;
}

export interface TaskConstraint {
  type: 'hard' | 'soft';
  category: 'time' | 'person' | 'location' | 'resource' | 'custom';
  description: string;
  weight: number; // for soft constraints
  validator: string; // JSON-serializable validation rule
}

export interface ScheduleResult {
  score: number;
  conflicts: Conflict[];
  assignments: TaskAssignment[];
  solvedAt: string;
  solverStats: {
    iterations: number;
    timeMs: number;
    optimal: boolean;
  };
}

export interface Conflict {
  type: 'time_overlap' | 'person_unavailable' | 'location_conflict' | 'resource_exceeded' | 'constraint_violation';
  severity: 'error' | 'warning';
  taskId: string;
  conflictingTaskId?: string;
  personId?: string;
  locationId?: string;
  message: string;
}

export interface TaskAssignment {
  taskId: string;
  personId: string;
  locationId?: string;
  startTime: string;
  endTime: string;
}

export interface Location extends BaseEntity {
  name: string;
  type: 'classroom' | 'lab' | 'office' | 'hall' | 'outdoor' | 'virtual' | 'other';
  capacity: number;
  resources: string[]; // e.g., ['projector', 'whiteboard', 'computers']
  parentId?: string; // for building/floor hierarchy
  organizationId: string;
}

export interface EvidenceEntry extends BaseEntity {
  claimId: string;
  claim: string;
  claimType: 'attendance' | 'performance' | 'compliance' | 'financial' | 'operational' | 'custom';
  source: 'direct_observation' | 'document' | 'system_log' | 'third_party' | 'self_reported' | 'inferred';
  evidenceState: EvidenceState;
  evidenceNote?: string;
  supports: string[]; // IDs of other claims this supports
  contradicts: string[]; // IDs of other claims this contradicts
  verifiedBy?: string; // person ID
  verifiedAt?: string;
  expiresAt?: string;
  tags: string[];
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'spreadsheet' | 'pdf' | 'other';
  size: number;
  url: string; // data URL for localStorage
  uploadedAt: string;
  uploadedBy: string;
}

export interface SyncEvent {
  id: string;
  entityType: 'person' | 'task' | 'location' | 'evidence' | 'organization';
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
  deviceId: string;
  payload: unknown;
  applied: boolean;
}

export interface ConsoleState {
  currentOrgId: string | null;
  currentUserId: string | null;
  sidebarOpen: boolean;
  activeModule: 'roll' | 'work' | 'evidence' | 'settings' | 'dashboard';
  theme: 'dark' | 'light' | 'system';
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action?: { label: string; href: string };
}