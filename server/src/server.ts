import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MessageProcessor } from '../../src/services/message-processor/processor';
import { MessageQueue } from '../../src/services/queue/queue';
import { GmailService } from '../../src/services/gmail.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

// Initialize services
const messageProcessor = MessageProcessor.getInstance();
const messageQueue = MessageQueue.getInstance();
const gmailService = GmailService.getInstance();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Gmail OAuth callback endpoint
app.get('/auth/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid code');
    }
    
    await gmailService.handleCallback(code);
    res.json({ success: true });
  } catch (error) {
    console.error('Error in Gmail callback:', error);
    res.status(500).json({ error: 'Failed to handle Gmail callback' });
  }
});

// Start processing messages
messageQueue.setProcessor(async (message, userId) => {
  return messageProcessor.processMessage(message, userId);
});

messageQueue.startProcessing(10, 1000);

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
