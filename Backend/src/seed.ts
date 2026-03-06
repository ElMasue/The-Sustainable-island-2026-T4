import { supabase } from './supabase';

// script to populate the `water_sources` table with a fixed list of fountains
// whose coordinates match the real-world names (Canary Islands & Málaga).
//
// run via:
//    npx ts-node src/seed.ts
//
// The script assigns explicit integer `id` values because the table currently
// requires a non-null `id` and has no default.  If you later change the schema
// to use a serial/bigserial, you can remove the `id` field from the rows.

async function main() {
  if (!supabase) {
    console.error('no supabase client available');
    process.exit(1);
  }

  // hard-coded fountain entries matching the CSV used earlier
  const rows = [
    { id: 1, name: 'Fuente de la Plaza de España (Las Palmas)', latitude: 28.1240, longitude: -15.4325, description: 'Gran fuente monumental en la Plaza de España de Las Palmas', is_operational: true, rating: 4.7, is_free: true, category: 'Monumento' },
    { id: 2, name: 'Fuente de Santa Catalina', latitude: 28.1046, longitude: -15.4223, description: 'Fuente en el parque de Santa Catalina, junto a la zona de ocio', is_operational: true, rating: 4.3, is_free: true, category: 'Parque' },
    { id: 3, name: 'Fuente Luminosa', latitude: 28.4702, longitude: -16.2546, description: 'Famosa fuente musical de Santa Cruz de Tenerife', is_operational: true, rating: 4.8, is_free: true, category: 'Turística' },
    { id: 4, name: 'Fuente de la Candelaria', latitude: 28.4659, longitude: -16.2630, description: 'Pequeña fuente en la Iglesia de la Candelaria', is_operational: true, rating: 4.2, is_free: true, category: 'Iglesia' },
    { id: 5, name: 'Fuente de las Madres Franciscanas', latitude: 28.4831, longitude: -16.3196, description: 'Fuente histórica en La Laguna', is_operational: true, rating: 4.1, is_free: true, category: 'Histórica' },
    { id: 6, name: 'Fuente del Parque García Sanabria', latitude: 28.4673, longitude: -16.2568, description: 'Fuente central del parque más grande de Tenerife', is_operational: true, rating: 4.6, is_free: true, category: 'Parque' },
    { id: 7, name: 'Fuente del Drago', latitude: 28.3811, longitude: -16.7180, description: 'Ubicada en Icod de los Vinos junto al Drago Milenario', is_operational: true, rating: 4.5, is_free: true, category: 'Turística' },
    { id: 8, name: 'Fuente del Pino (Telde)', latitude: 27.8167, longitude: -15.3833, description: 'Fuente en la Plaza del Pino de Telde', is_operational: true, rating: 4.0, is_free: true, category: 'Plaza' },
    { id: 9, name: 'Fuente de los Almendreros (Arucas)', latitude: 28.1020, longitude: -15.5145, description: 'Fuente en el casco antiguo de Arucas', is_operational: true, rating: 4.4, is_free: true, category: 'Casco antiguo' },
    { id: 10, name: 'Fuente de Las Palomas', latitude: 27.9100, longitude: -15.3850, description: 'Fuente pública en Vecindario', is_operational: true, rating: 3.9, is_free: true, category: 'Local' },
    { id: 11, name: 'Fuente del Drago Viejo', latitude: 27.9320, longitude: -15.3520, description: 'Fuente tradicional en Agüimes', is_operational: true, rating: 4.1, is_free: true, category: 'Local' },
    { id: 12, name: 'Fuente de la Peña (Firgas)', latitude: 28.1063, longitude: -15.5328, description: 'Fountain en Firgas, al norte de Gran Canaria', is_operational: true, rating: 4.2, is_free: true, category: 'Local' },
    { id: 13, name: 'Fuente del Pino (Tejeda)', latitude: 28.0111, longitude: -15.5267, description: 'Pequeña fuente del pueblo de Tejeda', is_operational: true, rating: 4.0, is_free: true, category: 'Local' },
    { id: 14, name: 'Fuente de la Alameda (Puerto de la Cruz)', latitude: 28.4147, longitude: -16.5581, description: 'Fuente en la Alameda del Puerto', is_operational: true, rating: 4.3, is_free: true, category: 'Local' },
    { id: 15, name: 'Fuente del Loro', latitude: 28.0702, longitude: -15.4024, description: 'Fuente junto a un parque infantil en Agüimes', is_operational: true, rating: 3.8, is_free: true, category: 'Local' },
    { id: 16, name: 'Fuente de la Horca', latitude: 28.2060, longitude: -15.5530, description: 'Fuente histórica cercana al camino real de Artenara', is_operational: true, rating: 4.1, is_free: true, category: 'Local' },
    { id: 17, name: 'Fuente de las Siete Ramblas', latitude: 28.4660, longitude: -16.2520, description: 'Fuente monumental en las Ramblas de Santa Cruz', is_operational: true, rating: 4.5, is_free: true, category: 'Monumento' },
    { id: 18, name: 'Fuente del Carmen', latitude: 28.1361, longitude: -15.4356, description: 'Fuente en la Avenida de España de Las Palmas', is_operational: true, rating: 4.4, is_free: true, category: 'Local' },
    { id: 19, name: 'Fuente de La Noria', latitude: 28.1035, longitude: -15.3425, description: 'Pequeña fuente en Beaterio (Las Palmas)', is_operational: true, rating: 3.7, is_free: true, category: 'Local' },
    { id: 20, name: 'Fuente de la Vega', latitude: 28.1574, longitude: -15.4730, description: 'Fuente en un parque de Vecindario', is_operational: true, rating: 3.9, is_free: true, category: 'Local' },
    { id: 21, name: 'Fuente de la Constitución (Málaga)', latitude: 36.7201, longitude: -4.4203, description: 'Fuente central en la Plaza de la Constitución de Málaga', is_operational: true, rating: 4.8, is_free: true, category: 'Plaza' },
    { id: 22, name: 'Fuente de la Alcazaba', latitude: 36.7139, longitude: -4.4245, description: 'Fuente en los jardines de la Alcazaba', is_operational: true, rating: 4.7, is_free: true, category: 'Histórica' },
    { id: 23, name: 'Fuente del Parque de Málaga', latitude: 36.7447, longitude: -4.4259, description: 'Fuente principal del Parque de Málaga (Muelle Uno)', is_operational: true, rating: 4.6, is_free: true, category: 'Parque' },
    { id: 24, name: 'Fuente de la Merced', latitude: 36.7164, longitude: -4.4496, description: 'Fuente en la Plaza de la Merced junto a la casa natal de Picasso', is_operational: true, rating: 4.8, is_free: true, category: 'Plaza' },
    { id: 25, name: 'Fuente de la Constitución (Soho)', latitude: 36.7234, longitude: -4.4181, description: 'Fuente urbana en el barrio Soho', is_operational: true, rating: 4.3, is_free: true, category: 'Barrio' },
    { id: 26, name: 'Fuente del Huelin', latitude: 36.7138, longitude: -4.4556, description: 'Fuente en el Parque del Huelin', is_operational: true, rating: 4.0, is_free: true, category: 'Parque' },
    { id: 27, name: 'Fuente del Mercado', latitude: 36.7215, longitude: -4.4309, description: 'Fuente junto al Mercado de Atarazanas', is_operational: true, rating: 4.6, is_free: true, category: 'Local' },
    { id: 28, name: 'Fuente de Pedro Luis Alonso', latitude: 36.7376, longitude: -4.4272, description: 'Fuente alimentando los jardines de Pedro Luis Alonso', is_operational: true, rating: 4.0, is_free: true, category: 'Parque' },
    { id: 29, name: 'Fuente de la Romanilla', latitude: 36.7192, longitude: -4.4223, description: 'Fuente histórica en Plaza de la Constitución', is_operational: true, rating: 4.5, is_free: true, category: 'Histórica' },
    { id: 30, name: 'Fuente del Paseo del Parque', latitude: 36.7321, longitude: -4.4248, description: 'Fuente junto al Paseo del Parque y el Museo Picasso', is_operational: true, rating: 4.7, is_free: true, category: 'Turística' },
    { id: 31, name: 'Fuente de Guadalmar', latitude: 36.7220, longitude: -4.5093, description: 'Fuente en la zona de Guadalmar, cerca de la playa', is_operational: true, rating: 4.3, is_free: true, category: 'Costera' },
    { id: 32, name: 'Fuente de la Caleta', latitude: 36.7395, longitude: -4.4720, description: 'Fuente en el Parque del Oeste', is_operational: true, rating: 4.1, is_free: true, category: 'Parque' },
    { id: 33, name: 'Fuente de la Malagueta', latitude: 36.7391, longitude: -4.3558, description: 'Fuente junto al puerto deportivo de La Malagueta', is_operational: true, rating: 4.9, is_free: true, category: 'Costera' },
    { id: 34, name: 'Fuente del Barrio La Paz', latitude: 36.7051, longitude: -4.4829, description: 'Fuente en el barrio de la Paz', is_operational: true, rating: 4.0, is_free: true, category: 'Barrio' },
    { id: 35, name: 'Fuente de Puerto de la Torre', latitude: 36.7665, longitude: -4.4952, description: 'Fuente en el Parque de Puerto de la Torre', is_operational: true, rating: 4.3, is_free: true, category: 'Parque' },
    { id: 36, name: 'Fuente de los Naranjos', latitude: 36.7223, longitude: -4.4301, description: 'Fuente en la Plaza de los Naranjos, casco antiguo de Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Plaza' },
    { id: 37, name: 'Fuente de la Cuz', latitude: 36.7195, longitude: -4.4200, description: 'Fuente en el centro de Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Plaza' },
    { id: 38, name: 'Fuente de la Cuz 2', latitude: 36.7200, longitude: -4.4205, description: 'Segunda fuente céntrica en Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Plaza' },
    { id: 39, name: 'Fuente de la Cuz 3', latitude: 36.7205, longitude: -4.4210, description: 'Tercera fuente céntrica en Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Plaza' },
    { id: 40, name: 'Fuente de la Cuz 4', latitude: 36.7210, longitude: -4.4215, description: 'Cuarta fuente céntrica en Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Plaza' }
  ];

  const { data, error } = await supabase.from('water_sources').insert(rows);
  if (error) console.error('insert error', error);
  else console.log('inserted', data?.length, 'rows');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});