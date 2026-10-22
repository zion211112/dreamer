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

describe('workspace shell navigation', () => {
  it('shows four modules on the ground floor and leaves other floors unconfigured', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);

    const navigation = screen.getByRole('navigation', { name: 'Workspace modules' });
    expect(within(navigation).getAllByRole('button')).toHaveLength(4);
    expect(within(navigation).getByRole('button', { name: /Asset Topology/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Problem/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Ledger \/ Capability/ })).toBeInTheDocument();
    expect(within(navigation).getByRole('button', { name: /Commons/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /First/ }));
    expect(screen.getByText('This floor is not configured yet.')).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Workspace modules' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Ground/ }));
    expect(screen.getByRole('navigation', { name: 'Workspace modules' })).toBeInTheDocument();
  });

  it('groups ledger, capability and sequence screens under one module', () => {
    render(<WorkspaceShell userEmail="operator@example.com" />);
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
    fireEvent.click(screen.getByRole('button', { name: /Commons/ }));

    expect(screen.getByRole('heading', { name: 'Community solar dryer' })).toBeInTheDocument();
    expect(screen.getByText('ILLUSTRATIVE SCENARIO')).toBeInTheDocument();
    expect(screen.getByText(/illustrative scenarios, clearly distinguished/i)).toBeInTheDocument();
  });
});
