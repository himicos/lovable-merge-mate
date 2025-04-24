import { MessageContent, ProcessedMessage } from '../../../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const messageProcessorApi = {
  async processMessage(message: MessageContent): Promise<ProcessedMessage> {
    const response = await fetch(`${API_BASE}/api/messages/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error('Failed to process message');
    }
    
    return response.json();
  }
};
