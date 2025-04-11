import { User } from '@supabase/supabase-js';

export class GmailService {
  private static instance: GmailService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'https://www.verby.eu';
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  async checkConnection(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/gmail/status/${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        }
      });
      if (!response.ok) {
        throw new Error('Failed to check Gmail connection');
      }
      const data = await response.json();
      return data.connected;
    } catch (error) {
      console.error('Error checking Gmail connection:', error);
      return false;
    }
  }

  async getAuthUrl(userId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/api/gmail/auth-url?user_id=${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get Gmail auth URL');
    }
    const data = await response.json();
    return data.url;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/gmail/callback?code=${code}&user_id=${userId}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to connect Gmail');
    }
    await response.json();
  }
}
