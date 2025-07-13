import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GmailService } from './integrations/messaging/gmail/service.js';
import { QueueProcessor } from './services/queue/processor.js';
import { db } from './services/database/client.js';
import { redis } from './services/redis/client.js';
import { MessageContent } from './services/message-processor/types.js';
import { gmailRouter } from './routes/gmail.js';
import { visionRouter } from './routes/vision.js';
import { authRoutes } from './routes/auth.routes.js';
import bodyParser from 'body-parser';
import { SseManager } from './services/sse.js';

const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'https://lovable-merge-mate.onrender.com'],
  credentials: true
}));

// Test database and redis connections on startup
async function initializeConnections() {
  try {
    const dbHealth = await db.healthCheck();
    const redisHealth = await redis.healthCheck();
    
    if (!dbHealth) {
      console.error('❌ Database health check failed');
      process.exit(1);
    }
    
    if (!redisHealth) {
      console.error('❌ Redis health check failed');
      process.exit(1);
    }
    
    console.log('✅ All database connections initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize database connections:', error);
    process.exit(1);
  }
}
app.use(express.json());
app.use('/api/vision', bodyParser.raw({ limit: '5mb', type: () => true }));

// Serve static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../www/dist');
console.log('Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    const redisHealth = await redis.healthCheck();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: dbHealth ? 'connected' : 'disconnected',
      redis: redisHealth ? 'connected' : 'disconnected',
      services: {
        database: dbHealth,
        redis: redisHealth
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      error: 'Health check failed'
    });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// Gmail routes  
app.use('/api/gmail', gmailRouter);

// Vision routes
app.use('/api/vision', visionRouter);

// Gmail webhook endpoint
app.post('/webhook/gmail', async (req, res) => {
    try {
        const { message } = req.body;
        const data = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : null;

        if (!data?.emailAddress || !data?.historyId) {
            throw new Error('Invalid webhook data');
        }

        // Find the Gmail connection for this email
        const result = await db.query(
            'SELECT user_id FROM gmail_connections WHERE email = $1',
            [data.emailAddress]
        );

        if (result.rows.length === 0) {
            throw new Error('No Gmail connection found for email');
        }

        const connection = result.rows[0];

        // Get messages using Gmail API
        const gmailService = await GmailService.create(connection.user_id);
        const messages = await gmailService.listMessages(`after:${data.historyId}`);

        // Process each message
        const queueProcessor = await QueueProcessor.create();
        for (const message of messages) {
            const messageData = await gmailService.getMessage(message.id);
            const timestamp = new Date(parseInt(messageData.internalDate)).toISOString();
            
            // Create message content
            const content: MessageContent = {
                id: messageData.id,
                source: 'gmail',
                sender: messageData.payload.headers.find((h: any) => h.name === 'From')?.value || '',
                subject: messageData.payload.headers.find((h: any) => h.name === 'Subject')?.value,
                content: messageData.snippet || '',
                timestamp,
                raw: messageData
            };

            // Add to queue
            await queueProcessor.processItem({
                id: messageData.id,
                user_id: connection.user_id,
                payload: content,
                created_at: new Date().toISOString()
            });

            // Notify via SSE
            SseManager.push(connection.user_id, 'inbox', { messageId: messageData.id });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error processing Gmail webhook:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Auth callback (for OAuth flows)
app.get('/auth/callback', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// SPA fallback - THIS MUST BE LAST
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const port = process.env.PORT || 13337;

// Initialize connections before starting server
initializeConnections().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`📊 Health check available at http://localhost:${port}/health`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await db.close();
  await redis.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await db.close();
  await redis.close();
  process.exit(0);
});
