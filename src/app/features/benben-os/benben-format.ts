import type { BBRole } from './benben.models';

const kesFormat = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export function kes(cents: number | null | undefined): string {
  return kesFormat.format(Number(cents ?? 0) / 100);
}

export function day(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? iso : dateFormat.format(parsed);
}

export function moment(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? iso : dateTimeFormat.format(parsed);
}

export function percent(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `${Math.round(value)}%`;
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`;
}

export function initials(person: { displayName?: string; firstName?: string; lastName?: string }): string {
  if (person.displayName) {
    return person.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('');
  }
  return `${person.firstName?.[0] ?? ''}${person.lastName?.[0] ?? ''}`.toUpperCase();
}

export function roleLabel(role: BBRole): string {
  return { principal: 'Principal', registrar: 'Registrar', teacher: 'Teacher', bursar: 'Bursar' }[role];
}

export function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function levelClass(level: string | null | undefined): string {
  return `bb-level bb-level-${level ?? 'BE'}`;
}

/** Friendly copy for the API's machine-readable error codes. */
const MESSAGES: Record<string, string> = {
  forbidden: 'Your role does not permit that action.',
  no_school_membership: 'This account is not linked to a school yet.',
  school_selection_required: 'This account belongs to more than one school.',
  school_not_permitted: 'That school is not on your account.',
  unauthenticated: 'Your session has expired. Sign in again.',
  invalid_email: 'Enter a valid email address.',
  invalid_admission_no: 'Enter an admission number.',
  invalid_first_name: 'Enter the learner’s first name.',
  invalid_last_name: 'Enter the learner’s last name.',
  invalid_class_name: 'Enter a class name.',
  invalid_grade_level: 'Choose a grade between 4 and 9.',
  invalid_score: 'Enter a whole-number score within the assessment maximum.',
  invalid_amount: 'Enter an amount such as 12500 or 12500.50.',
  invalid_day: 'Choose a valid date.',
  invalid_attendance_status: 'Choose present, absent, late or excused.',
  learner_not_found: 'That learner is not in this school.',
  learner_not_in_class: 'A learner in that list is not enrolled in this class.',
  class_not_found: 'That class is not in this school.',
  assessment_not_found: 'That assessment is not in this school.',
  term_not_found: 'Choose a term from this school.',
  year_not_found: 'Choose an academic year from this school.',
  subject_not_found: 'Choose a subject from this school.',
  member_not_found: 'That staff member is not in this school.',
  learner_already_enrolled_this_year: 'That learner is already enrolled this year.',
  learner_already_exists: 'That admission number is already in use.',
  assignment_exists: 'That teacher already has this class and subject.',
  assignment_not_found: 'That assignment no longer exists.',
  mark_confirmed: 'Confirmed marks are locked. Reopen the assessment first.',
  no_draft_marks: 'There are no draft marks to confirm.',
  no_confirmed_marks: 'There are no confirmed marks to reopen.',
  duplicate_reference: 'That payment reference is already recorded.',
  duplicate: 'That record already exists.',
  nothing_to_update: 'Change at least one field.',
  last_principal: 'A school must keep one active principal.',
  member_has_assignments: 'Remove this teacher’s class assignments first.',
  member_disabled: 'That staff account is disabled.',
  not_your_class: 'You can only mark classes you teach.',
  not_your_class_subject: 'You can only mark subjects assigned to you for this class.',
  assessment_has_no_scheme: 'This assessment has no auto-marking key.',
  scheme_total_must_equal_max_score: 'The question marks must add up to the assessment maximum.',
  invalid_scheme: 'Complete every question: marks, correct option or keywords.',
  already_belongs_to_school: 'This account already belongs to a school.',
  fee_structure_not_found: 'That fee structure is not in this school.',
  no_learners_to_invoice: 'No enrolled learners match that fee structure.',
  empty_marks: 'Enter at least one score.',
  empty_attendance: 'Mark at least one learner.',
  empty_auto_mark: 'Enter at least one answer sheet.',
  internal_error: 'Something went wrong on the server. Try again.',
};

export function describeError(code: string | null | undefined): string {
  if (!code) return 'Something went wrong. Try again.';
  return MESSAGES[code] ?? `That did not work (${code}).`;
}
