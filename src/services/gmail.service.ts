import { google } from 'googleapis';
import { GOOGLE_CONFIG } from '@/config/google';
import { supabase } from '@/lib/supabaseClient';

const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CONFIG.clientId,
  GOOGLE_CONFIG.clientSecret,
  GOOGLE_CONFIG.redirectUri
);

export class GmailService {
  private static instance: GmailService;
  private gmail: any;

  private constructor() {
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  public getAuthUrl(): string {
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: GOOGLE_CONFIG.scopes,
      prompt: 'consent'
    });
  }

  public async handleCallback(code: string, userId: string): Promise<void> {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);

      // Store tokens in Supabase
      const { error } = await supabase
        .from('user_integrations')
        .upsert({
          user_id: userId,
          provider: 'gmail',
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: tokens.expiry_date,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error handling Gmail callback:', error);
      throw error;
    }
  }

  public async checkConnection(userId: string): Promise<{ isConnected: boolean; email?: string }> {
    try {
      const { data, error } = await supabase
        .from('user_integrations')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      if (error || !data) {
        return { isConnected: false };
      }

      // Set credentials
      oauth2Client.setCredentials({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expiry_date: data.expires_at
      });

      // Test connection by getting user profile
      const response = await this.gmail.users.getProfile({ userId: 'me' });
      return {
        isConnected: true,
        email: response.data.emailAddress
      };
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      return { isConnected: false };
    }
  }

  public async disconnect(userId: string): Promise<void> {
    try {
      // Revoke access
      const { data } = await supabase
        .from('user_integrations')
        .select('access_token')
        .eq('user_id', userId)
        .eq('provider', 'gmail')
        .single();

      if (data?.access_token) {
        await oauth2Client.revokeToken(data.access_token);
      }

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

  // Gmail API methods
  public async listMessages(query = ''): Promise<any[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query
      });
      return response.data.messages || [];
    } catch (error) {
      console.error('Error listing messages:', error);
      throw error;
    }
  }

  public async getMessage(messageId: string): Promise<any> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  }

  public async sendMessage(to: string, subject: string, body: string): Promise<void> {
    try {
      const message = [
        'Content-Type: text/plain; charset="UTF-8"\n',
        'MIME-Version: 1.0\n',
        'Content-Transfer-Encoding: 7bit\n',
        `To: ${to}\n`,
        `Subject: ${subject}\n\n`,
        body
      ].join('');

      await this.gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: Buffer.from(message).toString('base64url')
        }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public async watchInbox(): Promise<void> {
    try {
      await this.gmail.users.watch({
        userId: 'me',
        requestBody: {
          labelIds: ['INBOX'],
          topicName: 'projects/your-project/topics/gmail-notifications'
        }
      });
    } catch (error) {
      console.error('Error setting up inbox watch:', error);
      throw error;
    }
  }
}
