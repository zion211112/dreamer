import { fireEvent, render, screen, within } from '@testing-library/react';
import { WorkspaceShell } from '@/components/workspace-shell';
import type { Tender } from '@/lib/tender';

jest.mock('@/lib/supabase/sign-out', () => ({
  signOut: jest.fn(),
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

function selectFloor(floor: 'Basement' | 'Ground' | 'First') {
  fireEvent.keyDown(screen.getByRole('button', { name: /^Current floor:/ }), { key: 'ArrowDown' });
  fireEvent.click(screen.getByRole('menuitem', { name: new RegExp(floor) }));
}

describe('workspace shell navigation', () => {
  it('shows two Ground modules and keeps Governance locked', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);
    selectFloor('Ground');

    const navigation = screen.getByRole('navigation', { name: 'Ground floor modules' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(2);
    expect(within(navigation).getByRole('button', { name: /Asset Topology/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Work Engines/ })).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole('button', { name: /^Current floor:/ }), { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: /First.*Governance.*Verified capability required/ })).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows only the three named assets in the simplified topology graph', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);
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

  it('groups ledger, capability and sequence screens under one module', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);
    selectFloor('Ground');
    fireEvent.click(screen.getByRole('button', { name: /Work Engines/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Delivery & proof' }));

    expect(screen.getByRole('heading', { name: 'Provenance ledger' })).toBeInTheDocument();
    const sections = screen.getByRole('navigation', { name: 'Ledger and capability sections' });
    fireEvent.click(within(sections).getByRole('button', { name: 'Capability' }));
    expect(screen.getByRole('heading', { name: 'Capability record' })).toBeInTheDocument();
    fireEvent.click(within(sections).getByRole('button', { name: /Work sequence/ }));
    expect(screen.getByRole('heading', { name: 'Operating sequence' })).toBeInTheDocument();
  });

  it('distinguishes illustrative Commons records from published records', () => {
    render(<WorkspaceShell userEmail="operator@example.com" initialTenders={[tender]} />);
    selectFloor('Ground');
    fireEvent.click(screen.getByRole('button', { name: /Work Engines/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Tenders' }));

    expect(screen.getByRole('heading', { name: 'Community solar dryer' })).toBeInTheDocument();
    expect(screen.getByText('ILLUSTRATIVE SCENARIO')).toBeInTheDocument();
    expect(screen.getByText(/illustrative scenarios, clearly distinguished/i)).toBeInTheDocument();
  });

  it('opens on Basement with an editorial Radar dossier and local signal voting', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);

    expect(screen.getByRole('button', { name: 'Current floor: Basement' })).toBeInTheDocument();
    expect(screen.getByText('Radar')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Basement modules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Look closer at the friction.' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Which stories get to become infrastructure?' })).toBeInTheDocument();
    expect(screen.getByText(/Mwea story worlds/)).toBeInTheDocument();
    expect(screen.getByText(/Wallet not connected/)).toBeInTheDocument();
    expect(screen.getByText('RESTING')).toBeInTheDocument();
    expect(screen.getByText(/Curated examples · no live community feed/)).toBeInTheDocument();
    expect(screen.getByText(/No builders, active asset, or verified contribution record is linked/)).toBeInTheDocument();

    const vote = screen.getByRole('button', { name: 'Mark relevance · local only' });
    fireEvent.click(vote);
    expect(vote).toHaveAttribute('aria-pressed', 'true');
    expect(vote).toHaveTextContent('Marked relevant · local only');

    fireEvent.click(screen.getByRole('button', { name: /Education & systems/ }));
    expect(screen.getByRole('heading', { name: 'Learning & infrastructure' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What is blocking learning—and where does infrastructure fit?' })).toBeInTheDocument();
  });

  it('keeps new friction points in local session drafts without claiming Commons submission', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Surface friction' }));
    fireEvent.change(screen.getByLabelText('Friction title'), { target: { value: 'Unreliable community workshop power' } });
    fireEvent.change(screen.getByLabelText('What do people experience?'), { target: { value: 'Shared tools cannot run consistently.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save local draft' }));

    expect(screen.getByText('Unreliable community workshop power')).toBeInTheDocument();
    expect(screen.getByText('LOCAL NOTE · NOT SHARED')).toBeInTheDocument();
    expect(screen.getByText(/Only visible in this session/)).toBeInTheDocument();
  });

  it('saves an adaptation as a local-only session draft', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Add a local perspective' }));
    fireEvent.change(screen.getByLabelText('Friction title'), { target: { value: 'Mwea workshop access' } });
    fireEvent.change(screen.getByLabelText('What do people experience?'), { target: { value: 'Tools are unavailable after class.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save local draft' }));

    expect(screen.getByText('Mwea workshop access')).toBeInTheDocument();
    expect(screen.getByText('A perspective on “Which stories get to become infrastructure?”')).toBeInTheDocument();
  });
});
