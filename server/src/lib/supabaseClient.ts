import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: undefined, // Server-side doesn't need storage
        flowType: 'pkce',
        debug: process.env.NODE_ENV === 'development'
      }
    }
);
