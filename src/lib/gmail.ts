import { GmailService } from '@/services/gmail.service';

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
