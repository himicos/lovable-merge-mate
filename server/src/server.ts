import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './integrations/supabase/client.js';
import { GmailService } from '@/services/gmail.service.js';
import { MessageQueue } from '@/services/queue/queue.js';
import { MessageSource } from '@/services/message-processor/types.js';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '8080', 10);
const gmailService = GmailService.getInstance();
const messageQueue = MessageQueue.getInstance();

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  console.log('Health check request received');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
  console.log('Health check request received');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gmail OAuth callback endpoint
app.get('/auth/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid code');
    }
    
    if (!session) {
      throw new Error('No active session');
    }

    await gmailService.handleCallback(code, session.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in Gmail callback:', error);
    res.status(500).json({ error: 'Failed to handle Gmail callback' });
  }
});

// Gmail webhook endpoint
app.post('/webhook/gmail', async (req, res) => {
  try {
    const { message } = req.body;
    const data = JSON.parse(Buffer.from(message.data, 'base64').toString());
    
    if (data.emailAddress && data.historyId) {
      // Get user ID from email address
      const { data: connection } = await supabase
        .from('gmail_connections')
        .select('user_id')
        .eq('email', data.emailAddress)
        .single();

      if (connection) {
        // Get messages using Gmail API
        const messages = await gmailService.getMessage(data.historyId);
        
        // Add each message to the queue
        for (const message of messages) {
          await messageQueue.enqueue(
            {
              id: message.id,
              source: MessageSource.EMAIL,
              sender: message.from,
              subject: message.subject,
              content: message.content,
              timestamp: message.timestamp,
              raw: message
            },
            connection.user_id,
            { priority: 1 }
          );
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in Gmail webhook:', error);
    res.status(500).json({ error: 'Failed to handle Gmail webhook' });
  }
});

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
