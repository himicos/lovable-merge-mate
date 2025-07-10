declare module 'google-auth-library' {
  export class OAuth2Client {
    constructor(clientId?: string, clientSecret?: string, redirectUri?: string);
    getToken(code: string): Promise<{ tokens: any }>;
    setCredentials(credentials: any): void;
    generateAuthUrl(options?: any): string;
    revokeCredentials(): Promise<void>;
    credentials: any;
  }
  export interface Credentials {
    access_token?: string;
    refresh_token?: string;
    expiry_date?: number;
    [key: string]: any;
  }
}

declare module 'googleapis' {
  export const google: any;
  export const gmail_v1: {
    Gmail: any;
  };
  export const oauth2_v2: {
    Oauth2: any;
  };
  export namespace gmail_v1 {
    type Gmail = any;
  }
  export namespace oauth2_v2 {
    type Oauth2 = any;
  }
}