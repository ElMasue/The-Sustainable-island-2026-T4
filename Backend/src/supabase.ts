import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export const supabase: SupabaseClient | null =
  url && serviceRoleKey ? createClient(url, serviceRoleKey) : null;

const TABLE = 'water_sources';

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
    isOperational: row.is_operational ?? true,
    isFree: row.is_free ?? undefined,
    images: row.images ?? undefined,
    category: row.category ?? undefined,
    useAdminPin: false,
  };
}

export async function getWaterSources(): Promise<WaterSourceResponse[]> {
  if (!supabase) return [];

  // select only columns that definitely exist in the current schema
  // the `images` column wasn’t actually present, so the previous query
  // returned an error and we silently swallowed it.  Log errors so we can
  // see what’s going wrong in future.
  const { data, error } = await supabase
    .from(TABLE)
    .select('id, name, latitude, longitude, description, rating, is_operational, is_free, category, images')
    .order('created_at', { ascending: false });
  // the original incarnation of the table had a `created_at` column, but the
  // current schema does not; ordering by a nonexistent column causes a 42703
  // error, so we simply omit the `order` clause for now (you can add specific
  // ordering later if you add a timestamp field or choose a different column).

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
