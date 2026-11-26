export type BBRole = 'principal' | 'registrar' | 'teacher' | 'bursar';

export interface School { id: string; name: string; code: string; county: string | null; }
export interface Member { id: string; schoolId: string; email: string; displayName: string; role: BBRole; status: string; }
export interface Me {
  member: Member;
  school: School;
  memberships: { school: School; role: BBRole }[];
  capabilities: string[];
}

export interface AcademicYear { id: string; name: string; startsOn: string; endsOn: string; }
export interface Term { id: string; yearId: string; name: string; ordinal: number; startsOn: string; endsOn: string; }
export interface Subject { id: string; code: string; name: string; }
export interface ClassSummary { id: string; name: string; gradeLevel: number; yearId: string; learners: number; }

export interface LearnerRow {
  id: string; admissionNo: string; firstName: string; lastName: string;
  status: string; dateOfBirth: string | null; className: string | null;
}
export interface Guardian { id: string; name: string; phone: string | null; relationship: string | null; isPrimary: boolean; }
export interface Enrolment { id: string; yearId: string; classId: string; className: string; gradeLevel: number; yearName: string; }
export interface LearnerDetail {
  learner: { id: string; admissionNo: string; firstName: string; lastName: string; dateOfBirth: string | null; status: string };
  guardians: Guardian[];
  enrolments: Enrolment[];
  attendance: { counts: { present: number; absent: number; late: number; excused: number }; rate: number | null };
  fees: { invoicedCents: number; paidCents: number };
}

export interface Overview {
  school: School;
  term: Term | null;
  counts: { learners: number; classes: number; staff: number; assessments: number; draftMarks: number };
  attendance: { day: string; present: number; absent: number; late: number; excused: number };
  fees: { invoicedCents: number; paidCents: number };
  recentAudit: { id: string; action: string; occurredAt: string; memberName: string | null }[];
}

export interface AssessmentRow {
  id: string; title: string; kind: 'formative' | 'summative'; maxScore: number; createdAt: string;
  classId: string; className: string; subjectId: string; subjectName: string; termId: string;
  hasScheme: boolean; marked: number; drafts: number; confirmed: number; autoMarked: number;
}
export interface SchemeQuestion {
  id: string; type: 'mcq' | 'keyword'; marks: number;
  correctOption?: number; keywords?: string[]; minKeywords?: number;
}
export interface AssessmentDetail {
  assessment: {
    id: string; title: string; kind: string; maxScore: number; termId: string; classId: string; subjectId: string;
    scheme: SchemeQuestion[] | null;
  };
  roster: {
    learnerId: string; admissionNo: string; firstName: string; lastName: string;
    mark: { id: string; score: number; status: 'draft' | 'confirmed'; source: 'manual' | 'auto'; comment: string | null; answers?: { responses: Record<string, string | number | null> } | null } | null;
  }[];
}

export interface SubjectResult { subjectCode: string; subjectName: string; assessments: number; percent: number; level: string; }
export interface ReportLearner {
  learnerId: string; admissionNo: string; firstName: string; lastName: string;
  subjects: SubjectResult[]; overallPercent: number | null; overallLevel: string | null;
  attendanceRate: number | null; attendance: { present: number; absent: number; late: number; excused: number };
}
export interface ReportPayload { class: { id: string; name: string }; term: Term; learners: ReportLearner[]; }

export interface LedgerLearner {
  learnerId: string; admissionNo: string; firstName: string; lastName: string; className: string | null;
  invoicedCents: number; paidCents: number; balanceCents: number;
}
export interface Ledger {
  term: Term;
  learners: LedgerLearner[];
  totals: { invoicedCents: number; paidCents: number; balanceCents: number };
}
export interface FeeStructure { id: string; name: string; gradeLevel: number | null; amountCents: number; yearId: string; yearName: string; }

export interface StaffRow {
  id: string; email: string; displayName: string; role: BBRole; status: string; createdAt: string;
  linked: boolean; assignments: number;
}
export interface AssignmentRow {
  id: string; memberId: string; memberName: string; classId: string; className: string;
  gradeLevel: number; subjectId: string; subjectName: string; subjectCode: string;
}
export interface AuditRow { id: string; action: string; subjectType: string; subjectId: string | null; occurredAt: string; memberName: string | null; details: Record<string, unknown>; }

export interface AttendanceRosterRow {
  learnerId: string; admissionNo: string; firstName: string; lastName: string;
  status: 'present' | 'absent' | 'late' | 'excused' | null; markedAt: string | null;
}
