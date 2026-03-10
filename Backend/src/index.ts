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
import { getWaterSources, createWaterSource } from './supabase';

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

app.post('/api/fountains', async (req: Request, res: Response) => {
  try {
    const { name, latitude, longitude, description, rating, isOperational, isFree, category, images, userId } = req.body;
    
    if (!name || latitude === undefined || longitude === undefined || !userId) {
      return res.status(400).json({ error: 'Missing required fields: name, latitude, longitude, userId' });
    }

    const result = await createWaterSource({
      name,
      latitude,
      longitude,
      description,
      rating,
      isOperational,
      isFree,
      category,
      images,
      userId,
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to create fountain' });
    }

    console.log('POST /api/fountains -> created', result.id);
    res.status(201).json(result);
  } catch (e) {
    console.error('POST /api/fountains', e);
    res.status(500).json({ error: 'Failed to create fountain' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
