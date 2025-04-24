export interface MessageContent {
  id?: string;
  userId: string;
  source: string;
  sourceId: string;
  subject?: string;
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}
