/**
 * Gmail API Routes
 * These routes handle Gmail-specific functionality.
 * OAuth callback is handled separately in auth.ts
 */

import { Router, Request, Response } from 'express';
import { GmailService } from '../integrations/messaging/gmail/service.js';
import { initiateGmailAuth } from '../integrations/messaging/gmail/client.js';
import { SseManager } from '../services/sse.js';

const router = Router();

// Check Gmail connection status
router.get('/status/:userId', async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const gmailService = await GmailService.create(req.params.userId);
        const unreadMessages = await gmailService.listMessages('is:unread');
        res.json({ connected: true, unread: unreadMessages.length });
    } catch (error) {
        console.error('Error checking Gmail status:', error);
        res.json({ connected: false, unread: 0 });
    }
});

// Get Gmail auth URL
router.get('/auth-url', async (req: Request<{}, {}, {}, { user_id?: string }>, res: Response) => {
    try {
        const { user_id } = req.query;
        if (!user_id) {
            throw new Error('Missing user_id');
        }
        const { success, authUrl } = await initiateGmailAuth(req.headers.origin || '', user_id as string);
        if (!success) {
            throw new Error('Failed to get auth URL');
        }
        res.json({ url: authUrl });
    } catch (error) {
        console.error('Error getting Gmail auth URL:', error);
        res.status(500).json({ error: 'Failed to get Gmail auth URL' });
    }
});

// Handle OAuth callback
router.get('/callback', async (req: Request<{}, {}, {}, { code?: string; user_id?: string }>, res: Response) => {
    try {
        const { code, user_id } = req.query;
        if (!code || !user_id) {
            throw new Error('Missing code or user_id');
        }

        const service = await GmailService.create(user_id as string);
        await service.handleCallback(code as string, user_id as string);
        res.json({ success: true });
    } catch (error) {
        console.error('Error completing Gmail auth:', error);
        res.status(500).json({ error: 'Failed to complete Gmail authentication' });
    }
});

router.get('/messages/:userId', async (req: Request<{ userId: string }>, res: Response) => {
    try {
        const gmailService = await GmailService.create(req.params.userId);
        const messageMetas = await gmailService.listMessages('');
        const messages: any[] = [];
        for (const meta of messageMetas.slice(0, 20)) {
            const data = await gmailService.getMessage(meta.id);
            const sender = data.payload?.headers.find((h: any) => h.name === 'From')?.value || '';
            const subject = data.payload?.headers.find((h: any) => h.name === 'Subject')?.value || '';
            const snippet = data.snippet || '';
            messages.push({ id: data.id, sender, subject, snippet, timestamp: data.internalDate });
        }
        res.json(messages);
    } catch (error) {
        console.error('Error listing Gmail messages:', error);
        res.status(500).json({ error: 'Failed to list Gmail messages' });
    }
});

// SSE inbox stream
router.get('/stream/:userId', (req: Request<{ userId: string }>, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  SseManager.addClient(req.params.userId, res);
  res.write('event: open\ndata: {}\n\n');
});

export const gmailRouter = router;
