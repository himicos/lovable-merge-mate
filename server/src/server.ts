import express from 'express';
import cors from 'cors';
import { supabase } from './integrations/supabase/client.js';
import { GOOGLE_CONFIG } from './config/google.js';
import { GmailService } from './services/gmail.service.js';
import { MessageQueue } from './services/queue/queue.js';
import { MessageSource } from './services/message-processor/types.js';
import { Server } from 'http';

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

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
  res.json({ status: 'healthy' });
});

app.get('/health', (req, res) => {
  console.log('Health check request received');
  res.json({ status: 'healthy' });
});

// Google OAuth callback
app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'Missing authorization code' });
    return;
  }

  try {
    const gmailService = GmailService.getInstance();
    const userId = req.query.state;
    if (!userId || typeof userId !== 'string') {
      throw new Error('Missing user ID in state');
    }
    await gmailService.handleCallback(code, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error handling Google callback:', error);
    res.status(500).json({ error: 'Failed to handle Google callback' });
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
        const messages = await GmailService.getInstance().getMessage(data.historyId);
        
        // Add each message to the queue
        for (const message of messages) {
          await MessageQueue.getInstance().enqueue(
            {
              id: message.id,
              source: MessageSource.EMAIL,
              sender: message.from,
              subject: message.subject,
              content: message.content,
              timestamp: message.timestamp,
              raw: message
            },
            connection.user_id
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

// Message processing endpoints
app.post('/messages/process', async (req, res) => {
  const { userId, messageId, source } = req.body;

  if (!userId || !messageId || !source) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const queue = MessageQueue.getInstance();
    const id = await queue.enqueue(
      {
        id: messageId,
        source: source as MessageSource,
        sender: '',
        content: '',
        timestamp: new Date().toISOString(),
        raw: {}
      },
      userId
    );
    res.json({ id });
  } catch (error) {
    console.error('Error enqueueing message:', error);
    res.status(500).json({ error: 'Failed to enqueue message' });
  }
});

const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
