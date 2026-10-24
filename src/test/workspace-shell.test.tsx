import type { ComponentProps } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { WorkspaceShell } from '@/components/workspace-shell';
import type { Tender } from '@/lib/tender';
import type { WorkspaceContextOption } from '@/lib/workspace';

jest.mock('@/lib/supabase/sign-out', () => ({
  signOut: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock('@/components/workspace-switcher', () => ({
  WorkspaceSwitcher: () => null,
}));

const tender: Tender = {
  id: 'tender-1',
  slug: 'illustrative-energy-project',
  assetName: 'Community solar dryer',
  summary: 'Illustrative record for a community energy project.',
  description: 'A scenario record for workspace display.',
  category: 'energy',
  location: 'Mwea',
  issuer: 'APT-LABS',
  currency: 'KES',
  assetBuildCostMinor: 0,
  fundingTargetMinor: 0,
  currentSignaledAmountMinor: 0,
  currentSettledAmountMinor: 0,
  projectedAnnualYieldMinor: null,
  localSpendPercentage: null,
  crewWageAllocationMinor: null,
  economicModelNote: null,
  status: 'draft',
  isIllustrative: true,
  crew: [],
  blueprint: { id: 'blueprint-1', version: 1, currency: 'KES', lines: [], hash: 'hash' },
  funders: [],
};

const networkContext: WorkspaceContextOption = {
  key: 'network',
  kind: 'network',
  label: 'APT-LABS Network',
  role: 'member',
  organizationId: null,
  tenderId: null,
  tenderSlug: null,
  tenderStatus: null,
  assetName: null,
  isIllustrative: false,
};

const schoolContext: WorkspaceContextOption = {
  ...networkContext,
  key: 'school:example',
  kind: 'school',
  label: 'Example School',
  role: 'teacher',
  organizationId: 'school-example',
};

function renderWorkspace(props: Partial<ComponentProps<typeof WorkspaceShell>> = {}) {
  const { contexts = [networkContext], ...rest } = props;
  return render(<WorkspaceShell userEmail="operator@example.com" contexts={contexts} {...rest} />);
}

function openFloorBranch(branch: 'Commons' | 'Membership') {
  fireEvent.keyDown(screen.getByRole('button', { name: /^Current floor:/ }), { key: 'ArrowDown' });
  fireEvent.keyDown(screen.getByRole('menuitem', { name: new RegExp(branch) }), { key: 'ArrowRight' });
}

function selectFloor(floor: 'Basement' | 'Ground' | 'First' | 'Second') {
  const memberFloor = floor === 'First' || floor === 'Second';
  openFloorBranch(memberFloor ? 'Membership' : 'Commons');
  if (floor === 'First' || floor === 'Second') {
    fireEvent.keyDown(screen.getByRole('menuitem', { name: floor === 'First' ? /Governance/ : /^School/ }), { key: 'ArrowRight' });
  } else {
    fireEvent.keyDown(screen.getByRole('menuitem', { name: floor === 'Basement' ? /Below ground/ : /Street level/ }), { key: 'ArrowRight' });
  }
  fireEvent.click(screen.getByRole('menuitem', { name: new RegExp(floor) }));
}

function inspectAsset(title: string) {
  const card = screen.getByRole('heading', { name: title }).closest('article');
  if (!card) throw new Error(`Missing asset card for ${title}`);
  return within(card);
}

describe('workspace shell navigation', () => {
  it('shows a lock state instead of floor content when no verified network context is present', () => {
    renderWorkspace({ contexts: [] });

    expect(screen.getByRole('heading', { name: 'This floor needs a verified network context.' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Basement modules' })).not.toBeInTheDocument();

    openFloorBranch('Membership');
    fireEvent.keyDown(screen.getByRole('menuitem', { name: /^School/ }), { key: 'ArrowRight' });
    expect(screen.getByRole('menuitem', { name: /Second · School, locked: A verified school membership is required/ }))
      .toHaveAttribute('aria-disabled', 'true');
  });

  it('keeps the shared floors available and locks Governance until a verified entitlement exists', () => {
    renderWorkspace();
    selectFloor('Ground');

    const navigation = screen.getByRole('navigation', { name: 'Ground floor modules' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(2);
    expect(within(navigation).getByRole('button', { name: /Asset Topology/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Work Engines/ })).toBeInTheDocument();

    openFloorBranch('Membership');
    fireEvent.keyDown(screen.getByRole('menuitem', { name: /Governance/ }), { key: 'ArrowRight' });
    const firstFloor = screen.getByRole('menuitem', { name: /First, locked:/ });
    expect(firstFloor).toHaveAttribute('aria-disabled', 'true');
    expect(firstFloor.getAttribute('title')).toMatch(/no governance entitlement is connected/i);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Current floor: Ground' })).toBeInTheDocument();
  });

  it('does not open the School floor without a verified school membership', () => {
    renderWorkspace();
    openFloorBranch('Membership');
    fireEvent.keyDown(screen.getByRole('menuitem', { name: /^School/ }), { key: 'ArrowRight' });

    const schoolFloor = screen.getByRole('menuitem', { name: /Second · School, locked:/ });
    expect(schoolFloor).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(schoolFloor);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByRole('button', { name: 'Current floor: Basement' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /School Console/ })).not.toBeInTheDocument();
  });

  it('opens the device-local School Console only with a verified school context', async () => {
    renderWorkspace({ contexts: [networkContext, schoolContext] });
    selectFloor('Second');

    expect(screen.getByRole('status', { name: 'Traveling to Second · School' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Current floor: Second · School' })).toBeInTheDocument();
    await screen.findByText(/Ready on this device/);
    expect(screen.getByRole('heading', { name: /School Console/ })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'teacher Console tools' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(/Demo data only/i);
    expect(screen.getByRole('note')).toHaveTextContent(/not encrypted multi-user school storage/i);

    await waitFor(() => {
      expect(screen.queryByRole('status', { name: 'Traveling to Second · School' })).not.toBeInTheDocument();
    });
  });

  it('skips the lift animation when reduced motion is preferred', () => {
    const matchMediaDescriptor = Object.getOwnPropertyDescriptor(window, 'matchMedia');
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true }),
    });

    try {
      const { unmount } = renderWorkspace({ contexts: [networkContext, schoolContext] });
      selectFloor('Second');

      expect(screen.queryByRole('status', { name: 'Traveling to Second · School' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Current floor: Second · School' })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /School Console/ })).toBeInTheDocument();
      unmount();
    } finally {
      if (matchMediaDescriptor) {
        Object.defineProperty(window, 'matchMedia', matchMediaDescriptor);
      } else {
        Reflect.deleteProperty(window, 'matchMedia');
      }
    }
  });

  it('shows only the three named assets in the simplified topology graph', () => {
    renderWorkspace();
    selectFloor('Ground');

    const graph = screen.getByRole('region', { name: 'Three illustrative asset relationships' });
    expect(within(graph).getAllByRole('button')).toHaveLength(3);
    expect(within(graph).getByRole('button', { name: 'Inspect School Console' })).toBeInTheDocument();
    expect(within(graph).getByRole('button', { name: 'Inspect Mwea Animation' })).toBeInTheDocument();
    expect(within(graph).getByRole('button', { name: 'Inspect Tender System' })).toBeInTheDocument();
    expect(screen.queryByText('Field conditions')).not.toBeInTheDocument();

    fireEvent.click(within(graph).getByRole('button', { name: 'Inspect School Console' }));
    expect(screen.getByRole('heading', { name: 'School Console' })).toBeInTheDocument();
    expect(screen.getByText(/student and lesson records stay on the device/i)).toBeInTheDocument();

    fireEvent.click(within(graph).getByRole('button', { name: 'Inspect Mwea Animation' }));
    expect(screen.getByRole('heading', { name: 'Mwea Animation' })).toBeInTheDocument();
    expect(screen.getByText('Proposed')).toBeInTheDocument();
  });

  it('opens the session capability profile with the selected asset context', () => {
    renderWorkspace();
    selectFloor('Ground');
    fireEvent.click(screen.getByRole('button', { name: /Work Engines/ }));

    expect(screen.getByRole('heading', { name: 'Choose a place to contribute.' })).toBeInTheDocument();
    const assets = screen.getByRole('navigation', { name: 'Work Engine assets' });
    expect(within(assets).getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: 'School Console' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'Offer capability' })).toHaveLength(1);
    expect(screen.queryByRole('navigation', { name: 'Work Engine sections' })).not.toBeInTheDocument();

    for (const asset of ['School Console', 'Mwea Animation', 'Tender System']) {
      const assetOption = within(assets).getByRole('button', { name: `Select ${asset}` });
      fireEvent.click(assetOption);
      expect(assetOption).toHaveAttribute('aria-pressed', 'true');
      const assetCard = inspectAsset(asset);
      expect(assetCard.getByText('Interest only · no open role is connected')).toBeInTheDocument();
      fireEvent.click(assetCard.getByRole('button', { name: 'Offer capability' }));
      expect(screen.getByRole('heading', { name: 'Capability & interests' })).toBeInTheDocument();
      const profileMenu = screen.getByRole('dialog', { name: 'User profile' });
      expect(profileMenu).toHaveTextContent(asset);
      expect(profileMenu).toHaveTextContent(/does not submit an application/i);
      fireEvent.click(within(profileMenu).getByRole('button', { name: 'Profile overview' }));
      fireEvent.click(within(profileMenu).getByRole('button', { name: 'Settings' }));
      fireEvent.click(within(profileMenu).getByRole('button', { name: /Capability & interests/ }));
      fireEvent.keyDown(document, { key: 'Escape' });
    }

    expect(screen.queryByRole('dialog', { name: 'User profile' })).not.toBeInTheDocument();
  });

  it('keeps delivery and capability screens reachable from a topology asset', () => {
    renderWorkspace();
    selectFloor('Ground');
    fireEvent.click(screen.getByRole('button', { name: 'Open work sequence' }));

    expect(screen.getByRole('heading', { name: 'Operating sequence' })).toBeInTheDocument();
    const moduleSections = screen.getByRole('navigation', { name: 'Work Engine sections' });
    fireEvent.click(within(moduleSections).getByRole('button', { name: 'Delivery & proof' }));
    const sections = screen.getByRole('navigation', { name: 'Ledger and capability sections' });
    fireEvent.click(within(sections).getByRole('button', { name: 'The Roll' }));
    expect(screen.getByRole('heading', { name: 'Provenance ledger' })).toBeInTheDocument();
    fireEvent.click(within(sections).getByRole('button', { name: 'Capability' }));
    expect(screen.getByRole('heading', { name: 'Capability record' })).toBeInTheDocument();
  });

  it('distinguishes illustrative Commons records from published records', () => {
    renderWorkspace({ initialTenders: [tender] });
    selectFloor('Ground');
    fireEvent.click(screen.getByRole('button', { name: 'Open work sequence' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tenders' }));

    expect(screen.getByRole('heading', { name: 'Community solar dryer' })).toBeInTheDocument();
    expect(screen.getByText('ILLUSTRATIVE SCENARIO')).toBeInTheDocument();
    expect(screen.getByText(/illustrative scenarios, clearly distinguished/i)).toBeInTheDocument();
  });

  it('opens on Basement with a compact Radar signal and local voting', () => {
    renderWorkspace();

    expect(screen.getByRole('button', { name: 'Current floor: Basement' })).toBeInTheDocument();
    expect(screen.getByText('Radar')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Basement modules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Field signals' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Which stories get to become infrastructure?' })).toBeInTheDocument();
    expect(screen.getByText(/Mwea story worlds/)).toBeInTheDocument();
    expect(screen.queryByRole('complementary', { name: 'Personal standing and tools' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Open profile menu/ })).toBeInTheDocument();
    expect(screen.getByText(/Curated examples · no live community feed/)).toBeInTheDocument();
    expect(screen.getByText(/No builders, active asset, or verified contribution record is linked/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Open profile menu/ }));
    expect(screen.getByRole('dialog', { name: 'User profile' })).toBeInTheDocument();

    const vote = screen.getByRole('button', { name: 'Mark relevance · local only' });
    fireEvent.click(vote);
    expect(vote).toHaveAttribute('aria-pressed', 'true');
    expect(vote).toHaveTextContent('Marked relevant · local only');

    fireEvent.click(screen.getByRole('button', { name: /Education & systems/ }));
    expect(screen.getByRole('heading', { name: 'Learning & infrastructure' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What is blocking learning—and where does infrastructure fit?' })).toBeInTheDocument();
  });

  it('keeps new friction points in local session drafts without claiming Commons submission', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: 'Surface friction' }));
    fireEvent.change(screen.getByLabelText('Friction title'), { target: { value: 'Unreliable community workshop power' } });
    fireEvent.change(screen.getByLabelText('What do people experience?'), { target: { value: 'Shared tools cannot run consistently.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save local draft' }));

    expect(screen.getByText('Unreliable community workshop power')).toBeInTheDocument();
    expect(screen.getByText('LOCAL NOTE · NOT SHARED')).toBeInTheDocument();
    expect(screen.getByText(/Only visible in this session/)).toBeInTheDocument();
  });

  it('saves an adaptation as a local-only session draft', () => {
    renderWorkspace();

    fireEvent.click(screen.getByRole('button', { name: 'Add a local perspective' }));
    fireEvent.change(screen.getByLabelText('Friction title'), { target: { value: 'Mwea workshop access' } });
    fireEvent.change(screen.getByLabelText('What do people experience?'), { target: { value: 'Tools are unavailable after class.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save local draft' }));

    expect(screen.getByText('Mwea workshop access')).toBeInTheDocument();
    expect(screen.getByText('A perspective on “Which stories get to become infrastructure?”')).toBeInTheDocument();
  });
});
