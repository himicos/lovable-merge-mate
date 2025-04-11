import express from 'express';
import cors from 'cors';
import { gmailRouter } from './routes/gmail.js';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://www.verby.eu',
    'https://verby.eu',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/gmail', gmailRouter);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
