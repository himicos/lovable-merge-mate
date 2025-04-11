import { Router } from 'express';
import { GmailService } from '../integrations/messaging/gmail/service.js';
import { initiateGmailAuth } from '../integrations/messaging/gmail/client.js';

const router = Router();

// Check Gmail connection status
router.get('/status/:userId', async (req, res) => {
    console.log('Checking Gmail status for user:', req.params.userId);
    try {
        console.log('Creating Gmail service...');
        const gmailService = await GmailService.create(req.params.userId);
        console.log('Gmail service created, checking connection...');
        // Try to list messages as a connection test
        await gmailService.listMessages('');
        console.log('Connection test successful');
        res.json({ connected: true });
    } catch (error) {
        console.error('Error checking Gmail status:', error);
        res.json({ connected: false });
    }
});

// Get Gmail auth URL
router.get('/auth-url', async (req, res) => {
    console.log('Getting Gmail auth URL, query params:', req.query);
    try {
        const { user_id } = req.query;
        if (!user_id || typeof user_id !== 'string') {
            throw new Error('Missing user ID');
        }

        const redirectUri = process.env.GOOGLE_REDIRECT_URI || '';
        console.log('Using redirect URI:', redirectUri);
        const { success, authUrl } = await initiateGmailAuth(redirectUri);
        console.log('Auth URL generated:', { success, authUrl });
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

export const gmailRouter = router;
