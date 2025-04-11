import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

import { supabase } from '../../supabase/client.js';

interface GoogleSecrets {
    google_client_id: string;
    google_client_secret: string;
    google_redirect_uri: string;
}

export const getOAuthCredentials = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
        throw new Error('Google OAuth credentials not found in environment variables');
    }

    return {
        clientId,
        clientSecret,
        redirectUri
    };
};

export const createOAuth2Client = (): OAuth2Client => {
    const credentials = getOAuthCredentials();
    return new google.auth.OAuth2(
        credentials.clientId,
        credentials.clientSecret,
        credentials.redirectUri
    );
};

export const getGmailService = async (auth: OAuth2Client | Promise<OAuth2Client>): Promise<any> => {
    const client = auth instanceof Promise ? await auth : auth;
    return google.gmail({ 
        version: 'v1', 
        auth: client as any // Force type to bypass version mismatch
    });
};

export const getAuthUrl = (auth: OAuth2Client | Promise<OAuth2Client>, userId: string): Promise<string> => {
    const client = auth instanceof Promise ? auth : Promise.resolve(auth);
    return client.then(auth => auth.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/gmail.readonly',
            'https://www.googleapis.com/auth/gmail.modify'
        ],
        state: userId
    }));
};

export const initiateGmailAuth = async (redirectUrl: string, userId: string): Promise<{ success: boolean, authUrl: string }> => {
  try {
    const auth = await createOAuth2Client();
    const authUrl = await getAuthUrl(auth, userId);
    return {
      success: true,
      authUrl
    };
  } catch (error) {
    console.error('Failed to initiate Gmail auth:', error);
    return {
      success: false,
      authUrl: ''
    };
  }
};

export const checkGmailConnection = async (auth: Promise<OAuth2Client>): Promise<boolean> => {
    const client = await auth;
    try {
        const gmail = await getGmailService(client);
        const response = await gmail.users.getProfile({ userId: 'me' });
        return !!response.data.emailAddress;
    } catch (error) {
        console.error('Failed to check Gmail connection:', error);
        return false;
    }
};

export const disconnectGmail = async (auth: Promise<OAuth2Client>): Promise<void> => {
    const client = await auth;
    try {
        await client.revokeCredentials();
    } catch (error) {
        console.error('Failed to disconnect Gmail:', error);
        throw new Error('Failed to disconnect Gmail');
    }
};
