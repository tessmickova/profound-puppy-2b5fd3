-- supabase/migrations/003_sightings_location.sql
-- Add latitude/longitude to sightings for map pin display

ALTER TABLE public.sightings
  ADD COLUMN IF NOT EXISTS lat NUMERIC,
  ADD COLUMN IF NOT EXISTS lon NUMERIC;

-- Index for location-based queries
CREATE INDEX IF NOT EXISTS sightings_location_idx
  ON public.sightings (lat, lon)
  WHERE lat IS NOT NULL AND lon IS NOT NULL;
