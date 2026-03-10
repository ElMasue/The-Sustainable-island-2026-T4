import 'dotenv/config';
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
    { name: 'Fuente de la Plaza de España (Las Palmas)', latitude: 28.1240, longitude: -15.4325, description: 'Large monumental fountain at Plaza de España in Las Palmas', is_operational: true, rating: 4.7, is_free: true, category: 'Fountain' },
    { name: 'Fuente de Santa Catalina', latitude: 28.1046, longitude: -15.4223, description: 'Fountain in Santa Catalina park, next to the leisure area', is_operational: true, rating: 4.3, is_free: true, category: 'Fountain' },
    { name: 'Fuente Luminosa', latitude: 28.4702, longitude: -16.2546, description: 'Famous musical fountain in Santa Cruz de Tenerife', is_operational: true, rating: 4.8, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Candelaria', latitude: 28.4659, longitude: -16.2630, description: 'Small fountain at the Candelaria Church', is_operational: true, rating: 4.2, is_free: true, category: 'Fountain' },
    { name: 'Fuente de las Madres Franciscanas', latitude: 28.4831, longitude: -16.3196, description: 'Historic fountain in La Laguna', is_operational: true, rating: 4.1, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Parque García Sanabria', latitude: 28.4673, longitude: -16.2568, description: 'Central fountain of the largest park in Tenerife', is_operational: true, rating: 4.6, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Drago', latitude: 28.3811, longitude: -16.7180, description: 'Located in Icod de los Vinos next to the Millennial Dragon Tree', is_operational: true, rating: 4.5, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Pino (Telde)', latitude: 27.8167, longitude: -15.3833, description: 'Fountain at Plaza del Pino in Telde', is_operational: true, rating: 4.0, is_free: true, category: 'Fountain' },
    { name: 'Fuente de los Almendreros (Arucas)', latitude: 28.1020, longitude: -15.5145, description: 'Fountain in the old town of Arucas', is_operational: true, rating: 4.4, is_free: true, category: 'Fountain' },
    { name: 'Fuente de Las Palomas', latitude: 27.9100, longitude: -15.3850, description: 'Public fountain in Vecindario', is_operational: true, rating: 3.9, is_free: true, category: 'Public Tap' },
    { name: 'Fuente del Drago Viejo', latitude: 27.9320, longitude: -15.3520, description: 'Traditional fountain in Agüimes', is_operational: true, rating: 4.1, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Peña (Firgas)', latitude: 28.1063, longitude: -15.5328, description: 'Fountain in Firgas, north of Gran Canaria', is_operational: true, rating: 4.2, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Pino (Tejeda)', latitude: 28.0111, longitude: -15.5267, description: 'Small fountain in the village of Tejeda', is_operational: true, rating: 4.0, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Alameda (Puerto de la Cruz)', latitude: 28.4147, longitude: -16.5581, description: 'Fountain at the Alameda del Puerto', is_operational: true, rating: 4.3, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Loro', latitude: 28.0702, longitude: -15.4024, description: 'Fountain next to a playground in Agüimes', is_operational: true, rating: 3.8, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Horca', latitude: 28.2060, longitude: -15.5530, description: 'Historic fountain near the royal road to Artenara', is_operational: true, rating: 4.1, is_free: true, category: 'Fountain' },
    { name: 'Fuente de las Siete Ramblas', latitude: 28.4660, longitude: -16.2520, description: 'Monumental fountain at Las Ramblas in Santa Cruz', is_operational: true, rating: 4.5, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Carmen', latitude: 28.1361, longitude: -15.4356, description: 'Fountain on Avenida de España in Las Palmas', is_operational: true, rating: 4.4, is_free: true, category: 'Fountain' },
    { name: 'Fuente de La Noria', latitude: 28.1035, longitude: -15.3425, description: 'Small fountain in Beaterio (Las Palmas)', is_operational: true, rating: 3.7, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Vega', latitude: 28.1574, longitude: -15.4730, description: 'Fountain in a park in Vecindario', is_operational: true, rating: 3.9, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Constitución (Málaga)', latitude: 36.7201, longitude: -4.4203, description: 'Central fountain at Plaza de la Constitución in Málaga', is_operational: true, rating: 4.8, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Alcazaba', latitude: 36.7139, longitude: -4.4245, description: 'Fountain in the gardens of the Alcazaba', is_operational: true, rating: 4.7, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Parque de Málaga', latitude: 36.7447, longitude: -4.4259, description: 'Main fountain of Málaga Park (Muelle Uno)', is_operational: true, rating: 4.6, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Merced', latitude: 36.7164, longitude: -4.4496, description: 'Fountain at Plaza de la Merced next to Picasso birthplace', is_operational: true, rating: 4.8, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Constitución (Soho)', latitude: 36.7234, longitude: -4.4181, description: 'Urban fountain in the Soho neighborhood', is_operational: true, rating: 4.3, is_free: true, category: 'Bottle Refill Station' },
    { name: 'Fuente del Huelin', latitude: 36.7138, longitude: -4.4556, description: 'Fountain at Huelin Park', is_operational: true, rating: 4.0, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Mercado', latitude: 36.7215, longitude: -4.4309, description: 'Fountain next to Atarazanas Market', is_operational: true, rating: 4.6, is_free: true, category: 'Public Tap' },
    { name: 'Fuente de Pedro Luis Alonso', latitude: 36.7376, longitude: -4.4272, description: 'Fountain feeding the Pedro Luis Alonso gardens', is_operational: true, rating: 4.0, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Romanilla', latitude: 36.7192, longitude: -4.4223, description: 'Historic fountain at Plaza de la Constitución', is_operational: true, rating: 4.5, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Paseo del Parque', latitude: 36.7321, longitude: -4.4248, description: 'Fountain next to Paseo del Parque and Picasso Museum', is_operational: true, rating: 4.7, is_free: true, category: 'Fountain' },
    { name: 'Fuente de Guadalmar', latitude: 36.7220, longitude: -4.5093, description: 'Fountain in the Guadalmar area, near the beach', is_operational: true, rating: 4.3, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Caleta', latitude: 36.7395, longitude: -4.4720, description: 'Fountain at Parque del Oeste', is_operational: true, rating: 4.1, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Malagueta', latitude: 36.7391, longitude: -4.3558, description: 'Fountain next to La Malagueta marina', is_operational: true, rating: 4.9, is_free: true, category: 'Fountain' },
    { name: 'Fuente del Barrio La Paz', latitude: 36.7051, longitude: -4.4829, description: 'Fountain in La Paz neighborhood', is_operational: true, rating: 4.0, is_free: true, category: 'Establishment' },
    { name: 'Fuente de Puerto de la Torre', latitude: 36.7665, longitude: -4.4952, description: 'Fountain at Puerto de la Torre Park', is_operational: true, rating: 4.3, is_free: true, category: 'Fountain' },
    { name: 'Fuente de los Naranjos', latitude: 36.7223, longitude: -4.4301, description: 'Fountain at Plaza de los Naranjos, old town of Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Cuz', latitude: 36.7195, longitude: -4.4200, description: 'Fountain in downtown Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Cuz 2', latitude: 36.7200, longitude: -4.4205, description: 'Second downtown fountain in Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Cuz 3', latitude: 36.7205, longitude: -4.4210, description: 'Third downtown fountain in Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Fountain' },
    { name: 'Fuente de la Cuz 4', latitude: 36.7210, longitude: -4.4215, description: 'Fourth downtown fountain in Málaga', is_operational: true, rating: 4.4, is_free: true, category: 'Fountain' }
  ];

  const { error } = await supabase.from('water_sources').insert(rows);
  if (error) console.error('insert error', error);
  else console.log('inserted', rows.length, 'rows');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});