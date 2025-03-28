import express from 'express';
import { google } from 'googleapis';
import { supabase } from '../lib/supabaseClient';
import cors from 'cors';

const app = express();
const port = 8081;

app.use(cors());
app.use(express.json());

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.VITE_GOOGLE_CLIENT_ID,
  process.env.VITE_GOOGLE_CLIENT_SECRET,
  'http://localhost:8081/auth/callback'
);

// Handle Gmail OAuth callback
app.get('/auth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || !state) {
      throw new Error('Missing required parameters');
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code as string);
    
    // Get user info from access token
    oauth2Client.setCredentials(tokens);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const profile = await gmail.users.getProfile({ userId: 'me' });
    
    // Store tokens in Supabase
    const { error } = await supabase.from('gmail_connections').upsert({
      user_id: state as string,
      access_token: tokens.access_token!,
      refresh_token: tokens.refresh_token!,
      expires_at: new Date(Date.now() + (tokens.expiry_date || 0)).toISOString(),
      email: profile.data.emailAddress
    });

    if (error) {
      console.error('Error storing tokens:', error);
      throw error;
    }

    // Redirect back to frontend with success
    res.redirect(`${process.env.VITE_APP_URL}/settings?gmailConnected=true`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.VITE_APP_URL}/settings?error=gmail_connection_failed`);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
