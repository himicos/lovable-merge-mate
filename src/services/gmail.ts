import { User } from '@supabase/supabase-js';

export class GmailService {
  private static instance: GmailService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  }

  public static getInstance(): GmailService {
    if (!GmailService.instance) {
      GmailService.instance = new GmailService();
    }
    return GmailService.instance;
  }

  async getAuthUrl(userId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/auth/gmail/url?user_id=${userId}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to get Gmail auth URL');
    }
    const data = await response.json();
    return data.url;
  }

  async handleCallback(code: string, userId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/auth/gmail/callback?code=${code}&user_id=${userId}`);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to connect Gmail');
    }
    await response.json();
  }
}
