import { Router } from 'express';

const router = Router();

/**
 * OAuth Routes
 * These routes handle OAuth callbacks for various integrations.
 * Each integration should have its own callback route under /api/oauth/{service}/callback
 */

// Gmail OAuth callback
router.get('/oauth/gmail/callback', async (req, res) => {
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
        console.error('Error in Gmail OAuth callback:', error);
        const frontendUrl = process.env.FRONTEND_URL?.replace('https://verby.eu', 'https://www.verby.eu') || 'https://www.verby.eu';
        res.redirect(`${frontendUrl}/settings?error=auth_failed`);
    }
});

export const authRouter = router;
