import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'The Sustainable Island API - Water Fountains',
    version: '1.0.0'
  });
});

// Water fountains routes (fetch from Supabase)
import { getWaterSources } from './supabase';

app.get('/api/fountains', async (req: Request, res: Response) => {
  try {
    const data = await getWaterSources();
    console.log('GET /api/fountains ->', data.length, 'rows');
    res.json(data);
  } catch (e) {
    console.error('GET /api/fountains', e);
    res.status(500).json({ error: 'Failed to fetch fountains' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
