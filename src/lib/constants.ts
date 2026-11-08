// ============================================================================
// APT-LABS — Shared Constants
// Single source for People, FieldDesk, Institutions, Commons, Archetypes
// ============================================================================

export type InstitutionId =
  | 'dev2027ke'
  | 'mwea-animation-studio'
  | 'cooperative-housing-trust'
  | 'solar-commons-initiative'
  | 'independent';

export type CommonsId =
  | 'open-design-library'
  | 'community-land-trust'
  | 'knowledge-repository';

export type CrewRole = 'anchor' | 'builder' | 'apprentice';

export type Category = 'education' | 'health' | 'energy' | 'housing' | 'water' | 'food' | 'transport' | 'digital';

export type Archetype =
  | 'dropout'
  | 'builder'
  | 'socializer'
  | 'graduate'
  | 'researcher'
  | 'steward'
  | 'catalyst';

export interface Institution {
  id: InstitutionId;
  name: string;
  kind: string;
  location: string;
  since: string;
}

export interface Commons {
  id: CommonsId;
  name: string;
  type: string;
  items: string;
  stewards: number;
}

export interface PersonNode {
  id: string;
  name: string;
  role: string;
  archetype: Archetype;
  institution: InstitutionId;
  location: string;
  since: string;
  avatar: string;
  bio: string;
  skills: string[];
  projects: string[];
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
}

export const INSTITUTIONS: Institution[] = [
  { id: 'dev2027ke', name: 'dev2027ke', kind: 'Developer Collective', location: 'Nairobi, Kenya', since: '2022' },
  { id: 'mwea-animation-studio', name: 'MWEA Animation Studio', kind: 'Creative Collective', location: 'Nairobi, Kenya', since: '2022' },
  { id: 'cooperative-housing-trust', name: 'Cooperative Housing Trust', kind: 'Housing Cooperative', location: 'Berlin, Germany', since: '2019' },
  { id: 'solar-commons-initiative', name: 'Solar Commons Initiative', kind: 'Energy Cooperative', location: 'Oaxaca, Mexico', since: '2023' },
  { id: 'independent', name: 'Independent', kind: 'Individual', location: 'Various', since: '—' },
];

export const COMMONS: Commons[] = [
  { id: 'open-design-library', name: 'Open Design Library', type: 'Shared Resources', items: '247 patterns', stewards: 12 },
  { id: 'community-land-trust', name: 'Community Land Trust', type: 'Land Commons', items: '42 hectares', stewards: 8 },
  { id: 'knowledge-repository', name: 'Knowledge Repository', type: 'Documentation', items: '1,200+ guides', stewards: 24 },
];

export const CREW_ROLES: CrewRole[] = ['anchor', 'builder', 'apprentice'];

export const CATEGORIES: Category[] = ['education', 'health', 'energy', 'housing', 'water', 'food', 'transport', 'digital'];

export const ARCHETYPES: Archetype[] = ['dropout', 'builder', 'socializer', 'graduate', 'researcher', 'steward', 'catalyst'];

export const LOCATIONS = [
  'Nairobi, Kenya',
  'Berlin, Germany',
  'Oaxaca, Mexico',
  'Kampala, Uganda',
  'Kigali, Rwanda',
  'Addis Ababa, Ethiopia',
  'Dar es Salaam, Tanzania',
  'Lagos, Nigeria',
  'Accra, Ghana',
  'Cape Town, South Africa',
  'Remote',
];

export const SKILLS_BY_ARCHETYPE: Record<Archetype, string[]> = {
  dropout: ['Self-taught systems', 'Improvisation', 'Resource scavenging', 'Peer teaching'],
  builder: ['Fabrication', 'Carpentry', 'Welding', 'CNC operation', 'Material sourcing'],
  socializer: ['Community mobilization', 'Conflict mediation', 'Event coordination', 'Stakeholder mapping'],
  graduate: ['Research design', 'Data analysis', 'Technical writing', 'Grant writing'],
  researcher: ['Field research', 'Ethnography', 'Impact measurement', 'Participatory design'],
  steward: ['Governance design', 'Commons management', 'Financial stewardship', 'Succession planning'],
  catalyst: ['Systems thinking', 'Prototype iteration', 'Cross-domain synthesis', 'Network weaving'],
};

