import { GOOGLE_CONFIG } from '@/config/google';
import { supabase } from '@/lib/supabaseClient';

export class GmailService {
  private static instance: GmailService;

  private constructor() {}

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  public getAuthUrl(): string {
    console.log('Client ID:', GOOGLE_CONFIG.clientId);
    console.log('Redirect URI:', GOOGLE_CONFIG.redirectUri);
    
    if (!GOOGLE_CONFIG.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_CONFIG.scopes.join(' ')
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log('Generated Auth URL:', authUrl);
    return authUrl;
  }

  public async handleCallback(code: string, userId: string): Promise<void> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.clientId,
          client_secret: GOOGLE_CONFIG.clientSecret,
          redirect_uri: GOOGLE_CONFIG.redirectUri,
          grant_type: 'authorization_code',
          code
        })
      });

      const tokens = await tokenResponse.json();

      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || 'Failed to exchange code for tokens');
      }

      console.log('Received tokens:', tokens);

      // Store tokens in Supabase with explicit session
      const { error } = await supabase.auth.setSession(session);
      if (error) {
        throw new Error('Failed to set session');
      }

      const { error: upsertError } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: userId,
          provider: 'gmail',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Date.now() + (tokens.expires_in * 1000),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;
    } catch (error) {
      console.error('Error handling Gmail callback:', error);
      throw error;
    }
  }

  public async checkConnection(userId: string): Promise<{ isConnected: boolean; email?: string }> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return { isConnected: false };
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return { isConnected: false };
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .maybeSingle();

      // If no data found, it means no integration exists yet
      if (!data) {
        console.log('No Gmail integration found for user');
        return { isConnected: false };
      }

      // If there was an error other than "no rows found"
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching integration:', error);
        return { isConnected: false };
      }

      console.log('Stored tokens:', data);

      // Check if token is expired and needs refresh
      if (data.expires_at < Date.now()) {
        if (!data.refresh_token) {
          return { isConnected: false };
        }

        // Refresh the token
        const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: GOOGLE_CONFIG.clientId,
            client_secret: GOOGLE_CONFIG.clientSecret,
            refresh_token: data.refresh_token,
            grant_type: 'refresh_token'
          })
        });

        const tokens = await refreshResponse.json();

        if (!refreshResponse.ok) {
          console.error('Failed to refresh token:', tokens);
          return { isConnected: false };
        }

        console.log('Refreshed tokens:', tokens);

        // Update stored token with explicit session
        const { error: updateError } = await supabase
          .from('user_integrations')
          .update({
            access_token: tokens.access_token,
            expires_at: Date.now() + (tokens.expires_in * 1000),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('provider', 'gmail');

        if (updateError) {
          console.error('Failed to update token:', updateError);
          return { isConnected: false };
        }

        data.access_token = tokens.access_token;
      }

      // Test connection by getting user profile
      const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (!profileResponse.ok) {
        return { isConnected: false };
      }

      const profile = await profileResponse.json();
      console.log('User profile:', profile);
      return {
        isConnected: true,
        email: profile.emailAddress
      };
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      return { isConnected: false };
    }
  }

  public async disconnect(userId: string): Promise<void> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return;
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return;
      }

      const { data } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      if (data?.access_token) {
        // Revoke the token
        await fetch(`https://oauth2.googleapis.com/revoke?token=${data.access_token}`, {
          method: 'POST'
        });
      }

      console.log('Revoked token:', data?.access_token);

      // Remove from database
      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('user_id', userId)
        .eq('provider', 'gmail');

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      throw error;
    }
  }

  public async listMessages(query = ''): Promise<any[]> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return [];
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return [];
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('provider', 'gmail')
        .single();

      if (error || !data) {
        throw new Error('No access token found');
      }

      console.log('Access token:', data.access_token);

      const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      const messages = await response.json();
      console.log('Messages:', messages);
      return messages.messages || [];
    } catch (error) {
      console.error('Error listing messages:', error);
      throw error;
    }
  }

  public async getMessage(messageId: string): Promise<any> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return null;
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return null;
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('provider', 'gmail')
        .single();

      if (error || !data) {
        throw new Error('No access token found');
      }

      console.log('Access token:', data.access_token);

      const response = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${messageId}`, {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      const message = await response.json();
      console.log('Message:', message);
      return message;
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  }

  public async sendMessage(to: string, subject: string, body: string): Promise<void> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return;
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return;
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('provider', 'gmail')
        .single();

      if (error || !data) {
        throw new Error('No access token found');
      }

      console.log('Access token:', data.access_token);

      const message = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        `To: ${to}\n`,
        `Subject: ${subject}\n\n`,
        body
      ].join('');

      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          raw: Buffer.from(message).toString('base64url')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      console.log('Sent message:', message);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async watchInbox(): Promise<void> {
    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return;
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return;
      }

      const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('provider', 'gmail')
        .single();

      if (error || !data) {
        throw new Error('No access token found');
      }

      console.log('Access token:', data.access_token);

      const response = await fetch('https://www.googleapis.com/gmail/v1/users/me/watch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${data.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          labelIds: ['INBOX'],
          topicName: 'projects/your-project/topics/gmail-notifications'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to set up inbox watch');
      }

      console.log('Set up inbox watch:', response);
    } catch (error) {
      console.error('Error setting up inbox watch:', error);
      throw error;
    }
  }
}
