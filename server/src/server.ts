import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './integrations/supabase/client';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '8081', 10);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gmail OAuth callback endpoint
app.get('/auth/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!code || typeof code !== 'string') {
      throw new Error('Invalid code');
    }
    
    if (!session) {
      throw new Error('No active session');
    }
    
    // Store the Gmail connection
    const { error } = await supabase
      .from('gmail_connections')
      .insert({
        user_id: session.user.id,
        code,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error in Gmail callback:', error);
    res.status(500).json({ error: 'Failed to handle Gmail callback' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
