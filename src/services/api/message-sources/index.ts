const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:10000';

export const gmailApi = {
  async checkConnection(): Promise<boolean> {
    const response = await fetch(`${API_BASE}/api/sources/gmail/status`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.isConnected;
  },

  async disconnect(): Promise<void> {
    const response = await fetch(`${API_BASE}/api/sources/gmail/disconnect`, {
      method: 'POST'
    });
    if (!response.ok) {
      throw new Error('Failed to disconnect Gmail');
    }
  },

  async initiateAuth(): Promise<void> {
    const response = await fetch(`${API_BASE}/api/sources/gmail/auth`);
    if (!response.ok) {
      throw new Error('Failed to initiate Gmail auth');
    }
    const data = await response.json();
    window.location.href = data.authUrl;
  }
};

export const messageSourcesApi = {
  async connectGmail(code: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/sources/gmail/connect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to connect Gmail');
    }
  },

  async disconnectGmail(): Promise<void> {
    const response = await fetch(`${API_BASE}/api/sources/gmail/disconnect`, {
      method: 'POST',
    });
    
    if (!response.ok) {
      throw new Error('Failed to disconnect Gmail');
    }
  },

  // Add similar methods for Slack and Teams
};
