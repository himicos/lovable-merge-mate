export const GOOGLE_CONFIG = {
  clientId: process.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.VITE_APP_URL ? `${process.env.VITE_APP_URL}/auth/google/callback` : 'https://localhost:8080/auth/google/callback',
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.metadata',
    'https://www.googleapis.com/auth/gmail.settings.basic',
    'https://www.googleapis.com/auth/gmail.settings.sharing'
  ]
};
