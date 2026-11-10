/**
 * Workbench — APT-LABS
 *
 * Five pilot lanes that stewards can work through today, plus an open slot
 * for the next pilot. The registry is intentionally open: register a pilot
 * here and it appears across the workbench without touching any page or the
 * router.
 *
 * Position: sovereign work coordination. Published, fair rates in KES; work
 * that stays in the community; local stewardship, not extractive labor. Built
 * to out-remotask Remotasks and the closed city workbenches by keeping terms
 * transparent, local, and owned by the people doing the work.
 *
 * Browser-local, illustrative data — one source per pilot.
 */

export type PilotKey =
  | 'benbenos'
  | 'kemetos'
  | 'minihydro'
  | 'mwea-animation-box'
  | 'open';

export interface Pilot {
  key: PilotKey;
  label: string;
  href: string;
  summary: string;
  action: string;
  location: string;
  terms: string;
  character: string;
}

/**
 * The five pilot lanes that ship inside the Workbench module. The registry is
 * intentionally open: additional pilots can be registered here without
 * changing any page or the router. No lane is a simulation — each is an
 * action surface where a steward can claim, track, and deliver real work.
 */
export const PILOTS: readonly Pilot[] = [
  {
    key: 'benbenos',
    label: 'Benbenos',
    href: '/workspace/workbench/benbenos',
    summary: 'School console and learning operations. Module upkeep, console stewardship, and learner records.',
    action: 'Open Benbenos lane',
    location: 'Nairobi',
    terms: 'Published rates in KES. Steward-owned; work stays with the local school.',
    character: 'Learning operations',
  },
  {
    key: 'kemetos',
    label: 'Kemetos',
    href: '/workspace/workbench/kemetos',
    summary: 'Electrical and solar wiring work. Fault finding, residential and commercial wiring, basic solar installation.',
    action: 'Open Kemetos lane',
    location: 'Nairobi',
    terms: 'Published rates in KES. Certified electricians set their own day rate.',
    character: 'Electrical and solar',
  },
  {
    key: 'minihydro',
    label: 'Mini Hydro',
    href: '/workspace/workbench/minihydro',
    summary: 'Micro-hydro power operations. Canal lining, turbine tending, and grid connection for off-grid villages.',
    action: 'Open Mini Hydro lane',
    location: 'Thiba',
    terms: 'Published rates in KES. Community-owned power; crews are paid per trip and per task.',
    character: 'Micro-hydro power',
  },
  {
    key: 'mwea-animation-box',
    label: 'Mwea Animation Box',
    href: '/workspace/workbench/mwea-animation-box',
    summary: 'Mwea irrigation and animation operations. Irrigation box operation and local animation content.',
    action: 'Open Mwea Animation Box lane',
    location: 'Mwea',
    terms: 'Published rates in KES. Local operators run the box; animation value stays in Mwea.',
    character: 'Irrigation and animation',
  },
  {
    key: 'open',
    label: 'Open pilot',
    href: '/workspace/workbench/open',
    summary: 'Reserved for the next pilot. Register it here to add a new lane to the workbench.',
    action: 'Register next pilot',
    location: '—',
    terms: 'Terms set when the pilot is registered.',
    character: 'Open',
  },
];

export function pilotByKey(key: string): Pilot | undefined {
  return PILOTS.find((p) => p.key === key);
}

export function pilotByHref(href: string): Pilot | undefined {
  return PILOTS.find((p) => p.href === href);
}

/* ------------------------------------------------------------------ */
/* Work items — browser-local, illustrative, one source per pilot     */
/* ------------------------------------------------------------------ */

export type WorkItem = {
  id: string;
  pilot: PilotKey;
  title: string;
  discipline: string;
  value: string;
  location: string;
  status: 'open' | 'claimed' | 'in-progress' | 'delivered' | 'accepted';
  claimable: boolean;
};

export const WORK_ITEMS: readonly WorkItem[] = [
  // Benbenos
  {
    id: 'wi-01',
    pilot: 'benbenos',
    title: 'Benbenos console upkeep',
    discipline: 'Learning operations',
    value: 'KES 6,000',
    location: 'Nairobi',
    status: 'open',
    claimable: true,
  },
  {
    id: 'wi-02',
    pilot: 'benbenos',
    title: 'Learner record audit',
    discipline: 'Records',
    value: 'KES 4,000',
    location: 'Nairobi',
    status: 'claimed',
    claimable: false,
  },
  // Kemetos
  {
    id: 'wi-03',
    pilot: 'kemetos',
    title: 'Kemetos AGI1 wiring',
    discipline: 'Electrical',
    value: 'KES 12,000',
    location: 'Nairobi',
    status: 'open',
    claimable: true,
  },
  {
    id: 'wi-04',
    pilot: 'kemetos',
    title: 'Solar basic installation',
    discipline: 'Solar',
    value: 'KES 18,000',
    location: 'Nairobi',
    status: 'open',
    claimable: true,
  },
  // Mini Hydro
  {
    id: 'wi-05',
    pilot: 'minihydro',
    title: 'Thiba canal lining',
    discipline: 'Masonry',
    value: 'KES 48,000',
    location: 'Thiba',
    status: 'in-progress',
    claimable: false,
  },
  {
    id: 'wi-06',
    pilot: 'minihydro',
    title: 'Turbine tending',
    discipline: 'Hydro operations',
    value: 'KES 22,000',
    location: 'Thiba',
    status: 'open',
    claimable: true,
  },
  // Mwea Animation Box
  {
    id: 'wi-07',
    pilot: 'mwea-animation-box',
    title: 'Mwea irrigation box operation',
    discipline: 'Irrigation',
    value: 'KES 9,500',
    location: 'Mwea',
    status: 'open',
    claimable: true,
  },
  {
    id: 'wi-08',
    pilot: 'mwea-animation-box',
    title: 'Local animation content',
    discipline: 'Animation',
    value: 'KES 15,000',
    location: 'Mwea',
    status: 'delivered',
    claimable: false,
  },
];

export function workItemsForPilot(pilot: PilotKey): readonly WorkItem[] {
  return WORK_ITEMS.filter((w) => w.pilot === pilot);
}
