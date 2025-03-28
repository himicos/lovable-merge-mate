import { supabase } from './supabaseClient';

export interface GmailConnection {
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  email: string | null;
}

export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
export const GMAIL_REDIRECT_URI = `http://localhost:8080/auth/callback`;

export async function initiateGmailAuth() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: GMAIL_REDIRECT_URI,
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    state: user.id, // Pass the user ID as state for security
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function checkGmailConnection(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: connection, error } = await supabase
    .from('gmail_connections')
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (error || !connection) return false;
  return true;
}

export async function disconnectGmail(): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('gmail_connections')
    .delete()
    .eq('user_id', user.id);

  if (error) throw error;
}

// Example function to fetch unread emails
export async function fetchUnreadEmails() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const response = await fetch('/api/gmail/unread', {
    headers: {
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
    }
  });

  if (!response.ok) throw new Error('Failed to fetch unread emails');
  return response.json();
}
