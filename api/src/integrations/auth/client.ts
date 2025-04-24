// This file configures the Supabase client with proper environment handling
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../../config/env.js';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
            flowType: 'pkce'
        }
    }
);