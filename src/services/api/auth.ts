import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase client:', {
  url: supabaseUrl,
  keyLength: supabaseKey?.length || 0
});

// Initialize the Supabase client with environment variables
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit',
      debug: true, // Enable debug logging
      storage: window.localStorage, // Explicitly set storage
      storageKey: 'verby-auth-token' // Custom storage key
    }
  }
);

// Set up auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, {
    userId: session?.user?.id,
    hasSession: !!session
  });
});

// Log initial auth state
supabase.auth.getSession().then(({ data: { session } }) => {
  console.log('Initial auth state:', {
    hasSession: !!session,
    userId: session?.user?.id
  });
});
