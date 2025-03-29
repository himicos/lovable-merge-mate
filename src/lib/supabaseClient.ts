
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gbhpprzcwearsppfwwon.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaHBwcnpjd2VhcnNwcGZ3d29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzYwMDYsImV4cCI6MjA1ODcxMjAwNn0.3m8NZB91ZPJns48VGLOBU6dTfqeUTi9ok-MX9VUoLfE';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables');
}

// Get the current site URL
const siteUrl = window.location.origin;
console.log("Current site URL:", siteUrl);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      debug: true, // Enable debug logs
      storage: localStorage,
      storageKey: 'emailgenius-auth-token'
    }
  }
);

