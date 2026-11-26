/**
 * Studio ontology — the object and link types the workspace can speak about.
 *
 * This is the single vocabulary the Studio query API, the graph explorer, and
 * the UI legend share. It is deliberately small and explicit: every type maps
 * to a table, every link to a real relationship the server can authorize.
 * Adding a type here without a server projection is a bug, not a plan.
 */

export const STUDIO_OBJECT_TYPE_IDS = [
  'organization',
  'undertaking',
  'person',
  'interest',
  'offer',
  'report',
  'review',
  'event',
] as const;

export type StudioObjectTypeId = (typeof STUDIO_OBJECT_TYPE_IDS)[number];

export type StudioPropertyKind = 'text' | 'status' | 'date' | 'number' | 'person' | 'organization';

export interface StudioPropertyDef {
  key: string;
  label: string;
  kind: StudioPropertyKind;
}

export interface StudioObjectTypeDef {
  id: StudioObjectTypeId;
  label: string;
  plural: string;
  description: string;
  /** Vue-free route template; `:id` is replaced with the object id. */
  hrefTemplate: string | null;
  properties: readonly StudioPropertyDef[];
  /** Property keys an object-set filter may target. */
  filterable: readonly string[];
}

export interface StudioLinkTypeDef {
  id: string;
  label: string;
  from: readonly StudioObjectTypeId[];
  to: readonly StudioObjectTypeId[];
}

const titleAndDates: readonly StudioPropertyDef[] = [
  { key: 'createdAt', label: 'Recorded', kind: 'date' },
];

export const STUDIO_OBJECT_TYPES: readonly StudioObjectTypeDef[] = [
  {
    id: 'organization',
    label: 'Organization',
    plural: 'Organizations',
    description: 'A body that commissions work and carries a recorded standing.',
    hrefTemplate: null,
    properties: [
      { key: 'standing', label: 'Standing', kind: 'status' },
      { key: 'role', label: 'Your role', kind: 'text' },
      ...titleAndDates,
    ],
    filterable: ['standing', 'role'],
  },
  {
    id: 'undertaking',
    label: 'Undertaking',
    plural: 'Undertakings',
    description: 'Scoped work published by an organization, with interest, offers, delivery, and review.',
    hrefTemplate: '/workspace/workbench/:id',
    properties: [
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'organizationName', label: 'Commissioned by', kind: 'organization' },
      { key: 'scope', label: 'Scope', kind: 'text' },
      ...titleAndDates,
    ],
    filterable: ['status', 'organizationName'],
  },
  {
    id: 'person',
    label: 'Person',
    plural: 'People',
    description: 'An account with an APT identity. Visible only through shared membership or participation.',
    hrefTemplate: null,
    properties: [
      { key: 'organizations', label: 'Organizations', kind: 'text' },
      ...titleAndDates,
    ],
    filterable: ['organizations'],
  },
  {
    id: 'interest',
    label: 'Expression of interest',
    plural: 'Expressions of interest',
    description: 'What a person said they bring to an undertaking before any offer exists.',
    hrefTemplate: '/workspace/workbench/:undertakingId',
    properties: [
      { key: 'personName', label: 'From', kind: 'person' },
      { key: 'undertakingTitle', label: 'For', kind: 'text' },
      { key: 'message', label: 'Message', kind: 'text' },
      { key: 'declined', label: 'Declined', kind: 'status' },
      ...titleAndDates,
    ],
    filterable: ['personName', 'undertakingTitle', 'declined'],
  },
  {
    id: 'offer',
    label: 'Offer',
    plural: 'Offers',
    description: 'A named commitment issued to one person for one undertaking.',
    hrefTemplate: '/workspace/workbench/:undertakingId',
    properties: [
      { key: 'status', label: 'Status', kind: 'status' },
      { key: 'offeredToName', label: 'To', kind: 'person' },
      { key: 'issuedByName', label: 'Issued by', kind: 'person' },
      { key: 'undertakingTitle', label: 'For', kind: 'text' },
      { key: 'proposal', label: 'Proposal', kind: 'text' },
      ...titleAndDates,
    ],
    filterable: ['status', 'offeredToName', 'undertakingTitle'],
  },
  {
    id: 'report',
    label: 'Report',
    plural: 'Reports',
    description: 'The participant’s account of what was delivered. Not independent verification.',
    hrefTemplate: '/workspace/workbench/:undertakingId',
    properties: [
      { key: 'authorName', label: 'Author', kind: 'person' },
      { key: 'undertakingTitle', label: 'For', kind: 'text' },
      { key: 'reviewDecision', label: 'Review', kind: 'status' },
      ...titleAndDates,
    ],
    filterable: ['authorName', 'undertakingTitle', 'reviewDecision'],
  },
  {
    id: 'review',
    label: 'Review',
    plural: 'Reviews',
    description: 'A decision on one report by someone other than its author.',
    hrefTemplate: '/workspace/workbench/:undertakingId',
    properties: [
      { key: 'decision', label: 'Decision', kind: 'status' },
      { key: 'reviewerName', label: 'Reviewer', kind: 'person' },
      { key: 'reportAuthorName', label: 'Report author', kind: 'person' },
      { key: 'rationale', label: 'Rationale', kind: 'text' },
      ...titleAndDates,
    ],
    filterable: ['decision', 'reviewerName'],
  },
  {
    id: 'event',
    label: 'Event',
    plural: 'Audit events',
    description: 'An attributed record that an action happened. It is not proof the work was completed.',
    hrefTemplate: null,
    properties: [
      { key: 'action', label: 'Action', kind: 'text' },
      { key: 'actorName', label: 'Actor', kind: 'person' },
      { key: 'subjectType', label: 'Subject', kind: 'text' },
      { key: 'occurredAt', label: 'Occurred', kind: 'date' },
    ],
    filterable: ['action', 'actorName', 'subjectType'],
  },
];

