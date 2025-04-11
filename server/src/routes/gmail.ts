/**
 * Gmail API Routes
 * These routes handle Gmail-specific functionality.
 * OAuth callback is handled separately in auth.ts
 */

import { Router } from 'express';
import { GmailService } from '../integrations/messaging/gmail/service.js';
import { initiateGmailAuth } from '../integrations/messaging/gmail/client.js';

const router = Router();

// Check Gmail connection status
router.get('/status/:userId', async (req, res) => {
    try {
        const gmailService = await GmailService.create(req.params.userId);
        await gmailService.listMessages('');
        res.json({ connected: true });
    } catch (error) {
        console.error('Error checking Gmail status:', error);
        res.json({ connected: false });
    }
});

// Get Gmail auth URL
router.get('/auth-url', async (req, res) => {
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

// Complete OAuth flow after callback
router.get('/complete-auth', async (req, res) => {
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

export const gmailRouter = router;
