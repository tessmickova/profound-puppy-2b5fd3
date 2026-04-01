-- supabase/migrations/002_sightings.sql
-- Community aurora sightings — "Viděl jsem" / "Vyfotil jsem" reports

CREATE TABLE IF NOT EXISTS public.sightings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  night_date  DATE NOT NULL,  -- the observation night (date of sunset)
  type        TEXT NOT NULL CHECK (type IN ('seen', 'photo')),
  kp_at_time  NUMERIC,
  bz_at_time  NUMERIC,
  fingerprint TEXT NOT NULL,  -- anonymous browser fingerprint to prevent duplicates
  UNIQUE (night_date, type, fingerprint)
);

CREATE INDEX sightings_night_date_idx ON public.sightings (night_date DESC);

ALTER TABLE public.sightings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sightings_public_read" ON public.sightings FOR SELECT USING (TRUE);
CREATE POLICY "sightings_anon_insert" ON public.sightings FOR INSERT WITH CHECK (TRUE);

-- View: aggregated counts per night
CREATE OR REPLACE VIEW public.sightings_summary AS
SELECT
  night_date,
  COUNT(*) FILTER (WHERE type = 'seen')  AS seen_count,
  COUNT(*) FILTER (WHERE type = 'photo') AS photo_count,
  AVG(kp_at_time)::NUMERIC(3,1)          AS avg_kp
FROM public.sightings
GROUP BY night_date
ORDER BY night_date DESC;

-- Cleanup: remove sightings older than 90 days
CREATE OR REPLACE FUNCTION public.cleanup_old_sightings()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.sightings WHERE night_date < CURRENT_DATE - INTERVAL '90 days';
END;
$$;
