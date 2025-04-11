import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GmailService } from './integrations/messaging/gmail/service.js';
import { QueueProcessor } from './services/queue/processor.js';
import { supabase } from './integrations/supabase/client.js';
import { MessageContent } from './services/message-processor/types.js';
import gmailRouter from './routes/gmail.js';

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.resolve(__dirname, '../../dist');
console.log('Serving frontend from:', frontendPath);
app.use(express.static(frontendPath));

// SPA fallback
app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api/') || 
        req.path.startsWith('/auth/') || 
        req.path.startsWith('/webhook/')) {
        return next();
    }
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Supabase Auth callback
app.get('/auth/callback', (req, res) => {
    // Just serve the SPA, Supabase Auth will handle the rest
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// Gmail routes
app.use('/api/gmail', gmailRouter);

// Gmail webhook endpoint
app.post('/webhook/gmail', async (req, res) => {
    try {
        const { message } = req.body;
        const data = message.data ? JSON.parse(Buffer.from(message.data, 'base64').toString()) : null;

        if (!data?.emailAddress || !data?.historyId) {
            throw new Error('Invalid webhook data');
        }

        // Find the Gmail connection for this email
        const { data: connection } = await supabase
            .from('gmail_connections')
            .select('user_id')
            .eq('email', data.emailAddress)
            .single();

        if (!connection) {
            throw new Error('No Gmail connection found for email');
        }

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
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error processing Gmail webhook:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
