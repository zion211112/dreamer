import { validateCatalog, type Tender, type TenderCatalog } from './tender';

const consoleTenderId = 'tender-console';

export const tenderCatalog: TenderCatalog = {
  tenders: [
    {
      id: consoleTenderId,
      slug: 'school-console',
      assetName: 'School Console',
      summary: 'A local-first toolkit for the week teachers actually have.',
      description:
        'Build lessons, mark typed assessments with a transparent rule scheme, and keep school routines on one device. The Console is both a product Tender and a usable product surface; it does not process fees or send messages.',
      category: 'software',
      location: 'Nairobi, Kenya',
      issuer: 'APT-LABS',
      currency: 'KES',
      importQuoteMinor: 4_800_000,
      localBomMinor: 2_400_000,
      fundingTargetMinor: 2_400_000,
      status: 'open',
      isIllustrative: true,
      crew: [
        { id: 'crew-console-anchor', displayName: 'Nia K.', role: 'anchor', organization: 'APT-LABS' },
        { id: 'crew-console-builder', displayName: 'Sam O.', role: 'builder', organization: 'APT-LABS' },
        { id: 'crew-console-apprentice', displayName: 'Ayo M.', role: 'apprentice', organization: 'APT-LABS' },
      ],
      blueprint: {
        id: 'blueprint-console-v1',
        version: 1,
        currency: 'KES',
        hash: 'demo:console-blueprint-v1',
        lines: [
          { id: 'console-1', item: 'Offline assessment and reporting core', quantity: 1, unit: 'build', unitCostMinor: 1_000_000 },
          { id: 'console-2', item: 'School workflow design and testing', quantity: 1, unit: 'build', unitCostMinor: 800_000 },
          { id: 'console-3', item: 'Teacher onboarding materials', quantity: 1, unit: 'set', unitCostMinor: 600_000 },
        ],
      },
      funders: [
        { id: 'console-example-allocation', funder: 'Illustrative early interest', amountMinor: 720_000, currency: 'KES', basis: 'illustrative' },
      ],
    },
    {
      id: 'tender-solar-cooker',
      slug: 'school-solar-cookers',
      assetName: 'Solar kitchen kit',
      summary: 'Cut the wood bill. Keep lunch cooking when fuel prices move.',
      description:
        'A school kitchen needs a dependable way to prepare meals without relying on imported hardware or a volatile firewood budget. The proposed kit is designed around locally serviceable parts and a repairable frame.',
      category: 'energy',
      location: 'Machakos County, Kenya',
      issuer: 'Mwangaza Learning Centre (demo)',
      currency: 'KES',
      importQuoteMinor: 1_680_000,
      localBomMinor: 1_050_000,
      fundingTargetMinor: 1_050_000,
      status: 'open',
      isIllustrative: true,
      crew: [
        { id: 'crew-solar-anchor', displayName: 'Wanjiku N.', role: 'anchor', organization: 'Mwangaza Learning Centre (demo)' },
        { id: 'crew-solar-builder', displayName: 'Baraka M.', role: 'builder', organization: 'Mwangaza Works (demo)' },
        { id: 'crew-solar-apprentice', displayName: 'Taji K.', role: 'apprentice', organization: 'Mwangaza Works (demo)' },
      ],
      blueprint: {
        id: 'blueprint-solar-v1',
        version: 1,
        currency: 'KES',
        hash: 'demo:solar-blueprint-v1',
        lines: [
          { id: 'solar-1', item: 'Insulated solar cooker assembly', quantity: 2, unit: 'unit', unitCostMinor: 310_000 },
          { id: 'solar-2', item: 'Serviceable steel frame', quantity: 2, unit: 'unit', unitCostMinor: 145_000 },
          { id: 'solar-3', item: 'Local fabrication and safety test', quantity: 1, unit: 'lot', unitCostMinor: 140_000 },
        ],
      },
      funders: [
        { id: 'solar-example-allocation', funder: 'Illustrative community interest', amountMinor: 315_000, currency: 'KES', basis: 'illustrative' },
      ],
    },
    {
      id: 'tender-community-radio',
      slug: 'community-radio-studio',
      assetName: 'Community radio studio',
      summary: 'A repairable voice booth for local news, learning and stories.',
      description:
        'A compact recording booth and shared audio kit for a community learning hub. The bill favors components that local builders can replace and maintain instead of a sealed imported system.',
      category: 'media',
      location: 'Kisumu County, Kenya',
      issuer: 'Lakeview Learning Hub (demo)',
      currency: 'KES',
      importQuoteMinor: 2_300_000,
      localBomMinor: 1_460_000,
      fundingTargetMinor: 1_460_000,
      status: 'open',
      isIllustrative: true,
      crew: [
        { id: 'crew-radio-anchor', displayName: 'Achieng O.', role: 'anchor', organization: 'Lakeview Learning Hub (demo)' },
        { id: 'crew-radio-builder', displayName: 'Kiptoo R.', role: 'builder', organization: 'Lake Audio Works (demo)' },
        { id: 'crew-radio-apprentice', displayName: 'Lela A.', role: 'apprentice', organization: 'Lake Audio Works (demo)' },
      ],
      blueprint: {
        id: 'blueprint-radio-v1',
        version: 1,
        currency: 'KES',
        hash: 'demo:radio-blueprint-v1',
        lines: [
          { id: 'radio-1', item: 'Modular acoustic booth panels', quantity: 1, unit: 'set', unitCostMinor: 560_000 },
          { id: 'radio-2', item: 'Open-format recording kit', quantity: 1, unit: 'set', unitCostMinor: 620_000 },
          { id: 'radio-3', item: 'Assembly, cabling and training', quantity: 1, unit: 'lot', unitCostMinor: 280_000 },
        ],
      },
      funders: [
        { id: 'radio-example-allocation', funder: 'Illustrative partner interest', amountMinor: 511_000, currency: 'KES', basis: 'illustrative' },
      ],
    },
    {
      id: 'tender-classroom-desks',
      slug: 'classroom-desks',
      assetName: 'Classroom desk set',
      summary: 'Sturdy, repairable desks made close to the school.',
      description:
        'A practical furniture build for a growing classroom. The local design uses replaceable timber surfaces and standard fasteners so repairs do not require replacing an entire desk.',
      category: 'education',
      location: 'Embu County, Kenya',
      issuer: 'Kirimiri Day School (demo)',
      currency: 'KES',
      importQuoteMinor: 960_000,
      localBomMinor: 620_000,
      fundingTargetMinor: 620_000,
      status: 'open',
      isIllustrative: true,
      crew: [
        { id: 'crew-desks-anchor', displayName: 'Mumbi K.', role: 'anchor', organization: 'Kirimiri Day School (demo)' },
        { id: 'crew-desks-builder', displayName: 'Mwangi T.', role: 'builder', organization: 'Embu Woodworks (demo)' },
        { id: 'crew-desks-apprentice', displayName: 'Njeri W.', role: 'apprentice', organization: 'Embu Woodworks (demo)' },
      ],
      blueprint: {
        id: 'blueprint-desks-v1',
        version: 1,
        currency: 'KES',
        hash: 'demo:desks-blueprint-v1',
        lines: [
          { id: 'desks-1', item: 'Repairable desk frames', quantity: 20, unit: 'frame', unitCostMinor: 18_000 },
          { id: 'desks-2', item: 'Locally sourced timber tops', quantity: 20, unit: 'top', unitCostMinor: 9_000 },
          { id: 'desks-3', item: 'Fabrication and finish', quantity: 1, unit: 'lot', unitCostMinor: 80_000 },
        ],
      },
      funders: [],
    },
    {
      id: 'tender-water-pump',
      slug: 'community-water-pump',
      assetName: 'Community water pump',
      summary: 'A locally serviceable pump kit for a shared growing plot.',
      description:
        'A small irrigation build designed for a community growing plot. The proposed kit prioritizes components available from regional suppliers and includes local installation and maintenance training.',
      category: 'agriculture',
      location: 'Kitui County, Kenya',
      issuer: 'Kavuli Growers Cooperative (demo)',
      currency: 'KES',
      importQuoteMinor: 1_340_000,
      localBomMinor: 890_000,
      fundingTargetMinor: 890_000,
      status: 'open',
      isIllustrative: true,
      crew: [
        { id: 'crew-pump-anchor', displayName: 'Mutiso P.', role: 'anchor', organization: 'Kavuli Growers Cooperative (demo)' },
        { id: 'crew-pump-builder', displayName: 'Kendi R.', role: 'builder', organization: 'Kitui Water Works (demo)' },
        { id: 'crew-pump-apprentice', displayName: 'Mumo S.', role: 'apprentice', organization: 'Kitui Water Works (demo)' },
      ],
      blueprint: {
        id: 'blueprint-pump-v1',
        version: 1,
        currency: 'KES',
        hash: 'demo:pump-blueprint-v1',
        lines: [
          { id: 'pump-1', item: 'Solar-ready water pump', quantity: 1, unit: 'unit', unitCostMinor: 410_000 },
          { id: 'pump-2', item: 'Locally available pipe and fittings', quantity: 1, unit: 'lot', unitCostMinor: 240_000 },
          { id: 'pump-3', item: 'Installation and grower training', quantity: 1, unit: 'lot', unitCostMinor: 240_000 },
        ],
      },
      funders: [],
    },
  ],
  roll: [],
};

validateCatalog(tenderCatalog);

export const tenders: Tender[] = tenderCatalog.tenders;

export function getTenderBySlug(slug: string): Tender | undefined {
  return tenders.find(tender => tender.slug === slug);
}

export function formatMoney(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export const categoryLabels: Record<Tender['category'], string> = {
  education: 'Education',
  energy: 'Energy',
  media: 'Media & story',
  agriculture: 'Agriculture',
  infrastructure: 'Infrastructure',
  software: 'Software',
};
