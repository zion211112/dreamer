jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
  hasSupabaseConfiguration: jest.fn(),
}));

import { createSupabaseServerClient, hasSupabaseConfiguration } from '@/lib/supabase/server';
import { getAuthenticatedUserProfileData } from '@/lib/user-profile';

const userId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

function makeQuery(result: { data: unknown; error: { message: string } | null }) {
  const query = {} as {
    select: jest.Mock;
    eq: jest.Mock;
    maybeSingle: jest.Mock;
    order: jest.Mock;
    limit: jest.Mock;
    then: jest.Mock;
  };
  query.select = jest.fn(() => query);
  query.eq = jest.fn(() => query);
  query.maybeSingle = jest.fn(() => Promise.resolve(result));
  query.order = jest.fn(() => query);
  query.limit = jest.fn(() => query);
  query.then = jest.fn((resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve));
  return query;
}

describe('authenticated profile data loader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(hasSupabaseConfiguration).mockReturnValue(true);
  });

  it('loads only the authenticated user’s Roll and capital records and derives Roll rank', async () => {
    const badges = [
      { id: '11111111-1111-4111-8111-111111111111', roll_record_id: '22222222-2222-4222-8222-222222222222', role: 'builder', issued_at: '2026-10-20T12:00:00.000Z' },
      { id: '33333333-3333-4333-8333-333333333333', roll_record_id: '22222222-2222-4222-8222-222222222222', role: 'apprentice', issued_at: '2026-10-21T12:00:00.000Z' },
      { id: '44444444-4444-4444-8444-444444444444', roll_record_id: '55555555-5555-4555-8555-555555555555', role: 'anchor', issued_at: '2026-10-22T12:00:00.000Z' },
    ];
    const profileQuery = makeQuery({ data: { display_name: 'Amina' }, error: null });
    const badgeQuery = makeQuery({ data: badges, error: null });
    const capitalQuery = makeQuery({ data: [], error: null });
    const supabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) },
      from: jest.fn((table: string) => ({
        commons_profiles: profileQuery,
        roll_capability_badges: badgeQuery,
        capital_intents: capitalQuery,
      })[table]),
    };
    jest.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never);

    const result = await getAuthenticatedUserProfileData();

    expect(result.authenticated).toBe(true);
    expect(result.displayName).toBe('Amina');
    expect(result.roll).toMatchObject({ deployedAssetCount: 2, capabilityBadgeCount: 3, rank: 'Tier 1', error: null });
    expect(result.capitalIntents).toEqual({ records: [], error: null });
    expect(profileQuery.eq).toHaveBeenCalledWith('user_id', userId);
    expect(badgeQuery.eq).toHaveBeenCalledWith('user_id', userId);
    expect(capitalQuery.eq).toHaveBeenCalledWith('user_id', userId);
  });

  it('reports unavailable capital records without replacing the successful Roll data', async () => {
    const profileQuery = makeQuery({ data: null, error: null });
    const badgeQuery = makeQuery({ data: [], error: null });
    const capitalQuery = makeQuery({ data: null, error: { message: 'read failed' } });
    const supabase = {
      auth: { getUser: jest.fn().mockResolvedValue({ data: { user: { id: userId } }, error: null }) },
      from: jest.fn((table: string) => ({
        commons_profiles: profileQuery,
        roll_capability_badges: badgeQuery,
        capital_intents: capitalQuery,
      })[table]),
    };
    jest.mocked(createSupabaseServerClient).mockResolvedValue(supabase as never);
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    const result = await getAuthenticatedUserProfileData();

    expect(result.roll).toMatchObject({ deployedAssetCount: 0, capabilityBadgeCount: 0, rank: 'New builder', error: null });
    expect(result.capitalIntents).toEqual({ records: [], error: 'Capital-intent records are unavailable.' });
    consoleError.mockRestore();
  });
});
