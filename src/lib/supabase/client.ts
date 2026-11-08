const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isDemoMode = !supabaseUrl || !supabaseAnonKey || import.meta.env.VITE_DEMO_MODE === 'true';

// Full PostgREST query builder mock for demo mode
type QueryResult<T> = { data: T[]; error: { message: string; code?: string } | null; count: number | null };
type SingleResult<T> = { data: T | null; error: { message: string; code?: string } | null };
type StorageResult<T> = { data: T | null; error: { message: string; code?: string } | null };
type StorageListResult = { data: { name: string; metadata?: { mimetype?: string; size?: number }; updated_at?: string }[]; error: { message: string; code?: string } | null };

type MockQueryBuilder<T = any> = PromiseLike<QueryResult<T>> & {
  select: (columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated' }) => MockQueryBuilder<T>;
  eq: (column: string, value: any) => MockQueryBuilder<T>;
  in: (column: string, values: any[]) => MockQueryBuilder<T>;
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder<T>;
  range: (from: number, to: number) => MockQueryBuilder<T>;
  limit: (count: number) => MockQueryBuilder<T>;
  gte: (column: string, value: any) => MockQueryBuilder<T>;
  lte: (column: string, value: any) => MockQueryBuilder<T>;
  ilike: (column: string, pattern: string) => MockQueryBuilder<T>;
  contains: (column: string, value: any) => MockQueryBuilder<T>;
  or: (filters: string) => MockQueryBuilder<T>;
  single: () => Promise<SingleResult<T>>;
};

type MockMutationBuilder<T = any> = PromiseLike<SingleResult<T>> & {
  select: (columns?: string) => MockMutationBuilder<T>;
  eq: (column: string, value: any) => MockMutationBuilder<T>;
  single: () => Promise<SingleResult<T>>;
};

function createQueryBuilder<T>(): MockQueryBuilder<T> {
  const chain: any = {};
  
  const methods = ['select', 'eq', 'in', 'order', 'range', 'limit', 'gte', 'lte', 'ilike', 'contains', 'or'];
  methods.forEach(method => {
    chain[method] = () => chain;
  });
  
  chain.single = async () => ({ data: null, error: { message: 'Supabase not configured', code: 'PGRST301' } });
  
  chain.then = function<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: (value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ) {
    return Promise.resolve({ data: [] as T[], error: { message: 'Supabase not configured', code: 'PGRST301' }, count: null }).then(onfulfilled, onrejected);
  };
  
  return chain;
}

function createMutationBuilder<T>(): MockMutationBuilder<T> {
  const chain: any = {};
  
  const methods = ['select', 'eq'];
  methods.forEach(method => {
    chain[method] = () => chain;
  });
  
  chain.single = async () => ({ data: null, error: { message: 'Supabase not configured', code: 'PGRST301' } });
  
  chain.then = function<TResult1 = SingleResult<T>, TResult2 = never>(
    onfulfilled?: (value: SingleResult<T>) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: any) => TResult2 | PromiseLike<TResult2>
  ) {
    return Promise.resolve({ data: null, error: { message: 'Supabase not configured', code: 'PGRST301' } }).then(onfulfilled, onrejected);
  };
  
  return chain;
}

function createStorageBucket() {
  return {
    list: async (_prefix?: string): Promise<StorageListResult> => ({ data: [], error: null }),
    upload: async (_path: string, _file: any, _options?: any): Promise<StorageResult<null>> => ({ data: null, error: { message: 'Supabase not configured', code: 'STORAGE_ERROR' } }),
    download: async (_path: string): Promise<StorageResult<null>> => ({ data: null, error: { message: 'Supabase not configured', code: 'STORAGE_ERROR' } }),
    remove: async (_paths: string[]): Promise<StorageResult<null>> => ({ data: null, error: { message: 'Supabase not configured', code: 'STORAGE_ERROR' } }),
    getPublicUrl: (_path: string) => ({ data: { publicUrl: '' }, error: null }),
    createSignedUrl: async (_path: string, _expiresIn: number): Promise<StorageResult<{ signedUrl: string }>> => ({ data: { signedUrl: '' }, error: { message: 'Supabase not configured', code: 'STORAGE_ERROR' } }),
  };
}

type MockAuthUser = {
  id: string;
  email?: string;
  role?: string;
  aud?: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
};

function createMockClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: (_callback: any) => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: async (_credentials: any) => ({ data: { user: null as MockAuthUser | null }, error: { message: 'Supabase not configured', code: 'AUTH_ERROR' } }),
      signInWithPassword: async (_credentials: any) => ({ data: { user: null as MockAuthUser | null }, error: { message: 'Supabase not configured', code: 'AUTH_ERROR' } }),
      signOut: async () => ({ error: null }),
      updateUser: async (_attributes: any) => ({ data: { user: null as MockAuthUser | null }, error: { message: 'Supabase not configured', code: 'AUTH_ERROR' } }),
    },
    from: <T = any>(_table: string) => ({
      select: (_columns?: string, _options?: any) => createQueryBuilder<T>(),
      insert: (_rows: any) => createMutationBuilder<T>(),
      update: (_rows: any) => createMutationBuilder<T>(),
      delete: () => createMutationBuilder<T>(),
      upsert: (_rows: any) => createMutationBuilder<T>(),
    }),
    storage: {
      from: (_bucket: string) => createStorageBucket(),
    },
    rpc: <T = any>(_fn: string, _params: any) => Promise.resolve({ data: null as T | null, error: { message: 'Supabase not configured', code: 'RPC_ERROR' } }),
  };
}

export const supabase = isDemoMode ? createMockClient() : null as unknown as ReturnType<typeof createMockClient>;

export function getSupabase() {
  if (isDemoMode) {
    throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or set VITE_DEMO_MODE=false');
  }
  return supabase!;
}
