import { Router } from 'express';
import { GmailService } from '../integrations/messaging/gmail/service.js';
import { initiateGmailAuth } from '../integrations/messaging/gmail/client.js';

const router = Router();

// Check Gmail connection status
router.get('/status/:userId', async (req, res) => {
    try {
        const gmailService = await GmailService.create(req.params.userId);
        const profile = await gmailService.getUserProfile();
        res.json({ connected: !!profile });
    } catch (error) {
        console.error('Error checking Gmail status:', error);
        res.json({ connected: false });
    }
});

// Get Gmail auth URL
router.get('/auth-url', async (req, res) => {
    try {
        const { user_id } = req.query;
        if (!user_id || typeof user_id !== 'string') {
            throw new Error('Missing user ID');
        }

        const { success, authUrl } = await initiateGmailAuth(process.env.GOOGLE_REDIRECT_URI || '');
        if (!success) {
            throw new Error('Failed to initiate Gmail auth');
        }
        res.json({ url: authUrl });
    } catch (error) {
        console.error('Error generating auth URL:', error);
        res.status(500).json({ error: (error as Error).message });
    }
});

// Handle Gmail OAuth callback
router.get('/callback', async (req, res) => {
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
        res.redirect('/settings?gmailConnected=true');
    } catch (error) {
        console.error('Error handling Gmail callback:', error);
        res.redirect('/settings?gmailError=true');
    }
});

export default router;
