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
import { getWaterSources, createWaterSource, updateWaterSource } from './supabase';
import { fetchOSMFountains } from './osmService';

app.get('/api/fountains', async (req: Request, res: Response) => {
  try {
    const lat = req.query.lat ? parseFloat(req.query.lat as string) : undefined;
    const lon = req.query.lon ? parseFloat(req.query.lon as string) : undefined;
    const radius = req.query.radius ? parseInt(req.query.radius as string, 10) : 30000;

    const dbFountains = await getWaterSources();
    console.log('GET /api/fountains (DB) ->', dbFountains.length, 'rows');

    let osmFountains: any[] = [];
    if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
      osmFountains = await fetchOSMFountains(lat, lon, radius);
      console.log('GET /api/fountains (OSM User Location) ->', osmFountains.length, 'rows');
    } else {
      // Default to Gran Canaria if no coords provided
      osmFountains = await fetchOSMFountains(28.1235, -15.4363, radius);
      console.log('GET /api/fountains (OSM Default Location) ->', osmFountains.length, 'rows');
    }

    const allFountains = [...dbFountains, ...osmFountains];
    res.json(allFountains);
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

app.put('/api/fountains/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, latitude, longitude, description, rating, isOperational, isFree, category, images, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing required field: userId' });
    }

    const result = await updateWaterSource({
      id: id as string,
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
      return res.status(404).json({ error: 'Failed to update fountain or unauthorized' });
    }

    console.log('PUT /api/fountains -> updated', result.id);
    res.json(result);
  } catch (e) {
    console.error('PUT /api/fountains', e);
    res.status(500).json({ error: 'Failed to update fountain' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
