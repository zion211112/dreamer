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
  it('shows four modules on the ground floor and leaves other floors unconfigured', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);
    selectFloor('Ground');

    const navigation = screen.getByRole('navigation', { name: 'Workspace modules' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(4);
    expect(within(navigation).getByRole('button', { name: /Asset Topology/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Problem/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Ledger \/ Capability/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Commons/ })).toBeInTheDocument();

    selectFloor('First');
    expect(screen.getByText('This floor is not configured yet.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Workspace modules' })).not.toBeInTheDocument();

    selectFloor('Ground');
    expect(screen.getByRole('navigation', { name: 'Workspace modules' })).toBeInTheDocument();
  });

  it('groups ledger, capability and sequence screens under one module', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);
    selectFloor('Ground');
    fireEvent.click(screen.getByRole('button', { name: /Ledger \/ Capability/ }));

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
    fireEvent.click(screen.getByRole('button', { name: /Commons/ }));

    expect(screen.getByRole('heading', { name: 'Community solar dryer' })).toBeInTheDocument();
    expect(screen.getByText('ILLUSTRATIVE SCENARIO')).toBeInTheDocument();
    expect(screen.getByText(/illustrative scenarios, clearly distinguished/i)).toBeInTheDocument();
  });

  it('opens on Basement with three friction signals and updates the inspector', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);

    expect(screen.getByRole('button', { name: 'Current floor: Basement' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Friction' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('heading', { name: 'Problems worth solving together.' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skill without trusted proof/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: 'Skill without trusted proof' })).toBeInTheDocument();
    expect(screen.getByText('No linked roster')).toBeInTheDocument();
    expect(screen.getByText('No linked assets')).toBeInTheDocument();
    expect(screen.getByText('No verified records linked')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Useful equipment left idle/ }));
    expect(screen.getByRole('heading', { name: 'Useful equipment left idle' })).toBeInTheDocument();
    expect(screen.getByText(/actual condition and access rules need to be confirmed locally/i)).toBeInTheDocument();
  });

  it('keeps new friction points in local session drafts without claiming Commons submission', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Add friction' }));
    fireEvent.change(screen.getByLabelText('Friction title'), { target: { value: 'Unreliable community workshop power' } });
    fireEvent.change(screen.getByLabelText('What do people experience?'), { target: { value: 'Shared tools cannot run consistently.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save local draft' }));

    expect(screen.getByRole('region', { name: 'Local friction drafts' })).toHaveTextContent('Unreliable community workshop power');
    expect(screen.getByRole('heading', { name: 'Unreliable community workshop power' })).toBeInTheDocument();
    expect(screen.getByText('LOCAL ONLY')).toBeInTheDocument();
    expect(screen.getByText('Commons review, endorsement and voting are not connected.')).toBeInTheDocument();
  });

  it('saves an adaptation as a local-only session draft', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);

    fireEvent.click(screen.getByRole('button', { name: 'Adapt locally' }));
    fireEvent.change(screen.getByLabelText('Friction title'), { target: { value: 'Mwea workshop access' } });
    fireEvent.change(screen.getByLabelText('What do people experience?'), { target: { value: 'Tools are unavailable after class.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save local draft' }));

    expect(screen.getByRole('region', { name: 'Local friction drafts' })).toHaveTextContent('Mwea workshop access');
    expect(screen.getByRole('heading', { name: 'Mwea workshop access' })).toBeInTheDocument();
    expect(screen.getByText('This local adaptation has not been assessed or connected to a coordinated project.')).toBeInTheDocument();
  });
});
