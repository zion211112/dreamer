export type EntityType = 'person' | 'crew' | 'asset' | 'work' | 'institution' | 'evidence';
export type PrimaryEntityType = 'person' | 'crew' | 'asset';

export type RelationshipKind =
  | 'membership'
  | 'affiliation'
  | 'work'
  | 'stewardship'
  | 'contribution'
  | 'evidence';

export interface NetworkEntity {
  id: string;
  type: EntityType;
  name: string;
  role: string;
  summary: string;
  location?: string;
  capabilities: string[];
  context?: string;
  commonsContribution?: boolean;
}

export interface NetworkRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationshipKind;
  verb: string;
}

export const ENTITY_TYPES: Array<{ id: EntityType; label: string; plural: string }> = [
  { id: 'person', label: 'Person', plural: 'People' },
  { id: 'crew', label: 'Crew', plural: 'Crews' },
  { id: 'asset', label: 'Asset', plural: 'Assets' },
  { id: 'work', label: 'Work', plural: 'Work' },
  { id: 'institution', label: 'Institution', plural: 'Institutions' },
  { id: 'evidence', label: 'Evidence', plural: 'Evidence' },
];

export const PEOPLE_ROOT_LENSES: Array<{ id: PrimaryEntityType; label: string }> = [
  { id: 'person', label: 'People' },
  { id: 'crew', label: 'Crews' },
  { id: 'asset', label: 'Assets' },
];

export const PRIMARY_ENTITY_TYPES: PrimaryEntityType[] = ['person', 'crew', 'asset'];

export function isPrimaryEntity(
  entity: NetworkEntity,
): entity is NetworkEntity & { type: PrimaryEntityType } {
  return entity.type === 'person' || entity.type === 'crew' || entity.type === 'asset';
}

export const ROOT_ENTITY_BY_TYPE: Record<PrimaryEntityType, string> = {
  person: 'person-nia',
  crew: 'crew-field-systems',
  asset: 'asset-microgrid',
};

