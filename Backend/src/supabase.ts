import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const supabase: SupabaseClient | null =
  url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;

const TABLE = 'water_sources';
const INTERACTIONS_TABLE = 'user_fountain_interactions';


export interface WaterSourceRow {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string | null;
  rating: number | null;
  is_operational: boolean;
  is_free: boolean | null;
  category: string | null;
  images?: string[] | null;
  user_id?: string | null;
  created_at?: string;
}

export interface CreateWaterSourceInput {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  rating?: number;
  isOperational?: boolean;
  isFree?: boolean;
  category?: string;
  images?: string[];
  userId: string;
}

export interface WaterSourceResponse {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  rating?: number;
  isOperational: boolean;
  isFree?: boolean;
  category?: string;
  images?: string[];
  userId?: string;
  useAdminPin: false;
}

function toResponse(row: WaterSourceRow): WaterSourceResponse {
  return {
    id: row.id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    description: row.description ?? undefined,
    rating: row.rating ?? undefined,
    isOperational: row.is_operational,
    isFree: row.is_free ?? undefined,
    images: row.images ?? undefined,
    category: row.category ?? undefined,
    userId: row.user_id ?? undefined,
    useAdminPin: false,
  };
}

export async function getWaterSources(): Promise<WaterSourceResponse[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, latitude, longitude, description, rating, is_operational, is_free, category, images, user_id');
  // The original incarnation of the table had a `created_at` column, but the
  // current schema does not; ordering by a nonexistent column causes a 42703
  // error.

  if (error) {
    console.error('supabase getWaterSources error', error);
    return [];
  }
  if (!data) {
    console.warn('supabase getWaterSources returned no data');
    return [];
  }

  const rows = data as WaterSourceRow[];
  return rows.map(toResponse);
}

export async function createWaterSource(input: CreateWaterSourceInput): Promise<WaterSourceResponse | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  const row = {
    name: input.name,
    latitude: input.latitude,
    longitude: input.longitude,
    description: input.description ?? null,
    rating: input.rating ?? null,
    is_operational: input.isOperational ?? true,
    is_free: input.isFree ?? true,
    category: input.category ?? null,
    images: input.images ?? null,
    user_id: input.userId,
  };

  const { data, error } = await supabase
    .from(TABLE)
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('supabase createWaterSource error', error);
    return null;
  }

  if (!data) {
    console.warn('supabase createWaterSource returned no data');
    return null;
  }

  return toResponse(data as WaterSourceRow);
}

export interface UpdateWaterSourceInput {
  id: string;
  name?: string;
  latitude?: number;
  longitude?: number;
  description?: string | null;
  rating?: number | null;
  isOperational?: boolean;
  isFree?: boolean | null;
  category?: string | null;
  images?: string[] | null;
  userId: string; // The user ID making the request, to ensure ownership
}

export async function updateWaterSource(input: UpdateWaterSourceInput): Promise<WaterSourceResponse | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  // Create update object with only provided fields
  const row: Partial<WaterSourceRow> = {};
  if (input.name !== undefined) row.name = input.name;
  if (input.latitude !== undefined) row.latitude = input.latitude;
  if (input.longitude !== undefined) row.longitude = input.longitude;
  if (input.description !== undefined) row.description = input.description;
  if (input.rating !== undefined) row.rating = input.rating;
  if (input.isOperational !== undefined) row.is_operational = input.isOperational;
  if (input.isFree !== undefined) row.is_free = input.isFree;
  if (input.category !== undefined) row.category = input.category;
  if (input.images !== undefined) row.images = input.images;

  // We add user_id to the match query below to ensure they can only update their own fountains
  const { data, error } = await supabase
    .from(TABLE)
    .update(row)
    .match({ id: input.id, user_id: input.userId })
    .select()
    .single();

  if (error) {
    console.error('supabase updateWaterSource error', error);
    return null;
  }

  if (!data) {
    console.warn('supabase updateWaterSource returned no data (possibly wrong user)');
    return null;
  }

  return toResponse(data as WaterSourceRow);
}

export interface FountainInteractionInput {
  userId: string;
  fountainId: string;
  interactionType: 'favorite' | 'save';
  fountainName?: string;
  fountainLat?: number;
  fountainLon?: number;
}

export async function addFountainInteraction(input: FountainInteractionInput): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from(INTERACTIONS_TABLE)
    .insert({
      user_id: input.userId,
      fountain_id: input.fountainId,
      interaction_type: input.interactionType,
      fountain_name: input.fountainName,
      fountain_lat: input.fountainLat,
      fountain_lon: input.fountainLon
    });

  if (error) {
    // If it's a unique constraint violation (code 23505), it already exists, so it's fine.
    if (error.code !== '23505') {
      console.error('supabase addFountainInteraction error', error);
      return false;
    }
  }
  return true;
}

