-- Add osm_node_id column to water_sources table
-- Using bigint to accommodate OSM node IDs (which can be large)
alter table public.water_sources 
add column if not exists osm_node_id bigint;

-- Add a unique constraint to prevent duplicate OSM node entries
alter table public.water_sources
add constraint water_sources_osm_node_id_key unique (osm_node_id);

-- Create an index for faster lookups by OSM node ID
create index if not exists water_sources_osm_node_id_idx on public.water_sources (osm_node_id);
