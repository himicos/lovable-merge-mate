import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Ensure environment variables are defined
if (!process.env.GOOGLE_CLIENT_ID) throw new Error('GOOGLE_CLIENT_ID is not defined');
if (!process.env.GOOGLE_CLIENT_SECRET) throw new Error('GOOGLE_CLIENT_SECRET is not defined');
if (!process.env.GOOGLE_REDIRECT_URI) throw new Error('GOOGLE_REDIRECT_URI is not defined');

export const createOAuth2Client = (): OAuth2Client => {
    const auth = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    // Cast to unknown first to bypass type mismatch between different versions
    return auth as unknown as OAuth2Client;
};

export const getGmailService = async (auth: OAuth2Client): Promise<any> => {
    return google.gmail({ 
        version: 'v1', 
        auth: auth as any // Force type to bypass version mismatch
    });
};

export const getAuthUrl = (auth: OAuth2Client): string => {
    return auth.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify'
        ]
    });
};

export const initiateGmailAuth = async (redirectUrl: string): Promise<{ success: boolean, authUrl: string }> => {
  try {
    const auth = createOAuth2Client();
    const authUrl = getAuthUrl(auth);
    // Return the auth URL instead of redirecting
    return { success: true, authUrl };
  } catch (error) {
    console.error('Failed to initiate Gmail auth:', error);
    throw new Error('Failed to initiate Gmail authentication');
  }
};

export const checkGmailConnection = async (auth: OAuth2Client): Promise<boolean> => {
    try {
        const gmail = await getGmailService(auth);
        const response = await gmail.users.getProfile({ userId: 'me' });
        return !!response.data.emailAddress;
    } catch (error) {
        console.error('Failed to check Gmail connection:', error);
        return false;
    }
};

export const disconnectGmail = async (auth: OAuth2Client): Promise<void> => {
    try {
        await auth.revokeCredentials();
    } catch (error) {
        console.error('Failed to disconnect Gmail:', error);
        throw new Error('Failed to disconnect Gmail');
    }
};
