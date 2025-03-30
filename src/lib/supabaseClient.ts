import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbhpprzcwearsppfwwon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaHBwcnpjd2VhcnNwcGZ3d29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzYwMDYsImV4cCI6MjA1ODcxMjAwNn0.3m8NZB91ZPJns48VGLOBU6dTfqeUTi9ok-MX9VUoLfE';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: import.meta.env.DEV
  }
});
