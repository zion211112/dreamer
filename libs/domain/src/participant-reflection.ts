import { z } from 'zod';

/**
 * A participant's revisable, first-person learning and local-value reflection
 * after an undertaking closes. It is not evidence, an organizational review,
 * contribution accounting, or a financial instruction.
 */
export const financialRecordAssessmentSchema = z.enum([
  'consider',
  'not_indicated',
  'uncertain',
]);

const financialRecordRationaleSchema = z.string().trim().min(1).max(4_000).refine(
  (value) => !/[0-9$€£¥]|\b(?:amount|balance|account|bank|card|pin|password|credential|routing|iban|swift|wallet|transfer|payment instruction|payment details|payment account|pay(?:ment)? is owed|owed|entitlement)\b/i.test(value),
  'Use narrative context only; do not include amounts, account details, payment instructions, or obligations.',
);

export const participantReflectionInputSchema = z.object({
  learning: z.string().trim().min(1).max(10_000),
  localValue: z.string().trim().min(1).max(10_000),
  financialRecordAssessment: financialRecordAssessmentSchema,
  financialRecordRationale: financialRecordRationaleSchema,
  expectedVersion: z.number().int().min(0).max(1_000_000),
}).strict();

export type ParticipantReflectionInput = z.infer<typeof participantReflectionInputSchema>;

export interface ParticipantReflection extends Omit<ParticipantReflectionInput, 'expectedVersion'> {
  id: string;
  latestVersionId: string;
  undertakingId: string;
  authorPersonId: string;
  authorName: string;
  version: number;
  createdAt: string;
}
