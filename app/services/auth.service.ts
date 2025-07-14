interface User {
  id: string;
  email: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:13337';
    
    // Debug environment variables
    console.log('🔧 Auth Service Environment:', {
      VITE_API_URL: import.meta.env.VITE_API_URL,
      baseUrl: this.baseUrl,
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD
    });
    
    // Load tokens from localStorage on initialization
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  // Sign up with email and password
  async signUp(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign up failed');
    }

    const data: AuthResponse = await response.json();
    this.setTokens(data.tokens);
    return data;
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Sign in failed');
    }

    const data: AuthResponse = await response.json();
    this.setTokens(data.tokens);
    return data;
  }

  // Sign in with Google OAuth
  async signInWithGoogle(): Promise<void> {
    // For Google OAuth, we need to redirect to Google's OAuth URL
    // This will be handled by the backend
    const authUrl = `${this.baseUrl}/api/auth/google/url`;
    window.location.href = authUrl;
  }

  // Handle Google OAuth callback
  async handleGoogleCallback(token: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ accessToken: token }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Google sign in failed');
    }

    const data: AuthResponse = await response.json();
    this.setTokens(data.tokens);
    return data;
  }

  // Refresh access token
  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      // If refresh fails, clear tokens and redirect to login
      this.clearTokens();
      throw new Error('Session expired');
    }

    const data = await response.json();
    this.setTokens(data.tokens);
    return data.tokens;
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (this.accessToken) {
        await fetch(`${this.baseUrl}/api/auth/signout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.clearTokens();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await this.fetchWithAuth('/api/auth/me');
    const data = await response.json();
    return data.user;
  }

  // Update password
  async updatePassword(newPassword: string): Promise<void> {
    const response = await this.fetchWithAuth('/api/auth/password', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Password update failed');
    }
  }

  // Verify email
  async verifyEmail(): Promise<void> {
    const response = await this.fetchWithAuth('/api/auth/verify-email', {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email verification failed');
    }
  }

  // Helper method for authenticated requests
  async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    // Try with current access token
    let response = await fetch(fullUrl, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && this.refreshToken) {
      try {
        await this.refreshAccessToken();
        
        // Retry with new token
        response = await fetch(fullUrl, {
          ...options,
          headers: {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });
      } catch (error) {
        // Refresh failed, redirect to login
        this.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    return response;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Get access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Set tokens in memory and localStorage
  private setTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.access_token;
    this.refreshToken = tokens.refresh_token;
    
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at', (Date.now() + tokens.expires_in * 1000).toString());
  }

  // Clear tokens from memory and localStorage
  private clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
  }

  // Check if token is expired
  private isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }
}

export const authService = new AuthService();
export type { User, AuthTokens, AuthResponse }; 