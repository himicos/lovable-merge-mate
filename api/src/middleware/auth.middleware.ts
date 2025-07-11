import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/auth.service.js';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
            };
        }
    }
}

const authService = new AuthService();

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
    }

    const user = authService.verifyAccessToken(token);
    if (!user) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }

    req.user = user;
    next();
};

export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const user = authService.verifyAccessToken(token);
        if (user) {
            req.user = user;
        }
    }

    next();
};

export const requireEmailVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    try {
        const user = await authService.getUser(req.user.userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        if (!user.email_verified) {
            res.status(403).json({ error: 'Email verification required' });
            return;
        }

        next();
    } catch (error) {
        console.error('Email verification check error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}; 