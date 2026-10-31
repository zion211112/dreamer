export type EntityType = 'person' | 'crew' | 'project' | 'asset' | 'work' | 'institution' | 'evidence';
export type PrimaryEntityType = 'person' | 'crew' | 'asset';

export type RelationshipKind =
  | 'membership'
  | 'affiliation'
  | 'work'
  | 'stewardship'
  | 'contribution'
  | 'evidence'
  | 'owns'
  | 'operates'
  | 'stewards'
  | 'funds'
  | 'contributes_to'
  | 'attests'
  | 'issues';
export type RecordBasis = 'illustrative' | 'local-profile' | 'project-reported';

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
  assetReference?: string;
  recordBasis?: RecordBasis;
}

export interface NetworkRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  kind: RelationshipKind;
  verb: string;
}

export interface PeopleNetworkRecord {
  entities: NetworkEntity[];
  relationships: NetworkRelationship[];
}

interface PortablePeopleRecord extends PeopleNetworkRecord {
  format: 'aptlabs.people-network';
  version: 1;
  anchor: 'APT-LABS';
  exportedAt: string;
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
  person: 'person-kemoly-murage',
  crew: 'crew-crew0',
  asset: 'asset-kemetos1',
};

const peopleRecordStorageKey = 'aptlabs:people-network:v1';

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
    id: 'person-kemoly-murage',
    type: 'person',
    name: 'Kemoly Murage',
    role: 'Systems architect',
    summary: 'Designs systems across APT-LABS and Kemetos1; contribution records are linked below.',
    location: 'Distributed',
    capabilities: ['Systems architecture', 'Protocol design', 'AGI systems'],
    context: 'Three APT-LABS design SBTs reported; Kemetos1 paper verification stated by project.',
    recordBasis: 'local-profile',
  },
  {
    id: 'person-horus-young',
    type: 'person',
    name: 'Horus the Young',
    role: 'AGI systems contributor',
    summary: 'Works on AGI systems within Kemetos1. No additional credentials are asserted here.',
    location: 'Distributed',
    capabilities: ['AGI systems', 'Research and prototyping'],
  },
  {
    id: 'person-tehuti',
    type: 'person',
    name: 'Tehuti',
    role: 'Crew0 administrator',
    summary: 'Coordinates Crew0 membership and access; no credentials or specialist capabilities are claimed.',
    location: 'Distributed',
    capabilities: ['Crew administration'],
  },
  {
    id: 'person-zuri-kamau',
    type: 'person',
    name: 'Zuri Kamau',
    role: 'Illustrative learning animator',
    summary: 'A fictional sample contributor used to explain the learning-media journey; no real person or availability is represented.',
    capabilities: ['Storyboarding', 'Learning-focused communication'],
    context: 'Illustrative only · not an available contributor.',
    recordBasis: 'illustrative',
  },
  {
    id: 'asset-kemetos1',
    type: 'asset',
    name: 'Kemetos1',
    role: 'AGI systems asset',
    summary: 'A reusable AGI systems asset that anchors Crew0 research, infrastructure, and operational work.',
    location: 'Distributed',
    capabilities: ['AGI systems', 'Inference', 'Agent infrastructure'],
    context: 'Asset record; no institution or external affiliation inferred.',
    assetReference: 'EX-AS-01',
    recordBasis: 'project-reported',
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
    id: 'crew-crew0',
    type: 'crew',
    name: 'Crew0',
    role: 'AGI systems crew',
    summary: 'A three-person crew working on the Kemetos1 project.',
    location: 'Distributed',
    capabilities: ['AGI systems', 'Project work'],
    context: 'Three members · administration assigned to Tehuti.',
  },
  {
    id: 'crew-learning-media',
    type: 'crew',
    name: 'Learning Media Crew',
    role: 'Illustrative learning media crew',
    summary: 'A sample crew concept for the learning-animation journey; no real members or availability are asserted.',
    capabilities: ['Storyboarding', 'Learning-focused communication'],
    context: 'Illustrative only · no staffed team is represented.',
    recordBasis: 'illustrative',
  },
  {
    id: 'asset-microgrid',
    type: 'asset',
    name: 'Community Solar Microgrid',
    role: 'Energy asset',
    summary: 'Illustrative shared solar and storage asset; site, operator, and operating state are not configured.',
    capabilities: ['Solar generation', 'Battery storage', 'Shared access'],
    context: 'Associated institution shown as scenario context; ownership is unknown.',
    assetReference: 'EX-AS-05',
    recordBasis: 'illustrative',
  },
  {
    id: 'asset-repair-bench',
    type: 'asset',
    name: 'Shared Repair Workshop',
    role: 'Workshop asset',
    summary: 'Illustrative shared workspace; site, operator, and operating state are not configured.',
    capabilities: ['Repair tools', 'Training space', 'Open hours'],
    context: 'Associated institution shown as scenario context; ownership is unknown.',
    assetReference: 'EX-AS-06',
    recordBasis: 'illustrative',
  },
  {
    id: 'asset-tool-library',
    type: 'asset',
    name: 'Community Tool Library',
    role: 'Shared equipment',
    summary: 'Illustrative shared equipment library; location, operator, and condition are not verified.',
    capabilities: ['Tool lending', 'Inventory', 'Maintenance'],
    context: 'Associated institution shown as scenario context; ownership is unknown.',
    assetReference: 'EX-AS-07',
    recordBasis: 'illustrative',
  },
  {
    id: 'asset-school-management-console',
    type: 'asset',
    name: 'School Management Console',
    role: 'Local-first software product',
    summary: 'A browser-local teaching and school operations prototype; it is not the school or its physical infrastructure.',
    capabilities: ['Teaching tools', 'Practice marking', 'Private need drafts'],
    context: 'Local-first prototype; no external service integration is implied.',
    assetReference: 'EX-AS-02',
    recordBasis: 'illustrative',
  },
  {
    id: 'asset-fikra-api',
    type: 'asset',
    name: 'Fikra API',
    role: 'Inference service',
    summary: 'A service asset associated with Lacesse Co; no browser-side integration is configured.',
    capabilities: ['Inference service'],
    context: 'Service endpoint, availability, and integration are not configured.',
    assetReference: 'EX-AS-04',
    recordBasis: 'project-reported',
  },
  {
    id: 'asset-mwea-water-pump-02',
    type: 'asset',
    name: 'Mwea Water Cooperative Pump 02',
    role: 'Water infrastructure asset',
    summary: 'Illustrative pump asset linked to a sample maintenance observation; site and condition are not verified.',
    capabilities: ['Water service', 'Maintenance inspection'],
    context: 'Ownership, operator, and current condition are unknown.',
    assetReference: 'EX-AS-08',
    recordBasis: 'illustrative',
  },
  {
    id: 'asset-lake-basin-cold-store-chamber-a',
    type: 'asset',
    name: 'Lake Basin Cold Store Chamber A',
    role: 'Cold-storage asset',
    summary: 'Illustrative cold-storage chamber linked to a sample inspection observation; readings and condition are not verified.',
    capabilities: ['Cold storage', 'Inspection'],
    context: 'Ownership, operator, site details, and operating state are unknown.',
    assetReference: 'EX-AS-09',
    recordBasis: 'illustrative',
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
    id: 'mwea-school',
    type: 'institution',
    name: 'Mwea Community School',
    role: 'School',
    summary: 'Institutional context for the sample school-energy and learning-animation journeys.',
    capabilities: ['Education'],
    context: 'Institution identity is illustrative; authority and location are not verified.',
    recordBasis: 'illustrative',
  },
  {
    id: 'mwea-water',
    type: 'institution',
    name: 'Mwea Water Cooperative',
    role: 'Cooperative',
    summary: 'Institutional context for the sample pump observation.',
    capabilities: ['Water service'],
    context: 'Institution identity and authority are not independently verified.',
    recordBasis: 'illustrative',
  },
  {
    id: 'lake-basin-cold-store',
    type: 'institution',
    name: 'Lake Basin Cold Store',
    role: 'Enterprise',
    summary: 'Institutional context for the sample cold-storage observation.',
    capabilities: ['Cold storage'],
    context: 'Institution identity and authority are not independently verified.',
    recordBasis: 'illustrative',
  },
  {
    id: 'institution-lacesse-co',
    type: 'institution',
    name: 'Lacesse Co',
    role: 'Organization',
    summary: 'Associated institution for the Fikra API service asset.',
    capabilities: [],
    context: 'Association is project-reported; legal identity and authority are not verified.',
    recordBasis: 'project-reported',
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
  {
    id: 'evidence-kemoly-sbts',
    type: 'evidence',
    name: 'APT-LABS design · 3 SBTs',
    role: 'Member-reported credential claim',
    summary: 'Three APT-LABS design SBTs are reported by the local profile; issuer, status, and verification references are unavailable.',
    location: 'APT-LABS',
    capabilities: ['Reported design contribution'],
    context: 'Reported claim only · not a credential or badge; issuer and status unavailable.',
    recordBasis: 'local-profile',
  },
  {
    id: 'evidence-kemoly-papers',
    type: 'evidence',
    name: 'Kemetos1 research papers',
    role: 'Research evidence',
    summary: 'Paper verification is reported by Kemetos1; titles and verification references have not been attached.',
    location: 'Kemetos1',
    capabilities: ['Research', 'Project review'],
    context: 'Project verification stated · references not linked',
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
  { id: 'kemoly-crew0', sourceId: 'person-kemoly-murage', targetId: 'crew-crew0', kind: 'membership', verb: 'architects' },
  { id: 'horus-crew0', sourceId: 'person-horus-young', targetId: 'crew-crew0', kind: 'membership', verb: 'contributes to' },
  { id: 'tehuti-crew0', sourceId: 'person-tehuti', targetId: 'crew-crew0', kind: 'membership', verb: 'administers' },
  { id: 'kemoly-kemetos1', sourceId: 'person-kemoly-murage', targetId: 'asset-kemetos1', kind: 'work', verb: 'architects' },
  { id: 'horus-kemetos1', sourceId: 'person-horus-young', targetId: 'asset-kemetos1', kind: 'work', verb: 'builds' },
  { id: 'tehuti-kemetos1', sourceId: 'person-tehuti', targetId: 'asset-kemetos1', kind: 'work', verb: 'coordinates' },
  { id: 'crew0-kemetos1', sourceId: 'crew-crew0', targetId: 'asset-kemetos1', kind: 'work', verb: 'maintains' },
  { id: 'kemoly-sbts', sourceId: 'person-kemoly-murage', targetId: 'evidence-kemoly-sbts', kind: 'evidence', verb: 'holds' },
  { id: 'kemoly-papers', sourceId: 'person-kemoly-murage', targetId: 'evidence-kemoly-papers', kind: 'evidence', verb: 'authored' },
  { id: 'sbt-kemetos1', sourceId: 'evidence-kemoly-sbts', targetId: 'asset-kemetos1', kind: 'evidence', verb: 'records design work for' },
  { id: 'papers-kemetos1', sourceId: 'evidence-kemoly-papers', targetId: 'asset-kemetos1', kind: 'evidence', verb: 'verified by project' },
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
  { id: 'asset-solar-holder', sourceId: 'asset-microgrid', targetId: 'institution-solar-commons', kind: 'affiliation', verb: 'scenario association · role unverified' },
  { id: 'asset-bench-holder', sourceId: 'asset-repair-bench', targetId: 'institution-kibera-makerspace', kind: 'affiliation', verb: 'scenario association · role unverified' },
  { id: 'asset-tools-holder', sourceId: 'asset-tool-library', targetId: 'institution-open-design', kind: 'affiliation', verb: 'scenario association · role unverified' },
  { id: 'asset-fikra-lacesse', sourceId: 'asset-fikra-api', targetId: 'institution-lacesse-co', kind: 'affiliation', verb: 'associated with · project-reported' },
  { id: 'asset-console-school', sourceId: 'asset-school-management-console', targetId: 'mwea-school', kind: 'affiliation', verb: 'scenario context · not school infrastructure' },
  { id: 'asset-pump-water-coop', sourceId: 'asset-mwea-water-pump-02', targetId: 'mwea-water', kind: 'affiliation', verb: 'scenario context' },
  { id: 'asset-cold-store-institution', sourceId: 'asset-lake-basin-cold-store-chamber-a', targetId: 'lake-basin-cold-store', kind: 'affiliation', verb: 'scenario context' },
  { id: 'zuri-learning-media', sourceId: 'person-zuri-kamau', targetId: 'crew-learning-media', kind: 'membership', verb: 'illustrative association · no availability implied' },
  { id: 'work-uses-grid', sourceId: 'work-microgrid', targetId: 'asset-microgrid', kind: 'work', verb: 'commissions' },
  { id: 'work-uses-bench', sourceId: 'work-repair-guide', targetId: 'asset-repair-bench', kind: 'work', verb: 'uses' },
  { id: 'audit-grid', sourceId: 'work-water-audit', targetId: 'asset-microgrid', kind: 'work', verb: 'assesses' },
  { id: 'evidence-work', sourceId: 'evidence-load-test', targetId: 'work-microgrid', kind: 'evidence', verb: 'supports' },
  { id: 'evidence-asset', sourceId: 'evidence-tool-log', targetId: 'asset-tool-library', kind: 'evidence', verb: 'documents' },
  { id: 'evidence-guide', sourceId: 'evidence-community-notes', targetId: 'work-repair-guide', kind: 'evidence', verb: 'informs' },
  { id: 'evidence-audit', sourceId: 'evidence-community-notes', targetId: 'work-water-audit', kind: 'evidence', verb: 'informs' },
];

export const ENTITY_BY_ID = new Map(PEOPLE_NETWORK.map((entity) => [entity.id, entity]));

function isNetworkEntity(value: unknown): value is NetworkEntity {
  if (typeof value !== 'object' || value === null) return false;
  const entity = value as Record<string, unknown>;
  return typeof entity.id === 'string'
    && typeof entity.type === 'string'
    && (ENTITY_TYPES.some((type) => type.id === entity.type) || entity.type === 'project')
    && typeof entity.name === 'string'
    && typeof entity.role === 'string'
    && typeof entity.summary === 'string'
    && Array.isArray(entity.capabilities)
    && entity.capabilities.every((capability) => typeof capability === 'string')
    && (entity.location === undefined || typeof entity.location === 'string')
    && (entity.context === undefined || typeof entity.context === 'string')
    && (entity.commonsContribution === undefined || typeof entity.commonsContribution === 'boolean')
    && (entity.assetReference === undefined || typeof entity.assetReference === 'string')
    && (entity.recordBasis === undefined || entity.recordBasis === 'illustrative'
      || entity.recordBasis === 'local-profile' || entity.recordBasis === 'project-reported');
}

function isNetworkRelationship(value: unknown): value is NetworkRelationship {
  if (typeof value !== 'object' || value === null) return false;
  const relationship = value as Record<string, unknown>;
  return typeof relationship.id === 'string'
    && typeof relationship.sourceId === 'string'
    && typeof relationship.targetId === 'string'
    && typeof relationship.kind === 'string'
    && ['membership', 'affiliation', 'work', 'stewardship', 'contribution', 'evidence', 'owns', 'operates',
      'stewards', 'funds', 'contributes_to', 'attests', 'issues'].includes(relationship.kind)
    && typeof relationship.verb === 'string';
}

function isPortablePeopleRecord(value: unknown): value is PortablePeopleRecord {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as Record<string, unknown>;
  if (record.format !== 'aptlabs.people-network'
    || record.version !== 1
    || record.anchor !== 'APT-LABS'
    || typeof record.exportedAt !== 'string'
    || !Array.isArray(record.entities)
    || !record.entities.every(isNetworkEntity)
    || !Array.isArray(record.relationships)
    || !record.relationships.every(isNetworkRelationship)) return false;

  const entityIds = new Set(record.entities.map((entity) => entity.id));
  return entityIds.size === record.entities.length
    && record.relationships.every((relationship) => entityIds.has(relationship.sourceId) && entityIds.has(relationship.targetId));
}

export function readPeopleNetworkRecord(): PeopleNetworkRecord {
  if (typeof window === 'undefined') return { entities: PEOPLE_NETWORK, relationships: PEOPLE_RELATIONSHIPS };
  const saved = window.localStorage.getItem(peopleRecordStorageKey);
  if (!saved) return { entities: PEOPLE_NETWORK, relationships: PEOPLE_RELATIONSHIPS };
  const parsed: unknown = JSON.parse(saved);
  if (!isPortablePeopleRecord(parsed)) {
    throw new Error('The saved coordination record is not a supported APT-LABS record. Export it before replacing it.');
  }
  const legacyKemetos = parsed.entities.find(entity => entity.type === 'project'
    && (entity.id === 'project-kemetos1' || entity.name.toLocaleLowerCase() === 'kemetos1'));
  if (!legacyKemetos) return { entities: parsed.entities, relationships: parsed.relationships };

  return {
    entities: parsed.entities.map(entity => entity.id === legacyKemetos.id
      ? { ...entity, id: 'asset-kemetos1', type: 'asset', role: 'AGI systems asset' }
      : entity),
    relationships: parsed.relationships.map(relationship => ({
      ...relationship,
      sourceId: relationship.sourceId === legacyKemetos.id ? 'asset-kemetos1' : relationship.sourceId,
      targetId: relationship.targetId === legacyKemetos.id ? 'asset-kemetos1' : relationship.targetId,
    })),
  };
}

export function readImportedPeopleNetworkRecord(): PeopleNetworkRecord | null {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(peopleRecordStorageKey);
  if (saved === null) return null;

  const parsed: unknown = JSON.parse(saved);
  if (!isPortablePeopleRecord(parsed)) {
    throw new Error('The saved coordination record is not a supported APT-LABS record. Export it before replacing it.');
  }
  return { entities: parsed.entities, relationships: parsed.relationships };
}

export function createPortablePeopleRecord(record?: PeopleNetworkRecord): string {
  const selectedRecord = record ?? readPeopleNetworkRecord();
  const portableRecord: PortablePeopleRecord = {
    format: 'aptlabs.people-network',
    version: 1,
    anchor: 'APT-LABS',
    exportedAt: new Date().toISOString(),
    ...selectedRecord,
  };
  return JSON.stringify(portableRecord, null, 2);
}

export function importPortablePeopleRecord(serialized: string): void {
  let parsed: unknown;
  try {
    parsed = JSON.parse(serialized);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  if (!isPortablePeopleRecord(parsed)) {
    throw new Error('This file is not a valid APT-LABS People record.');
  }
  window.localStorage.setItem(peopleRecordStorageKey, JSON.stringify(parsed));
}
