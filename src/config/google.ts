export const GOOGLE_CONFIG = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  redirectUri: 'https://localhost:8080/auth/google/callback', // Hard-code for now since we're in development
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
