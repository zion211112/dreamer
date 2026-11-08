import type { FieldSignal } from './local-workflows';

export type ExampleFieldSignal = FieldSignal & {
  suspectedCause: string;
  evidenceOnHand: string[];
  missingChecks: string[];
  suggestedNextStep: string;
  verifiedPriority: 'not-assessed';
  authorizationStatus: 'not-authorized';
  recordBasis: 'illustrative';
};

function exampleSignal(input: {
  id: string;
  institutionId: string;
  institutionName: string;
  title: string;
  observation: string;
  suggestedNextStep: string;
  missingChecks: string[];
}): ExampleFieldSignal {
  const timestamp = '2026-10-31T00:00:00.000Z';

  return {
    id: input.id,
    institutionId: input.institutionId,
    institutionName: input.institutionName,
    location: 'Not recorded',
    title: input.title,
    details: input.observation,
    suspectedCause: 'Not assessed; this is an illustrative prompt.',
    urgency: 'routine',
    verifiedPriority: 'not-assessed',
    evidenceOnHand: ['No source evidence is attached.'],
    missingChecks: input.missingChecks,
    suggestedNextStep: input.suggestedNextStep,
    authorizationStatus: 'not-authorized',
    status: 'new',
    createdAt: timestamp,
    updatedAt: timestamp,
    updates: [{
      id: `${input.id}-note`,
      text: 'Illustrative exploration prompt only; no live report or field record exists.',
      createdAt: timestamp,
    }],
    scenario: true,
    recordBasis: 'illustrative',
  };
}

export const EXAMPLE_FIELD_SIGNALS: ExampleFieldSignal[] = [
  exampleSignal({
    id: 'scenario-kibera-making-space',
    institutionId: 'institution-kibera-makerspace',
    institutionName: 'Kibera Makerspace',
    title: 'What would help describe local making capacity?',
    observation: 'Illustrative prompt: explore what information would help describe practical learning, repair, and making around Kibera Makerspace. No asset, condition, authority, approval, or live report is represented.',
    suggestedNextStep: 'Identify what is known, what remains unestablished, and which sources could support a future record.',
    missingChecks: ['Source and date for any proposed claim', 'Relevant people or resource, if established', 'Consent and authority before recording a real observation'],
  }),
  exampleSignal({
    id: 'scenario-mwea-water-context',
    institutionId: 'mwea-water',
    institutionName: 'Mwea Water Cooperative',
    title: 'What is known about local water-service needs?',
    observation: 'Illustrative prompt: consider what context would be needed to understand water-service needs associated with Mwea Water Cooperative. No asset, condition, authority, approval, or live report is represented.',
    suggestedNextStep: 'Start with an attributed observation and keep unknown service details explicit.',
    missingChecks: ['Source and date for any proposed claim', 'Relevant service context, if established', 'Consent and authority before recording a real observation'],
  }),
];
