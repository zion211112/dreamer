import { fireEvent, render, screen, within } from '@testing-library/react';
import { UserProfileMenu } from '@/components/user-profile-menu';
import type { UserProfileData } from '@/lib/user-profile';

jest.mock('@/lib/supabase/sign-out', () => ({
  signOut: jest.fn(),
}));

const profileData: UserProfileData = {
  authenticated: true,
  displayName: 'Amina Mwangi',
  profileError: null,
  roll: {
    deployedAssetCount: 1,
    capabilityBadgeCount: 1,
    rank: 'Tier 1',
    badges: [{
      id: '11111111-1111-4111-8111-111111111111',
      roll_record_id: '22222222-2222-4222-8222-222222222222',
      role: 'builder',
      issued_at: '2026-10-20T12:00:00.000Z',
    }],
    error: null,
  },
  capitalIntents: {
    records: [{
      id: '33333333-3333-4333-8333-333333333333',
      tender_id: '44444444-4444-4444-8444-444444444444',
      amount_minor: 120000,
      currency: 'KES',
      status: 'SETTLED_OFFLINE',
      created_at: '2026-10-21T12:00:00.000Z',
    }],
    error: null,
  },
};

function openProfileMenu(name: string) {
  fireEvent.click(screen.getByRole('button', { name }));
}

describe('user profile menu', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('toggles profile sections in place and separates verified Roll proof from claims', () => {
    render(<UserProfileMenu userEmail="amina@example.com" profileData={profileData} />);
    openProfileMenu('Open profile menu for Amina Mwangi');

    const menu = screen.getByRole('dialog', { name: 'User profile' });
    expect(within(menu).getAllByText('Tier 1').length).toBeGreaterThan(0);
    expect(within(menu).getAllByText('01', { exact: true })).toHaveLength(2);
    fireEvent.click(within(menu).getByRole('button', { name: /Capability & interests/ }));
    expect(within(menu).getByLabelText(/Capabilities/)).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole('button', { name: 'Wallet & banks' }));
    expect(within(menu).getByText(/Settled offline/)).toBeInTheDocument();
    expect(within(menu).getByText(/not a bank balance or withdrawable funds/i)).toBeInTheDocument();
    expect(within(menu).getByText(/not blockchain SBTs/i)).toBeInTheDocument();

    fireEvent.click(within(menu).getByRole('button', { name: /Activity/ }));
    expect(within(menu).getByText('Builder capability badge')).toBeInTheDocument();
    expect(within(menu).getByText('Capital intent · Settled offline')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open profile menu for Amina Mwangi' })).toBeInTheDocument();
  });

  it('saves editable profile fields only in session storage and restores them after remount', () => {
    const { unmount } = render(<UserProfileMenu userEmail="amina@example.com" profileData={profileData} />);
    openProfileMenu('Open profile menu for Amina Mwangi');
    const menu = screen.getByRole('dialog', { name: 'User profile' });
    fireEvent.click(within(menu).getByRole('button', { name: /Capability & interests/ }));
    fireEvent.change(within(menu).getByLabelText('Display name'), { target: { value: 'Amina M.' } });
    fireEvent.change(within(menu).getByLabelText(/Capabilities/), { target: { value: 'Illustration, Field research' } });

    const saved = window.sessionStorage.getItem('aptlabs:profile:v1:amina@example.com');
    expect(saved).toContain('"displayName":"Amina M."');
    expect(saved).toContain('"capabilities":["Illustration","Field research"]');
    unmount();

    render(<UserProfileMenu userEmail="amina@example.com" profileData={profileData} />);
    expect(screen.getByRole('button', { name: 'Open profile menu for Amina M.' })).toBeInTheDocument();
    openProfileMenu('Open profile menu for Amina M.');
    const restoredMenu = screen.getByRole('dialog', { name: 'User profile' });
    fireEvent.click(within(restoredMenu).getByRole('button', { name: /Capability & interests/ }));
    expect(within(restoredMenu).getByLabelText('Display name')).toHaveValue('Amina M.');
    expect(within(restoredMenu).getByLabelText(/Capabilities/)).toHaveValue('Illustration, Field research');
  });

  it('offers an explicit reset when session profile data is malformed', () => {
    window.sessionStorage.setItem('aptlabs:profile:v1:amina@example.com', '{broken');
    render(<UserProfileMenu userEmail="amina@example.com" profileData={profileData} />);
    openProfileMenu('Open profile menu for Amina Mwangi');
    const menu = screen.getByRole('dialog', { name: 'User profile' });
    fireEvent.click(within(menu).getByRole('button', { name: 'Settings' }));

    expect(within(menu).getByRole('alert')).toHaveTextContent('Session profile data could not be read or saved.');
    fireEvent.click(within(menu).getByRole('button', { name: 'Clear session profile' }));
    expect(window.sessionStorage.getItem('aptlabs:profile:v1:amina@example.com')).toBeNull();
  });
});