export const PEOPLE_NETWORK: NetworkEntity[] = [
  {
    id: 'person-nia',
    type: 'person',
    name: 'Nia Wanjiru',
    role: 'Field systems designer',
    summary: 'Turns local infrastructure needs into maintainable, community-run systems.',
    location: 'Nairobi',
    capabilities: ['Systems design', 'Community research', 'Solar planning'],
  },
  {
    id: 'person-jabari',
    type: 'person',
    name: 'Jabari Otieno',
    role: 'Solar technician',
    summary: 'Installs and maintains small-scale energy systems with local crews.',
    location: 'Nairobi',
    capabilities: ['Electrical systems', 'Solar maintenance', 'Safety'],
  },
  {
    id: 'person-lucia',
    type: 'person',
    name: 'Lucia Santos',
    role: 'Cooperative facilitator',
    summary: 'Helps member-owned teams turn shared priorities into practical work.',
    location: 'Oaxaca',
    capabilities: ['Facilitation', 'Cooperative governance', 'Training'],
  },
  {
    id: 'person-kwame',
    type: 'person',
    name: 'Kwame Mensah',
    role: 'Water systems researcher',
    summary: 'Documents local conditions and makes technical decisions easier to verify.',
    location: 'Accra',
    capabilities: ['Field research', 'Water systems', 'Measurement'],
  },
  {
    id: 'person-yuki',
    type: 'person',
    name: 'Yuki Tanaka',
    role: 'Knowledge steward',
    summary: 'Makes practical learning reusable through open guides and shared records.',
    location: 'Nairobi',
    capabilities: ['Documentation', 'Open learning', 'Workshop design'],
  },
  {
    id: 'crew-field-systems',
    type: 'crew',
    name: 'Field Systems Crew',
    role: 'Installation & maintenance',
    summary: 'A cross-disciplinary crew coordinating community infrastructure work.',
    location: 'Nairobi',
    capabilities: ['Commissioning', 'Electrical safety', 'Field operations'],
    context: 'Three contributors · illustrative',
  },
  {
    id: 'crew-repair-circle',
    type: 'crew',
    name: 'Mtaa Repair Circle',
    role: 'Repair & shared learning',
    summary: 'A neighborhood crew keeping useful tools in service and skills in circulation.',
    location: 'Nairobi',
    capabilities: ['Repair', 'Peer learning', 'Tool stewardship'],
    context: 'Two contributors · illustrative',
  },
  {
    id: 'crew-open-stewards',
    type: 'crew',
    name: 'Open Knowledge Stewards',
    role: 'Commons publishing',
    summary: 'A small editorial crew shaping field experience into accessible public guides.',
    location: 'Distributed',
    capabilities: ['Editing', 'Archiving', 'Knowledge sharing'],
    context: 'Two contributors · illustrative',
  },
  {
    id: 'asset-microgrid',
    type: 'asset',
    name: 'Community solar microgrid',
    role: 'Energy asset',
    summary: 'A shared solar and storage installation serving a neighborhood workshop.',
    location: 'Nairobi',
    capabilities: ['Solar generation', 'Battery storage', 'Shared access'],
    context: 'Held by Solar Commons Cooperative',
  },
  {
    id: 'asset-repair-bench',
    type: 'asset',
    name: 'Shared repair workshop',
    role: 'Workshop asset',
    summary: 'A maintained workspace for hands-on repair, training, and prototyping.',
    location: 'Nairobi',
    capabilities: ['Repair tools', 'Training space', 'Open hours'],
    context: 'Held by Kibera Makerspace',
  },
  {
    id: 'asset-tool-library',
    type: 'asset',
    name: 'Community tool library',
    role: 'Shared equipment',
    summary: 'A local lending library that keeps useful equipment accessible and accounted for.',
    location: 'Nairobi',
    capabilities: ['Tool lending', 'Inventory', 'Maintenance'],
    context: 'Held by Open Design Library',
  },
  {
    id: 'work-microgrid',
    type: 'work',
    name: 'Microgrid commissioning',
    role: 'Infrastructure work',
    summary: 'Testing, documenting, and preparing the microgrid for shared operation.',
    location: 'Nairobi',
    capabilities: ['Load testing', 'Commissioning', 'Operations handover'],
  },
  {
    id: 'work-repair-guide',
    type: 'work',
    name: 'Repair guide & workshop',
    role: 'Commons contribution',
    summary: 'An open, locally tested guide paired with a community repair workshop.',
    location: 'Nairobi',
    capabilities: ['Repair instruction', 'Open documentation', 'Peer learning'],
    context: 'Commons library',
    commonsContribution: true,
  },
  {
    id: 'work-water-audit',
    type: 'work',
    name: 'Water resilience audit',
    role: 'Field research',
    summary: 'A practical assessment of shared water infrastructure and maintenance needs.',
    location: 'Accra',
    capabilities: ['Site survey', 'Water quality', 'Maintenance planning'],
  },
  {
    id: 'institution-solar-commons',
    type: 'institution',
    name: 'Solar Commons Cooperative',
    role: 'Energy cooperative',
    summary: 'A member-led institution coordinating shared energy infrastructure.',
    location: 'Nairobi',
    capabilities: ['Shared energy', 'Member governance', 'Asset stewardship'],
  },
  {
    id: 'institution-kibera-makerspace',
    type: 'institution',
    name: 'Kibera Makerspace',
    role: 'Community workshop',
    summary: 'A locally managed space for practical learning, repair, and making.',
    location: 'Nairobi',
    capabilities: ['Workshop access', 'Technical training', 'Local fabrication'],
  },
  {
    id: 'institution-open-design',
    type: 'institution',
    name: 'Open Design Library',
    role: 'Learning institution',
    summary: 'A shared resource for open knowledge, tools, and community-authored guides.',
    location: 'Nairobi',
    capabilities: ['Open resources', 'Tool lending', 'Learning'],
  },
  {
    id: 'evidence-load-test',
    type: 'evidence',
    name: 'Inverter load-test record',
    role: 'Test record',
    summary: 'An example commissioning record showing measurements and test conditions.',
    location: 'Nairobi',
    capabilities: ['Measured output', 'Test conditions', 'Review trail'],
    context: 'Illustrative record · not operational evidence',
  },
  {
    id: 'evidence-tool-log',
    type: 'evidence',
    name: 'Tool circulation log',
    role: 'Stewardship record',
    summary: 'An example register documenting shared equipment use and maintenance.',
    location: 'Nairobi',
    capabilities: ['Equipment history', 'Maintenance notes', 'Access record'],
    context: 'Illustrative record · not operational evidence',
  },
  {
    id: 'evidence-community-notes',
    type: 'evidence',
    name: 'Community review notes',
    role: 'Review record',
    summary: 'An example record of feedback gathered during a neighborhood workshop.',
    location: 'Nairobi',
    capabilities: ['Participant feedback', 'Open questions', 'Next steps'],
    context: 'Illustrative record · not operational evidence',
  },
];