export const BIOS: Record<string, string> = {
  'wambui-kariuki': 'Former Safaricom engineer. Left to build tooling for informal tech apprenticeships in Eastlands.',
  'omondi-otieno': 'Dropped out of JKUAT Mech Eng. Runs a fabrication shop in Kariobangi. Teaches welding weekends.',
  'achieng-owuor': 'Community organizer in Mathare. Coordinates water kiosk maintenance across 12 wards.',
  'mutiso-mwangi': 'Ex-UN-Habitat. Now designs participatory budgeting for county governments.',
  'kimani-ndungu': 'Solar technician. Installs off-grid systems for clinics in Turkana and Marsabit.',
  'nyambura-waithaka': 'Clinical officer. Built a triage app for nurse-led facilities in Nyandarua.',
  'otieno-odhiambo': 'Animator. MWEA studio lead. Trains youth in 2D/3D for local ad agencies.',
  'wairimu-kamau': 'Architect. Designs incremental housing for cooperative land trusts in Kiambu.',
  'mwangi-githinji': 'PhD candidate. Studies informal economies. Advises on digital public infrastructure.',
  'acheampong-kwame': 'Ghanaian dev. Builds offline-first apps for cocoa cooperatives in Ashanti.',
  // ... more bios generated dynamically
};

export const ARCHETYPE_COLORS: Record<Archetype, string> = {
  dropout: '#8fd98f',      // terrain/phosphor
  builder: '#c8b89a',      // contour
  socializer: '#b8955a',   // brass
  graduate: '#3a6b8c',     // water
  researcher: '#7dd3fc',   // water-light
  steward: '#5d7a5c',      // terrain-dark
  catalyst: '#e8c87d',     // brass-light
};

export const ARCHETYPE_LABELS: Record<Archetype, string> = {
  dropout: 'DP',
  builder: 'BD',
  socializer: 'SC',
  graduate: 'GR',
  researcher: 'RS',
  steward: 'ST',
  catalyst: 'CT',
};

export const INSTITUTION_COLORS: Record<InstitutionId, string> = {
  'dev2027ke': '#5d7a5c',
  'mwea-animation-studio': '#b8955a',
  'cooperative-housing-trust': '#3a6b8c',
  'solar-commons-initiative': '#8fd98f',
  'independent': '#6b7066',
};

function generatePerson(
  id: string,
  name: string,
  role: string,
  archetype: Archetype,
  institution: InstitutionId,
  location: string,
  since: string,
  bio: string,
  skills: string[],
  projects: string[],
  x: number,
  y: number
): PersonNode {
  return {
    id,
    name,
    role,
    archetype,
    institution,
    location,
    since,
    avatar: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    bio,
    skills,
    projects,
    x,
    y,
  };
}

