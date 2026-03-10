import type { Fountain } from '../types/fountain';

const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetches drinking water fountains from OpenStreetMap around a given location.
 * 
 * @param lat Latitude of the center point
 * @param lon Longitude of the center point
 * @param radiusSearch Radius in meters to search within (default: 5000m / 5km)
 * @returns Array of mapped Fountains
 */
export async function fetchOSMFountains(
    lat: number,
    lon: number,
    radiusSearch: number = 5000
): Promise<Fountain[]> {
    // Overpass QL query: Find nodes with amenity=drinking_water within radius of lat,lon
    const query = `
    [out:json][timeout:25];
    node["amenity"="drinking_water"](around:${radiusSearch},${lat},${lon});
    out body;
  `;

    const url = `${OVERPASS_API_URL}?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Overpass API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data || !data.elements) {
            return [];
        }

        // Map OSM nodes to our Fountain type
        return data.elements.map((node: any) => {
            // Use negative IDs for OSM nodes to avoid colliding with database IDs
            const mappedId = -node.id;

            return {
                id: mappedId,
                name: node.tags?.name || 'Public Fountain',
                latitude: node.lat,
                longitude: node.lon,
                description: 'Sourced from OpenStreetMap public data.',
                isOperational: node.tags?.operational_status !== 'closed',
                isFree: node.tags?.fee !== 'yes',
                category: 'Public',
            } as Fountain;
        });

    } catch (error) {
        console.error('Failed to fetch OSM fountains:', error);
        return []; // Return empty array on failure so we don't break the app
    }
}
