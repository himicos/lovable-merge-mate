import { supabase } from '@/lib/supabaseClient';
import { MessageQueue } from '@/services/queue/queue';
import { GOOGLE_CONFIG } from '@/config/google';
import { MessageSource, MessageContent } from '@/services/message-processor/types';
import { google } from 'googleapis';

export class GmailService {
  private static instance: GmailService;
  private userId: string;
  private gmail: any;
  private auth: any;

  private constructor(userId: string) {
    this.userId = userId;
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      process.env.GOOGLE_REDIRECT_URI!
    );
  }

  public static async create(userId: string): Promise<GmailService> {
    const service = new GmailService(userId);
    await service.initialize();
    return service;
  }

  private async initialize(): Promise<void> {
    const { data: credentials } = await supabase
      .from('gmail_connections')
      .select('access_token, refresh_token')
      .eq('user_id', this.userId)
      .single();

    if (!credentials) {
      throw new Error('Gmail credentials not found');
    }

    this.auth.setCredentials({
      access_token: credentials.access_token,
      refresh_token: credentials.refresh_token
    });

    this.gmail = google.gmail({ 
      version: 'v1', 
      auth: this.auth
    });
  }

  public getAuthUrl(): string {
    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.modify'
      ]
    });
  }

  public async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const params = {
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: 'authorization_code',
        code
      };

      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams(params)
      });

      if (!response.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const { access_token, refresh_token, expires_in } = await response.json();

      const { error } = await supabase
        .from('gmail_connections')
        .upsert({
          user_id: userId,
          access_token,
          refresh_token,
          expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
        });

      if (error) {
        throw error;
      }

      // Verify the token works by getting user profile
      const profileResponse = await fetch(`${process.env.GOOGLE_API_ENDPOINT!}/users/me/profile`, {
        headers: {
          'Authorization': `Bearer ${access_token}`
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

      // Start watching for new messages
      await this.startMessageWatcher();
    } catch (error) {
      console.error('Error in handleCallback:', error);
      throw error;
    }
  }

  private async refreshToken(refreshToken: string): Promise<string> {
    const params = {
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    };

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(params)
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const { access_token, expires_in } = await response.json();
    return access_token;
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
        const accessToken = await this.refreshToken(data.refresh_token);
        console.log('Token refresh:', {
          ok: true,
          status: 200,
          hasAccessToken: !!accessToken,
          error: null,
          errorDescription: null
        });

        // Update stored token
        console.log('Updating stored token...');
        const { error: updateError } = await supabase
          .from('gmail_connections')
          .update({
            access_token: accessToken,
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          throw new Error('Failed to update token');
        }

        data.access_token = accessToken;
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
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching Gmail message:', error);
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

  public async markAsRead(messageId: string): Promise<void> {
    if (!this.gmail) {
      await this.initialize();
    }

    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD']
      }
    });
  }

  public async moveToFolder(messageId: string, folderId: string): Promise<void> {
    if (!this.gmail) {
      await this.initialize();
    }

    await this.gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [folderId]
      }
    });
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