export async function removeFountainInteraction(userId: string, fountainId: string, interactionType: 'favorite' | 'save'): Promise<boolean> {
  if (!supabase) return false;

  const { error } = await supabase
    .from(INTERACTIONS_TABLE)
    .delete()
    .match({ user_id: userId, fountain_id: fountainId, interaction_type: interactionType });

  if (error) {
    console.error('supabase removeFountainInteraction error', error);
    return false;
  }
  return true;
}

// Minimal interface for returning the UI data from interactions
export interface InteractionResponse {
  fountainId: string;
  interactionType: 'favorite' | 'save';
  fountainName: string | null;
  fountainLat: number | null;
  fountainLon: number | null;
  createdAt: string;
}

export async function getUserInteractions(userId: string, interactionType?: 'favorite' | 'save'): Promise<InteractionResponse[]> {
  if (!supabase) return [];

  let query = supabase
    .from(INTERACTIONS_TABLE)
    .select('fountain_id, interaction_type, fountain_name, fountain_lat, fountain_lon, created_at')
    .eq('user_id', userId);

  if (interactionType) {
    query = query.eq('interaction_type', interactionType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('supabase getUserInteractions error', error);
    return [];
  }

  if (!data) return [];

  return data.map((row: any) => ({
    fountainId: row.fountain_id,
    interactionType: row.interaction_type,
    fountainName: row.fountain_name,
    fountainLat: row.fountain_lat,
    fountainLon: row.fountain_lon,
    createdAt: row.created_at
  }));
}

// ==================== Water Quality Ratings ====================
const RATINGS_TABLE = 'water_quality_ratings';

export interface WaterQualityRatingInput {
  userId: string;
  fountainId: string;
  qualityRating: 1 | 2 | 3 | 4 | 5; // bad, poor, ok, good, excellent
  fountainName?: string;
  fountainLat?: number;
  fountainLon?: number;
}

export interface WaterQualityRatingResponse {
  id: string;
  userId: string;
  fountainId: string;
  qualityRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface WaterQualityStatsResponse {
  averageRating: number;
  totalRatings: number;
  distribution: {
    bad: number;      // 1
    poor: number;     // 2
    ok: number;       // 3
    good: number;     // 4
    excellent: number; // 5
  };
}

/**
 * Adds or updates a user's water quality rating for a fountain
 * Uses upsert to handle both create and update cases
 */
export async function upsertWaterQualityRating(input: WaterQualityRatingInput): Promise<WaterQualityRatingResponse | null> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return null;
  }

  const row = {
    user_id: input.userId,
    fountain_id: input.fountainId,
    quality_rating: input.qualityRating,
    fountain_name: input.fountainName ?? null,
    fountain_lat: input.fountainLat ?? null,
    fountain_lon: input.fountainLon ?? null,
  };

  const { data, error } = await supabase
    .from(RATINGS_TABLE)
    .upsert(row, { onConflict: 'user_id,fountain_id' })
    .select()
    .single();

  if (error) {
    console.error('supabase upsertWaterQualityRating error', error);
    return null;
  }

  if (!data) {
    console.warn('supabase upsertWaterQualityRating returned no data');
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    fountainId: data.fountain_id,
    qualityRating: data.quality_rating,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Gets a specific user's rating for a fountain
 */
export async function getUserRatingForFountain(userId: string, fountainId: string): Promise<WaterQualityRatingResponse | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(RATINGS_TABLE)
    .select('id, user_id, fountain_id, quality_rating, created_at, updated_at')
    .eq('user_id', userId)
    .eq('fountain_id', fountainId)
    .single();

  if (error) {
    // If no rating exists, error code is PGRST116
    if (error.code === 'PGRST116') return null;
    console.error('supabase getUserRatingForFountain error', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    fountainId: data.fountain_id,
    qualityRating: data.quality_rating,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Gets water quality statistics for a fountain
 * Calculates average rating, total ratings, and distribution
 */
export async function getWaterQualityStats(fountainId: string): Promise<WaterQualityStatsResponse | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(RATINGS_TABLE)
    .select('quality_rating')
    .eq('fountain_id', fountainId);

  if (error) {
    console.error('supabase getWaterQualityStats error', error);
    return null;
  }

  if (!data || data.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      distribution: {
        bad: 0,
        poor: 0,
        ok: 0,
        good: 0,
        excellent: 0,
      },
    };
  }

  const ratings = data.map((r: any) => r.quality_rating);
  const totalRatings = ratings.length;
  const sum = ratings.reduce((acc: number, val: number) => acc + val, 0);
  const averageRating = sum / totalRatings;

  const distribution = {
    bad: ratings.filter((r: number) => r === 1).length,
    poor: ratings.filter((r: number) => r === 2).length,
    ok: ratings.filter((r: number) => r === 3).length,
    good: ratings.filter((r: number) => r === 4).length,
    excellent: ratings.filter((r: number) => r === 5).length,
  };

  return {
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    totalRatings,
    distribution,
  };
}


