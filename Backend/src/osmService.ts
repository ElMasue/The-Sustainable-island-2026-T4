const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Simple in-memory cache to avoid rate-limiting Overpass API
// Key format: `{roundedLat},{roundedLon},{radius}` -> data
const osmCache = new Map<string, { timestamp: number; data: any[] }>();
const CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour
const COORD_ROUNDING = 2; // ~1.1km precision for cache bucketing

export async function fetchOSMFountains(lat: number, lon: number, radiusSearch: number = 30000): Promise<any[]> {
    // Create a cache key by rounding coordinates so nearby requests share the cache
    const latStr = lat.toFixed(COORD_ROUNDING);
    const lonStr = lon.toFixed(COORD_ROUNDING);
    const cacheKey = `${latStr},${lonStr},${radiusSearch}`;

    const cached = osmCache.get(cacheKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
        console.log(`[OSM Cache Hit] Returning cached OSM fountains for ${cacheKey}`);
        return cached.data;
    }

    // Overpass QL query: Find nodes with amenity=drinking_water within radius of lat,lon
    const query = `
    [out:json][timeout:25];
    node["amenity"="drinking_water"](around:${radiusSearch},${lat},${lon});
    out body;
  `;

    const url = `${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`;

    try {
        console.log(`[OSM Fetch] Requesting OSM fountains for ${cacheKey} from Overpass API...`);
        // We use global fetch if available (Node 18+), else need node-fetch
        // But checking if fetch exists
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = (await response.json()) as any;

        if (!data || !data.elements) {
            return [];
        }

        // Map OSM nodes to our Fountain type
        const mappedFountains = data.elements.map((node: any) => {
            const tags = node.tags || {};
            // Use negative IDs for OSM nodes to avoid colliding with database UUIDs or positive IDs
            const mappedId = -node.id;

            let name = tags.name;
            if (!name) {
                if (tags['addr:street']) name = `Fountain on ${tags['addr:street']}`;
                else if (tags.location) name = `Fountain (${tags.location})`;
                else name = 'Public Fountain';
            }

            let descriptionParts = [];
            if (tags.description) descriptionParts.push(tags.description);
            if (tags.operator) descriptionParts.push(`Operated by: ${tags.operator}`);
            if (tags['addr:street'] && !name.includes(tags['addr:street'])) {
                descriptionParts.push(`Address: ${tags['addr:street']}${tags['addr:city'] ? ', ' + tags['addr:city'] : ''}`);
            }
            if (tags.note) descriptionParts.push(`Note: ${tags.note}`);

            let description = descriptionParts.length > 0
                ? descriptionParts.join(' | ')
                : 'Sourced from OpenStreetMap public data.';

            return {
                id: mappedId.toString(),
                name,
                latitude: node.lat,
                longitude: node.lon,
                description,
                isOperational: tags.operational_status !== 'closed',
                isFree: tags.fee !== 'no',
                category: 'Public',
            };
        });

        // Store in cache
        osmCache.set(cacheKey, {
            timestamp: now,
            data: mappedFountains
        });

        console.log(`[OSM Fetch] Retrieved ${mappedFountains.length} fountains from OSM.`);
        return mappedFountains;
    } catch (error) {
        console.error('Failed to fetch OSM fountains:', error);
        // On error, try to return stale cache if available, else empty array
        if (cached) {
            console.log(`[OSM Cache Fallback] Returning stale cache due to error.`);
            return cached.data;
        }
        return [];
    }
}
