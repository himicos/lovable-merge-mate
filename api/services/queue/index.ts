import type { MessageContent } from '../../../types.ts';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export const queueApi = {
  async enqueueMessage(message: MessageContent): Promise<void> {
    const response = await fetch(`${API_BASE}/api/queue/enqueue`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    
    if (!response.ok) {
      throw new Error('Failed to enqueue message');
    }
  },

  async getQueueStatus(): Promise<{
    pendingCount: number;
    processingCount: number;
  }> {
    const response = await fetch(`${API_BASE}/api/queue/status`);
    
    if (!response.ok) {
      throw new Error('Failed to get queue status');
    }
    
    return response.json();
  }
};
