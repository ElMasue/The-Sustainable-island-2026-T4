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
  created_at?: string;
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
    // request all fields we need; you can also use '*' to grab everything
    .select('id, name, latitude, longitude, description, rating, is_operational, is_free, category');
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
