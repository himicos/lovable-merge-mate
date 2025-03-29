
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbhpprzcwearsppfwwon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaHBwcnpjd2VhcnNwcGZ3d29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTEwNDQ5ODQsImV4cCI6MjAyNjYyMDk4NH0.IaOJdGxnsTW-8l5WpXVkXL-ZEKpUt7mlqhsjucsAovw';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: process.env.NODE_ENV !== 'production'
  }
});