export const PEOPLE_RELATIONSHIPS: NetworkRelationship[] = [
  { id: 'nia-crew', sourceId: 'person-nia', targetId: 'crew-field-systems', kind: 'membership', verb: 'member of' },
  { id: 'jabari-crew', sourceId: 'person-jabari', targetId: 'crew-field-systems', kind: 'membership', verb: 'member of' },
  { id: 'kwame-crew', sourceId: 'person-kwame', targetId: 'crew-field-systems', kind: 'membership', verb: 'member of' },
  { id: 'lucia-crew', sourceId: 'person-lucia', targetId: 'crew-repair-circle', kind: 'membership', verb: 'member of' },
  { id: 'yuki-crew', sourceId: 'person-yuki', targetId: 'crew-open-stewards', kind: 'membership', verb: 'member of' },
  { id: 'nia-institution', sourceId: 'person-nia', targetId: 'institution-solar-commons', kind: 'affiliation', verb: 'works with' },
  { id: 'jabari-institution', sourceId: 'person-jabari', targetId: 'institution-solar-commons', kind: 'affiliation', verb: 'works with' },
  { id: 'lucia-institution', sourceId: 'person-lucia', targetId: 'institution-kibera-makerspace', kind: 'affiliation', verb: 'works with' },
  { id: 'kwame-institution', sourceId: 'person-kwame', targetId: 'institution-kibera-makerspace', kind: 'affiliation', verb: 'works with' },
  { id: 'yuki-institution', sourceId: 'person-yuki', targetId: 'institution-open-design', kind: 'affiliation', verb: 'works with' },
  { id: 'nia-work', sourceId: 'person-nia', targetId: 'work-microgrid', kind: 'work', verb: 'designs' },
  { id: 'jabari-work', sourceId: 'person-jabari', targetId: 'work-microgrid', kind: 'work', verb: 'commissions' },
  { id: 'kwame-work', sourceId: 'person-kwame', targetId: 'work-water-audit', kind: 'work', verb: 'researches' },
  { id: 'field-work', sourceId: 'crew-field-systems', targetId: 'work-microgrid', kind: 'work', verb: 'delivers' },
  { id: 'field-audit', sourceId: 'crew-field-systems', targetId: 'work-water-audit', kind: 'work', verb: 'supports' },
  { id: 'lucia-guide', sourceId: 'person-lucia', targetId: 'work-repair-guide', kind: 'contribution', verb: 'co-authors' },
  { id: 'yuki-guide', sourceId: 'person-yuki', targetId: 'work-repair-guide', kind: 'contribution', verb: 'publishes to Commons' },
  { id: 'repair-guide', sourceId: 'crew-repair-circle', targetId: 'work-repair-guide', kind: 'contribution', verb: 'contributes to' },
  { id: 'stewards-guide', sourceId: 'crew-open-stewards', targetId: 'work-repair-guide', kind: 'contribution', verb: 'curates' },
  { id: 'jabari-asset', sourceId: 'person-jabari', targetId: 'asset-microgrid', kind: 'stewardship', verb: 'maintains' },
  { id: 'nia-bench', sourceId: 'person-nia', targetId: 'asset-repair-bench', kind: 'stewardship', verb: 'uses' },
  { id: 'yuki-tools', sourceId: 'person-yuki', targetId: 'asset-tool-library', kind: 'stewardship', verb: 'stewards' },
  { id: 'asset-solar-holder', sourceId: 'asset-microgrid', targetId: 'institution-solar-commons', kind: 'stewardship', verb: 'held by' },
  { id: 'asset-bench-holder', sourceId: 'asset-repair-bench', targetId: 'institution-kibera-makerspace', kind: 'stewardship', verb: 'held by' },
  { id: 'asset-tools-holder', sourceId: 'asset-tool-library', targetId: 'institution-open-design', kind: 'stewardship', verb: 'held by' },
  { id: 'work-uses-grid', sourceId: 'work-microgrid', targetId: 'asset-microgrid', kind: 'work', verb: 'commissions' },
  { id: 'work-uses-bench', sourceId: 'work-repair-guide', targetId: 'asset-repair-bench', kind: 'work', verb: 'uses' },
  { id: 'audit-grid', sourceId: 'work-water-audit', targetId: 'asset-microgrid', kind: 'work', verb: 'assesses' },
  { id: 'evidence-work', sourceId: 'evidence-load-test', targetId: 'work-microgrid', kind: 'evidence', verb: 'supports' },
  { id: 'evidence-asset', sourceId: 'evidence-tool-log', targetId: 'asset-tool-library', kind: 'evidence', verb: 'documents' },
  { id: 'evidence-guide', sourceId: 'evidence-community-notes', targetId: 'work-repair-guide', kind: 'evidence', verb: 'informs' },
  { id: 'evidence-audit', sourceId: 'evidence-community-notes', targetId: 'work-water-audit', kind: 'evidence', verb: 'informs' },
];

export const ENTITY_BY_ID = new Map(PEOPLE_NETWORK.map((entity) => [entity.id, entity]));