export const MOCK_PEOPLE: PersonNode[] = [
  generatePerson('wambui-kariuki', 'Wambui Kariuki', 'Systems Engineer', 'dropout', 'dev2027ke', 'Nairobi, Kenya', '2022', BIOS['wambui-kariuki'], SKILLS_BY_ARCHETYPE.dropout, ['School Console v1', 'Apprentice Matching'], 200, 180),
  generatePerson('omondi-otieno', 'Omondi Otieno', 'Fabrication Lead', 'builder', 'dev2027ke', 'Nairobi, Kenya', '2023', BIOS['omondi-otieno'], SKILLS_BY_ARCHETYPE.builder, ['Solar Dehydrator Frame', 'School Console Enclosure'], 280, 260),
  generatePerson('achieng-owuor', 'Achieng Owuor', 'Community Coordinator', 'socializer', 'dev2027ke', 'Nairobi, Kenya', '2022', BIOS['achieng-owuor'], SKILLS_BY_ARCHETYPE.socializer, ['Water Kiosk Network', 'School Console Rollout'], 120, 340),
  generatePerson('mutiso-mwangi', 'Mutiso Mwangi', 'Policy Designer', 'graduate', 'dev2027ke', 'Nairobi, Kenya', '2024', BIOS['mutiso-mwangi'], SKILLS_BY_ARCHETYPE.graduate, ['Participatory Budgeting', 'School Console Policy'], 360, 120),
  generatePerson('kimani-ndungu', 'Kimani Ndungu', 'Solar Technician', 'builder', 'solar-commons-initiative', 'Turkana, Kenya', '2023', BIOS['kimani-ndungu'], SKILLS_BY_ARCHETYPE.builder, ['Clinic Solar', 'School Console Power'], 420, 480),
  generatePerson('nyambura-waithaka', 'Nyambura Waithaka', 'Clinical Officer', 'researcher', 'independent', 'Nyandarua, Kenya', '2021', BIOS['nyambura-waithaka'], SKILLS_BY_ARCHETYPE.researcher, ['Triage App', 'School Console Health Module'], 500, 200),
  generatePerson('otieno-odhiambo', 'Otieno Odhiambo', 'Animation Director', 'catalyst', 'mwea-animation-studio', 'Nairobi, Kenya', '2022', BIOS['otieno-odhiambo'], SKILLS_BY_ARCHETYPE.catalyst, ['MWEA Studio', 'School Console Visuals'], 180, 420),
  generatePerson('wairimu-kamau', 'Wairimu Kamau', 'Architect', 'builder', 'cooperative-housing-trust', 'Kiambu, Kenya', '2020', BIOS['wairimu-kamau'], SKILLS_BY_ARCHETYPE.builder, ['Incremental Housing', 'School Console Spaces'], 320, 400),
  generatePerson('mwangi-githinji', 'Mwangi Githinji', 'PhD Researcher', 'researcher', 'dev2027ke', 'Nairobi, Kenya', '2024', BIOS['mwangi-githinji'], SKILLS_BY_ARCHETYPE.researcher, ['Digital Public Infra', 'School Console Metrics'], 460, 300),
  generatePerson('acheampong-kwame', 'Kwame Acheampong', 'Mobile Developer', 'builder', 'independent', 'Kumasi, Ghana', '2023', BIOS['acheampong-kwame'], SKILLS_BY_ARCHETYPE.builder, ['Cocoa Coop Apps', 'School Console Offline'], 580, 380),
];

// Generate additional 40 people to reach 50
const ADDITIONAL_NAMES = [
  ['Aisha', 'Mohamed'], ['Brian', 'Ochieng'], ['Carol', 'Wanjiku'], ['David', 'Kiprotich'],
  ['Esther', 'Njeri'], ['Francis', 'Mutua'], ['Grace', 'Akinyi'], ['Henry', 'Wekesa'],
  ['Irene', 'Chebet'], ['James', 'Mwenda'], ['Khadija', 'Hassan'], ['Leonard', 'Korir'],
  ['Mary', 'Wangari'], ['Nathan', 'Barasa'], ['Olivia', 'Jepkosgei'], ['Peter', 'Onyango'],
  ['Queen', 'Nabwire'], ['Robert', 'Kibet'], ['Sarah', 'Atieno'], ['Thomas', 'Cheruiyot'],
  ['Ursula', 'Wambui'], ['Victor', 'Kimutai'], ['Winnie', 'Nyokabi'], ['Xavier', 'Rotich'],
  ['Yvonne', 'Kerubo'], ['Zachary', 'Kipchoge'], ['Amina', 'Abdullahi'], ['Boniface', 'Munyao'],
  ['Cynthia', 'Moraa'], ['Daniel', 'Kosgei'], ['Eunice', 'Jelagat'], ['Felix', 'Omondi'],
  ['Gladys', 'Chepngeno'], ['Hassan', 'Mohamed'], ['Ivy', 'Wangeci'], ['John', 'Kiprop'],
  ['Kellen', 'Jepchumba'], ['Louis', 'Mutiso'], ['Martha', 'Wairimu'], ['Nelson', 'Kibet'],
];

