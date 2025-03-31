import { supabase } from '@/lib/supabaseClient';
import { MessageQueue } from '@/services/queue/queue';
import { GOOGLE_CONFIG } from '@/config/google';
import { MessageSource, MessageContent } from '@/services/message-processor/types';

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
    if (!GOOGLE_CONFIG.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    const params = new URLSearchParams({
      client_id: GOOGLE_CONFIG.clientId,
      redirect_uri: GOOGLE_CONFIG.redirectUri,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'select_account',
      scope: GOOGLE_CONFIG.scopes.join(' ')
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  public async handleCallback(code: string, userId: string): Promise<void> {
    try {
      // Get the current session
      const { data: { session }, error: sessionGetError } = await supabase.auth.getSession();
      console.log('Session check:', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id,
        requestedUserId: userId,
        sessionError: sessionGetError 
      });

      if (!session) {
        throw new Error('No active session');
      }

      if (session.user.id !== userId) {
        console.error('Session user ID mismatch:', { sessionUserId: session.user.id, requestedUserId: userId });
        throw new Error('User ID mismatch');
      }

      // Exchange code for tokens directly with Google
      console.log('Exchanging code for tokens...');
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

      // Try to get the response text first
      const responseText = await tokenResponse.text();
      console.log('Raw token response:', responseText);

      // Try to parse as JSON
      let tokens;
      try {
        tokens = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse token response as JSON:', e);
        throw new Error(`Token exchange error: ${responseText.substring(0, 100)}`);
      }

      console.log('Token exchange:', {
        ok: tokenResponse.ok,
        status: tokenResponse.status,
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        error: tokens.error,
        errorDescription: tokens.error_description
      });

      if (!tokenResponse.ok) {
        throw new Error(tokens.error_description || tokens.error || 'Failed to exchange code for tokens');
      }

      // Verify the token works by getting user profile
      const profileResponse = await fetch(`${GOOGLE_CONFIG.apiEndpoint}/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to verify Gmail access token');
      }

      const profile = await profileResponse.json();
      console.log('Gmail profile:', {
        emailAddress: profile.emailAddress,
        messagesTotal: profile.messagesTotal
      });

      // Store tokens in Supabase
      console.log('Storing Gmail connection...');
      const gmailData = {
        user_id: userId,
        email: profile.emailAddress,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Attempting to store Gmail connection...', {
        userId,
        email: profile.emailAddress,
        hasTokens: !!tokens.access_token && !!tokens.refresh_token,
        expiresAt: gmailData.expires_at
      });

      const { error: gmailError } = await supabase
        .from('gmail_connections')
        .upsert(gmailData, {
          onConflict: 'user_id'
        });

      if (gmailError) {
        console.error('Failed to store Gmail connection:', {
          error: gmailError,
          errorMessage: gmailError.message,
          details: gmailError.details,
          hint: gmailError.hint
        });
        throw new Error('Database error: ' + gmailError.message);
      }

      // Verify the Gmail connection was stored
      const { data: verifyData, error: verifyError } = await supabase
        .from('gmail_connections')
        .select('*')
        .eq('user_id', userId)
        .single();

      console.log('Verification of stored Gmail connection:', {
        success: !!verifyData,
        error: verifyError,
        userId,
        hasData: !!verifyData,
        storedEmail: verifyData?.email
      });

      console.log('Successfully stored Gmail connection for user:', userId);

      // Start watching for new messages
      await this.startMessageWatcher();
    } catch (error) {
      console.error('Error in handleCallback:', error);
      throw error;
    }
  }

  public async checkConnection(userId: string): Promise<{ isConnected: boolean; email?: string }> {
    try {
      // Get the current session
      const { data: { session }, error: sessionGetError } = await supabase.auth.getSession();
      console.log('Session check:', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id,
        requestedUserId: userId,
        sessionError: sessionGetError 
      });

      if (!session) {
        return { isConnected: false };
      }

      if (session.user.id !== userId) {
        console.error('Session user ID mismatch:', { sessionUserId: session.user.id, requestedUserId: userId });
        return { isConnected: false };
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return { isConnected: false };
      }

      const { data, error } = await supabase
        .from('gmail_connections')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw new Error('Failed to fetch Gmail connection data');
      }

      if (!data) {
        throw new Error('No Gmail connection found');
      }

      // Check if token is expired and needs refresh
      if ((data.expires_at as number) < Date.now() / 1000) {
        if (!data.refresh_token) {
          return { isConnected: false };
        }

        // Refresh the token
        console.log('Refreshing token...');
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
        console.log('Token refresh:', {
          ok: refreshResponse.ok,
          status: refreshResponse.status,
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          error: tokens.error,
          errorDescription: tokens.error_description
        });

        if (!refreshResponse.ok) {
          throw new Error('Failed to refresh token');
        }

        // Update stored token
        console.log('Updating stored token...');
        const { error: updateError } = await supabase
          .from('gmail_connections')
          .update({
            access_token: tokens.access_token,
            expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          throw new Error('Failed to update token');
        }

        data.access_token = tokens.access_token;
      }

      // Test connection by getting user profile
      console.log('Testing connection...');
      const profileResponse = await fetch('https://www.googleapis.com/gmail/v1/users/me/profile', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      if (!profileResponse.ok) {
        return { isConnected: false };
      }

      const profile = await profileResponse.json();
      return {
        isConnected: true,
        email: profile.emailAddress
      };
    } catch (error) {
      if (error instanceof Error && error.message === 'No Gmail connection found') {
        return { isConnected: false };
      }
      throw error;
    }
  }

  public async disconnect(userId: string): Promise<void> {
    try {
      // Get the current session
      const { data: { session }, error: sessionGetError } = await supabase.auth.getSession();
      console.log('Session check:', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id,
        requestedUserId: userId,
        sessionError: sessionGetError 
      });

      if (!session) {
        console.error('No active session found');
        return;
      }

      if (session.user.id !== userId) {
        console.error('Session user ID mismatch:', { sessionUserId: session.user.id, requestedUserId: userId });
        return;
      }

      // Set the session explicitly
      const { error: sessionError } = await supabase.auth.setSession(session);
      if (sessionError) {
        console.error('Failed to set session:', sessionError);
        return;
      }

      const { data } = await supabase
        .from('gmail_connections')
        .select('access_token')
        .eq('user_id', userId)
        .single();

      if (data?.access_token) {
        // Revoke the token
        console.log('Revoking token...');
        await fetch(`https://oauth2.googleapis.com/revoke?token=${data.access_token}`, {
          method: 'POST'
        });
      }

      console.log('Revoked token:', data?.access_token);

      // Remove from database
      console.log('Removing Gmail connection from database...');
      const { error } = await supabase
        .from('gmail_connections')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      throw error;
    }
  }

  public async listMessages(query = ''): Promise<any[]> {
    try {
      // Get the current session
      const { data: { session }, error: sessionGetError } = await supabase.auth.getSession();
      console.log('Session check:', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id,
        sessionError: sessionGetError 
      });

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
        .from('gmail_connections')
        .select('access_token')
        .eq('user_id', session.user.id)
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
      const { data: { session }, error: sessionGetError } = await supabase.auth.getSession();
      console.log('Session check:', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id,
        sessionError: sessionGetError 
      });

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
        .from('gmail_connections')
        .select('access_token')
        .eq('user_id', session.user.id)
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
      const { data: { session }, error: sessionGetError } = await supabase.auth.getSession();
      console.log('Session check:', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id,
        sessionError: sessionGetError 
      });

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
        .from('gmail_connections')
        .select('access_token')
        .eq('user_id', session.user.id)
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
      const { data: { session }, error: sessionGetError } = await supabase.auth.getSession();
      console.log('Session check:', { 
        hasSession: !!session, 
        sessionUserId: session?.user?.id,
        sessionError: sessionGetError 
      });

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
        .from('gmail_connections')
        .select('access_token')
        .eq('user_id', session.user.id)
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

  private async startMessageWatcher(): Promise<void> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const messageQueue = MessageQueue.getInstance();
      const { data, error } = await supabase
        .from('gmail_connections')
        .select('access_token')
        .eq('user_id', session.user.id)
        .single();

      if (error || !data) {
        console.error('No Gmail connection found');
        return;
      }

      // Set up Gmail push notifications
      await this.watchInbox();

      // Poll for new messages every minute as backup
      setInterval(async () => {
        try {
          const messages = await this.listMessages('newer_than:1m');
          for (const message of messages) {
            const fullMessage = await this.getMessage(message.id);
            await messageQueue.enqueue(
              {
                id: fullMessage.id,
                source: MessageSource.EMAIL,
                sender: fullMessage.payload.headers.find((h: any) => h.name === 'From')?.value,
                subject: fullMessage.payload.headers.find((h: any) => h.name === 'Subject')?.value,
                content: this.getMessageContent(fullMessage),
                raw: fullMessage,
                timestamp: new Date().toISOString()
              },
              session.user.id,
              { priority: 1 }
            );
          }
        } catch (error) {
          console.error('Error polling Gmail:', error);
        }
      }, 60000); // Poll every minute
    } catch (error) {
      console.error('Error starting Gmail watcher:', error);
    }
  }

  private getMessageContent(message: any): string {
    let content = '';
    
    if (message.payload.parts) {
      for (const part of message.payload.parts) {
        if (part.mimeType === 'text/plain') {
          content += Buffer.from(part.body.data, 'base64').toString('utf8');
        }
      }
    } else if (message.payload.body.data) {
      content = Buffer.from(message.payload.body.data, 'base64').toString('utf8');
    }
    
    return content;
  }
}
