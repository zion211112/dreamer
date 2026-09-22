// The exemplar seed. On first load with empty stores, one call builds a
// complete working school: the roll, a term of scores, fees, the content
// bank and the trial marking scheme. Deliberate and visible — the teacher
// is told what was built and can clear it in one click.
//
// Idempotent: it never overwrites existing data. Empty store only.

import { idbAll, idbBulkPut, idbClear } from "./db";
import { Assessment, Student } from "./school";
import { FeePayment, FeeTerm } from "./fees";
import { ContentDoc, itemDoc, examDoc, ContentItem, ExamPaper } from "./content";
import {
  EXEMPLAR_ROSTER,
  EXEMPLAR_ASSESSMENTS,
  EXEMPLAR_FEE_TERM,
  EXEMPLAR_FEE_PAYMENTS,
  EXEMPLAR_SCHOOL_NAME
} from "./proto-school";
import { EXEMPLAR_ITEMS, EXEMPLAR_EXAMS } from "./exemplars";
import { EXEMPLAR_MEDIA } from "./exemplars-media";

export interface SeedResult {
  seeded: boolean;
  students: number;
  assessments: number;
  feePayments: number;
  contentItems: number;
  exams: number;
}

/** True when the whole device has no data at all. */
export async function isSchoolEmpty(): Promise<boolean> {
  const [students, content] = await Promise.all([idbAll<Student>("students"), idbAll<ContentDoc>("content")]);
  return students.length === 0 && content.length === 0;
}

/** Build the exemplar school. Only safe when isSchoolEmpty() is true. */
export async function seedExemplarSchool(): Promise<SeedResult> {
  const students = EXEMPLAR_ROSTER;
  const assessments: Assessment[] = EXEMPLAR_ASSESSMENTS;
  const fees: Array<FeeTerm | FeePayment> = [EXEMPLAR_FEE_TERM, ...EXEMPLAR_FEE_PAYMENTS];
  const items: ContentItem[] = [...EXEMPLAR_ITEMS, ...EXEMPLAR_MEDIA];
  const exams: ExamPaper[] = EXEMPLAR_EXAMS;

  await idbBulkPut("students", students);
  await idbBulkPut("assessments", assessments);
  await idbBulkPut("fees", fees);
  await idbBulkPut("content", [...items.map(itemDoc), ...exams.map(examDoc)]);

  return {
    seeded: true,
    students: students.length,
    assessments: assessments.length,
    feePayments: EXEMPLAR_FEE_PAYMENTS.length,
    contentItems: items.length,
    exams: exams.length
  };
}

/** True when the roll on the device is the exemplar roll (safe to swap). */
export function isExemplarRoll(students: Student[]): boolean {
  return students.length === EXEMPLAR_ROSTER.length && students[0]?.id === EXEMPLAR_ROSTER[0]?.id;
}

/** Clear everything back to zero — the "start with my school" exit. */
export async function clearExemplarSchool(): Promise<void> {
  await idbClear("students");
  await idbClear("assessments");
  await idbClear("fees");
  await idbClear("content");
  await idbClear("events");
  await idbClear("meta");
}

export const EXEMPLAR_DEFAULT_SCHOOL = EXEMPLAR_SCHOOL_NAME;