const ADDITIONAL_ROLES = [
  'Frontend Developer', 'Backend Developer', 'DevOps Engineer', 'UI/UX Designer',
  'Data Analyst', 'Product Manager', 'Community Manager', 'Technical Writer',
  'QA Engineer', 'Security Researcher', 'Hardware Engineer', 'Embedded Systems',
  'Mobile Developer', 'Full Stack Developer', 'Site Reliability Engineer',
];

const ADDITIONAL_INSTITUTIONS: InstitutionId[] = [
  'dev2027ke', 'dev2027ke', 'dev2027ke', 'dev2027ke',
  'mwea-animation-studio', 'mwea-animation-studio',
  'cooperative-housing-trust', 'cooperative-housing-trust',
  'solar-commons-initiative', 'solar-commons-initiative',
  'independent', 'independent', 'independent', 'independent',
];

const ADDITIONAL_ARCHETYPES: Archetype[] = [
  'dropout', 'builder', 'socializer', 'graduate',
  'researcher', 'steward', 'catalyst', 'dropout',
  'builder', 'socializer', 'graduate', 'researcher',
  'steward', 'catalyst', 'dropout', 'builder',
];

const ADDITIONAL_LOCATIONS = [
  'Nairobi, Kenya', 'Nairobi, Kenya', 'Nairobi, Kenya', 'Nairobi, Kenya',
  'Nairobi, Kenya', 'Nairobi, Kenya',
  'Berlin, Germany', 'Berlin, Germany',
  'Oaxaca, Mexico', 'Oaxaca, Mexico',
  'Remote', 'Remote', 'Remote', 'Remote',
  'Kampala, Uganda', 'Kigali, Rwanda',
];

for (let i = 0; i < 40; i++) {
  const [first, last] = ADDITIONAL_NAMES[i];
  const id = `${first.toLowerCase()}-${last.toLowerCase()}`;
  const archetype = ADDITIONAL_ARCHETYPES[i % ADDITIONAL_ARCHETYPES.length];
  const institution = ADDITIONAL_INSTITUTIONS[i % ADDITIONAL_INSTITUTIONS.length];
  const role = ADDITIONAL_ROLES[i % ADDITIONAL_ROLES.length];
  const location = ADDITIONAL_LOCATIONS[i % ADDITIONAL_LOCATIONS.length];
  const since = String(2020 + (i % 5));
  const bio = `${first} ${last} brings ${role.toLowerCase()} experience to the network. Active in ${institution.replace(/-/g, ' ')} since ${since}.`;
  const skills = SKILLS_BY_ARCHETYPE[archetype].slice(0, 3);
  const projects = [`Project ${i + 1}`, `Initiative ${i + 1}`];
  const x = 100 + Math.random() * 700;
  const y = 100 + Math.random() * 500;

  MOCK_PEOPLE.push(generatePerson(id, `${first} ${last}`, role, archetype, institution, location, since, bio, skills, projects, x, y));
}

export function getInstitutionName(id: InstitutionId): string {
  return INSTITUTIONS.find(i => i.id === id)?.name || id;
}

export function getCommonsName(id: CommonsId): string {
  return COMMONS.find(c => c.id === id)?.name || id;
}

export function getPersonName(id: string): string {
  return MOCK_PEOPLE.find(p => p.id === id)?.name || id;
}

export function getPeopleByInstitution(institution: InstitutionId): PersonNode[] {
  return MOCK_PEOPLE.filter(p => p.institution === institution);
}

export function getPeopleByArchetype(archetype: Archetype): PersonNode[] {
  return MOCK_PEOPLE.filter(p => p.archetype === archetype);
}

export function getAvailableForRole(people: PersonNode[], _role: CrewRole, excludeIds: string[] = []): PersonNode[] {
  return people.filter(p => !excludeIds.includes(p.id));
}