export const STUDIO_LINK_TYPES: readonly StudioLinkTypeDef[] = [
  { id: 'owns', label: 'owns', from: ['organization'], to: ['undertaking'] },
  { id: 'received', label: 'received interest', from: ['undertaking'], to: ['interest'] },
  { id: 'issued', label: 'issued offer', from: ['undertaking'], to: ['offer'] },
  { id: 'delivered_by', label: 'delivered by', from: ['undertaking'], to: ['person'] },
  { id: 'reported', label: 'reported', from: ['undertaking'], to: ['report'] },
  { id: 'judges', label: 'judges', from: ['review'], to: ['report'] },
  { id: 'member_of', label: 'member of', from: ['person'], to: ['organization'] },
  { id: 'recorded', label: 'recorded', from: ['event'], to: ['undertaking'] },
  { id: 'concerns', label: 'concerns', from: ['interest', 'offer'], to: ['undertaking'] },
  { id: 'from_person', label: 'from', from: ['interest', 'offer', 'report', 'review'], to: ['person'] },
];

export function studioObjectType(id: string): StudioObjectTypeDef | undefined {
  return STUDIO_OBJECT_TYPES.find((type) => type.id === id);
}

export function studioLinkLabel(id: string): string {
  return STUDIO_LINK_TYPES.find((link) => link.id === id)?.label ?? id;
}

/** Object types that can open a workbench record directly. */
export function studioHref(type: StudioObjectTypeId, object: { id: string; undertakingId?: string | null }): string | null {
  const def = studioObjectType(type);
  if (!def?.hrefTemplate) return null;
  const target = def.hrefTemplate.includes(':undertakingId') ? object.undertakingId : object.id;
  if (!target) return null;
  return def.hrefTemplate.replace(':undertakingId', encodeURIComponent(target)).replace(':id', encodeURIComponent(target));
}
