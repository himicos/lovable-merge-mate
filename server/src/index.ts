import express from 'express';
import cors from 'cors';
import { GmailService } from './services/gmail.service';
import { QueueProcessor } from './services/queue/processor';
import { supabase } from './integrations/supabase/client';
import { MessageContent } from './services/message-processor/types';

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Gmail auth endpoints
app.get('/auth/gmail/url', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id || typeof user_id !== 'string') {
            throw new Error('Missing user ID');
        }

        const gmailService = await GmailService.create(user_id);
        const authUrl = gmailService.getAuthUrl();
        res.json({ url: authUrl });
    } catch (error) {
        console.error('Error getting Gmail auth URL:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

app.get('/auth/gmail/callback', async (req, res) => {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Missing code parameter' });
        return;
    }

    try {
        const { user_id } = req.query;
        if (!user_id || typeof user_id !== 'string') {
            throw new Error('Missing user ID in state');
        }

        const gmailService = await GmailService.create(user_id);
        await gmailService.handleCallback(code, user_id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error handling Gmail callback:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

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
