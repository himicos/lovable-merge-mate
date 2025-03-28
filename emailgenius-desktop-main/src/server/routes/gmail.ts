import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_SERVICE_KEY! // Use service key for admin access
);

// Initialize Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  `${process.env.VITE_APP_URL}/api/auth/gmail/callback`
);

// Gmail OAuth callback endpoint
router.get('/auth/gmail/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      throw new Error('Missing code or state');
    }

    // Get tokens from Google
    const { tokens } = await oauth2Client.getToken(code as string);
    const { access_token, refresh_token, expiry_date } = tokens;

    if (!access_token || !refresh_token || !expiry_date) {
      throw new Error('Invalid token response');
    }

    // Get user email
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { data: profile } = await gmail.users.getProfile({ userId: 'me' });

    // Store tokens in Supabase
    const { error } = await supabase
      .from('gmail_connections')
      .upsert({
        user_id: state,
        access_token,
        refresh_token,
        expires_at: new Date(expiry_date).toISOString(),
        email: profile.emailAddress,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    // Redirect to settings page with success message
    res.redirect('/settings?gmailConnected=true');
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    res.redirect('/settings?error=gmail_connection_failed');
  }
});

// Endpoint to fetch unread emails
router.get('/gmail/unread', async (req, res) => {
  try {
    // Get user ID from Supabase auth
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid auth token');

    // Get Gmail tokens
    const { data: connection, error } = await supabase
      .from('gmail_connections')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error || !connection) {
      throw new Error('Gmail not connected');
    }

    // Check if token needs refresh
    if (new Date(connection.expires_at) <= new Date()) {
      oauth2Client.setCredentials({
        refresh_token: connection.refresh_token,
      });
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Update tokens in database
      await supabase
        .from('gmail_connections')
        .update({
          access_token: credentials.access_token,
          expires_at: new Date(credentials.expiry_date!).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      oauth2Client.setCredentials(credentials);
    } else {
      oauth2Client.setCredentials({
        access_token: connection.access_token,
        refresh_token: connection.refresh_token,
      });
    }

    // Fetch unread emails
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const { data } = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10,
    });

    res.json(data);
  } catch (error) {
    console.error('Error fetching unread emails:', error);
    res.status(500).json({ error: 'Failed to fetch unread emails' });
  }
});

export default router;
