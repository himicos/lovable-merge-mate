
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gbhpprzcwearsppfwwon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiaHBwcnpjd2VhcnNwcGZ3d29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzYwMDYsImV4cCI6MjA1ODcxMjAwNn0.3m8NZB91ZPJns48VGLOBU6dTfqeUTi9ok-MX9VUoLfE';

// Get the current site URL
const siteUrl = window.location.origin;
console.log("Current site URL for auth redirects:", siteUrl);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    flowType: 'pkce',
    debug: process.env.NODE_ENV !== 'production',
    // Set the callback URL in separate options now
    cookieOptions: {
      // Use the current origin as the site URL to ensure redirects work correctly
      redirect_to: `${siteUrl}/auth/callback`
    }
  }
});
