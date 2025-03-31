import { GmailService } from '@/services/gmail.service';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

export function createOAuth2Client(clientId: string): OAuth2Client {
    return new OAuth2Client({
        clientId,
        redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
    });
}

export const initiateGmailAuth = async () => {
  try {
    const gmailService = GmailService.getInstance();
    const authUrl = gmailService.getAuthUrl();
    window.location.href = authUrl;
    return { success: true };
  } catch (error) {
    console.error('Failed to initiate Gmail auth:', error);
    throw new Error('Failed to initiate Gmail authentication');
  }
};

export const checkGmailConnection = async (userId: string) => {
  try {
    const gmailService = GmailService.getInstance();
    return await gmailService.checkConnection(userId);
  } catch (error) {
    console.error('Error checking Gmail connection:', error);
    return { isConnected: false };
  }
};

export const disconnectGmail = async (userId: string) => {
  try {
    const gmailService = GmailService.getInstance();
    await gmailService.disconnect(userId);
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Gmail:', error);
    throw error;
  }
};
