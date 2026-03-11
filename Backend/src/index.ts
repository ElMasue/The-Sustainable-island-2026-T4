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
import {
  getWaterSources,
  createWaterSource,
  updateWaterSource,
  addFountainInteraction,
  removeFountainInteraction,
  getUserInteractions,
  upsertWaterQualityRating,
  getUserRatingForFountain,
  getWaterQualityStats
} from './supabase';
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

// Interaction routes
app.get('/api/interactions/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const userId = req.query.userId as string;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId query parameter' });
    }

    if (type !== 'favorite' && type !== 'save') {
      return res.status(400).json({ error: 'Invalid interaction type' });
    }

    const interactions = await getUserInteractions(userId, type);
    res.json(interactions);
  } catch (e) {
    console.error('GET /api/interactions', e);
    res.status(500).json({ error: 'Failed to fetch interactions' });
  }
});

app.post('/api/interactions', async (req: Request, res: Response) => {
  try {
    const { userId, fountainId, interactionType, fountainName, fountainLat, fountainLon } = req.body;

    if (!userId || !fountainId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields: userId, fountainId, interactionType' });
    }

    const success = await addFountainInteraction({
      userId,
      fountainId: fountainId.toString(),
      interactionType,
      fountainName,
      fountainLat,
      fountainLon
    });

    if (!success) {
      return res.status(500).json({ error: 'Failed to add interaction' });
    }

    res.status(201).json({ message: 'Interaction added successfully' });
  } catch (e) {
    console.error('POST /api/interactions', e);
    res.status(500).json({ error: 'Failed to add interaction' });
  }
});

app.delete('/api/interactions', async (req: Request, res: Response) => {
  try {
    const { userId, fountainId, interactionType } = req.body;

    if (!userId || !fountainId || !interactionType) {
      return res.status(400).json({ error: 'Missing required fields: userId, fountainId, interactionType' });
    }

    const success = await removeFountainInteraction(userId, fountainId.toString(), interactionType);

    if (!success) {
      return res.status(500).json({ error: 'Failed to remove interaction' });
    }

    res.json({ message: 'Interaction removed successfully' });
  } catch (e) {
    console.error('DELETE /api/interactions', e);
    res.status(500).json({ error: 'Failed to remove interaction' });
  }
});

// Water Quality Rating routes
app.post('/api/water-quality-ratings', async (req: Request, res: Response) => {
  try {
    const { userId, fountainId, qualityRating, fountainName, fountainLat, fountainLon } = req.body;

    if (!userId || !fountainId || !qualityRating) {
      return res.status(400).json({ error: 'Missing required fields: userId, fountainId, qualityRating' });
    }

    if (qualityRating < 1 || qualityRating > 5) {
      return res.status(400).json({ error: 'qualityRating must be between 1 and 5' });
    }

    const result = await upsertWaterQualityRating({
      userId,
      fountainId: fountainId.toString(),
      qualityRating: qualityRating as 1 | 2 | 3 | 4 | 5,
      fountainName,
      fountainLat,
      fountainLon
    });

    if (!result) {
      return res.status(500).json({ error: 'Failed to save rating' });
    }

    console.log('POST /api/water-quality-ratings -> created/updated', result.id);
    res.status(201).json(result);
  } catch (e) {
    console.error('POST /api/water-quality-ratings', e);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

app.get('/api/water-quality-ratings/:fountainId', async (req: Request, res: Response) => {
  try {
    const fountainId = req.params.fountainId as string;

    if (!fountainId) {
      return res.status(400).json({ error: 'Missing fountainId parameter' });
    }

    const stats = await getWaterQualityStats(fountainId);

    if (!stats) {
      return res.status(500).json({ error: 'Failed to fetch water quality stats' });
    }

    res.json(stats);
  } catch (e) {
    console.error('GET /api/water-quality-ratings/:fountainId', e);
    res.status(500).json({ error: 'Failed to fetch water quality stats' });
  }
});

app.get('/api/water-quality-ratings/:fountainId/user/:userId', async (req: Request, res: Response) => {
  try {
    const fountainId = req.params.fountainId as string;
    const userId = req.params.userId as string;

    if (!fountainId || !userId) {
      return res.status(400).json({ error: 'Missing fountainId or userId parameter' });
    }

    const rating = await getUserRatingForFountain(userId, fountainId);

    if (!rating) {
      return res.status(404).json({ error: 'No rating found for this user and fountain' });
    }

    res.json(rating);
  } catch (e) {
    console.error('GET /api/water-quality-ratings/:fountainId/user/:userId', e);
    // 404 is expected when user hasn't rated yet
    res.status(404).json({ error: 'No rating found' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
