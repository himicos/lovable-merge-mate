import { Router } from 'express';
import { GmailService } from '../integrations/messaging/gmail/service.js';
import { initiateGmailAuth } from '../integrations/messaging/gmail/client.js';

const router = Router();

// Check Gmail connection status
router.get('/status/:userId', async (req, res) => {
    try {
        const gmailService = await GmailService.create(req.params.userId);
        // Try to list messages as a connection test
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

// This route is called by Google OAuth
router.get('/auth/gmail/callback', async (req, res) => {
    try {
        const { code, state } = req.query;
        if (!code || !state) {
            throw new Error('Missing code or state');
        }

        // state contains the user_id
        const user_id = state as string;
        
        // Ensure we redirect to www subdomain
        const frontendUrl = process.env.FRONTEND_URL?.replace('https://verby.eu', 'https://www.verby.eu') || 'https://www.verby.eu';
        const redirectUrl = `${frontendUrl}/settings?code=${code}&user_id=${user_id}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Error in Gmail callback:', error);
        const frontendUrl = process.env.FRONTEND_URL?.replace('https://verby.eu', 'https://www.verby.eu') || 'https://www.verby.eu';
        res.redirect(`${frontendUrl}/settings?error=auth_failed`);
    }
});

// This route is called by our frontend to complete the OAuth flow
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
