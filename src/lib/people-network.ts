export type EntityType = 'person' | 'crew' | 'project' | 'asset' | 'work' | 'institution' | 'evidence';
export type PrimaryEntityType = 'person' | 'crew' | 'project' | 'asset';

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
  { id: 'project', label: 'Project', plural: 'Projects' },
  { id: 'asset', label: 'Asset', plural: 'Assets' },
  { id: 'work', label: 'Work', plural: 'Work' },
  { id: 'institution', label: 'Institution', plural: 'Institutions' },
  { id: 'evidence', label: 'Evidence', plural: 'Evidence' },
];

export const PEOPLE_ROOT_LENSES: Array<{ id: PrimaryEntityType; label: string }> = [
  { id: 'person', label: 'People' },
  { id: 'crew', label: 'Crews' },
  { id: 'project', label: 'Projects' },
  { id: 'asset', label: 'Assets' },
];

export const PRIMARY_ENTITY_TYPES: PrimaryEntityType[] = ['person', 'crew', 'project', 'asset'];

export function isPrimaryEntity(
  entity: NetworkEntity,
): entity is NetworkEntity & { type: PrimaryEntityType } {
  return entity.type === 'person' || entity.type === 'crew' || entity.type === 'project' || entity.type === 'asset';
}

export const ROOT_ENTITY_BY_TYPE: Record<PrimaryEntityType, string> = {
  person: 'person-kemoly-murage',
  crew: 'crew-crew0',
  project: 'project-kemetos1',
  asset: 'asset-aptlabs-rails',
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
    id: 'project-kemetos1',
    type: 'project',
    name: 'Kemetos1',
    role: 'AGI systems project',
    summary: 'Shared project anchor for Crew0 work, research, and project-issued evidence.',
    location: 'Distributed',
    capabilities: ['AGI systems', 'Research', 'Project coordination'],
    context: 'Project record; no institution or external affiliation inferred.',
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
  {
    id: 'evidence-kemoly-sbts',
    type: 'evidence',
    name: 'APT-LABS design · 3 SBTs',
    role: 'Credential record',
    summary: 'Three Soulbound Tokens are reported for APT-LABS design work. Issuer references are not attached to this portable record.',
    location: 'APT-LABS',
    capabilities: ['Design contribution', 'Credential count: 3'],
    context: 'Member-reported · issuer proof not linked',
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
  { id: 'kemoly-kemetos1', sourceId: 'person-kemoly-murage', targetId: 'project-kemetos1', kind: 'work', verb: 'architects' },
  { id: 'horus-kemetos1', sourceId: 'person-horus-young', targetId: 'project-kemetos1', kind: 'work', verb: 'builds' },
  { id: 'tehuti-kemetos1', sourceId: 'person-tehuti', targetId: 'project-kemetos1', kind: 'work', verb: 'coordinates' },
  { id: 'crew0-kemetos1', sourceId: 'crew-crew0', targetId: 'project-kemetos1', kind: 'work', verb: 'delivers' },
  { id: 'kemoly-sbts', sourceId: 'person-kemoly-murage', targetId: 'evidence-kemoly-sbts', kind: 'evidence', verb: 'holds' },
  { id: 'kemoly-papers', sourceId: 'person-kemoly-murage', targetId: 'evidence-kemoly-papers', kind: 'evidence', verb: 'authored' },
  { id: 'sbt-kemetos1', sourceId: 'evidence-kemoly-sbts', targetId: 'project-kemetos1', kind: 'evidence', verb: 'records design work for' },
  { id: 'papers-kemetos1', sourceId: 'evidence-kemoly-papers', targetId: 'project-kemetos1', kind: 'evidence', verb: 'verified by project' },
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

function isNetworkEntity(value: unknown): value is NetworkEntity {
  if (typeof value !== 'object' || value === null) return false;
  const entity = value as Record<string, unknown>;
  return typeof entity.id === 'string'
    && typeof entity.type === 'string'
    && ENTITY_TYPES.some((type) => type.id === entity.type)
    && typeof entity.name === 'string'
    && typeof entity.role === 'string'
    && typeof entity.summary === 'string'
    && Array.isArray(entity.capabilities)
    && entity.capabilities.every((capability) => typeof capability === 'string')
    && (entity.location === undefined || typeof entity.location === 'string')
    && (entity.context === undefined || typeof entity.context === 'string')
    && (entity.commonsContribution === undefined || typeof entity.commonsContribution === 'boolean');
}

function isNetworkRelationship(value: unknown): value is NetworkRelationship {
  if (typeof value !== 'object' || value === null) return false;
  const relationship = value as Record<string, unknown>;
  return typeof relationship.id === 'string'
    && typeof relationship.sourceId === 'string'
    && typeof relationship.targetId === 'string'
    && typeof relationship.kind === 'string'
    && ['membership', 'affiliation', 'work', 'stewardship', 'contribution', 'evidence'].includes(relationship.kind)
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
  return { entities: parsed.entities, relationships: parsed.relationships };
}

export function createPortablePeopleRecord(): string {
  const record = readPeopleNetworkRecord();
  const portableRecord: PortablePeopleRecord = {
    format: 'aptlabs.people-network',
    version: 1,
    anchor: 'APT-LABS',
    exportedAt: new Date().toISOString(),
    ...record,
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
