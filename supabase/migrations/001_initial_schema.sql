-- supabase/migrations/001_initial_schema.sql
-- Spusť v Supabase SQL Editoru nebo přes: supabase db push

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── subscribers ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.subscribers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel         TEXT NOT NULL CHECK (channel IN ('telegram','whatsapp','push')),
  contact         TEXT NOT NULL,
  kp_threshold    INTEGER NOT NULL DEFAULT 4 CHECK (kp_threshold BETWEEN 1 AND 9),
  active          BOOLEAN NOT NULL DEFAULT TRUE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  location_lat    NUMERIC,
  location_lng    NUMERIC,
  UNIQUE (channel, contact)
);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subscribers_own" ON public.subscribers
  FOR ALL USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "subscribers_service_read" ON public.subscribers
  FOR SELECT TO service_role USING (TRUE);

-- ── aurora_cache ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.aurora_cache (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fetched_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  kp_current  NUMERIC NOT NULL,
  bz          NUMERIC,
  sw_speed    NUMERIC,
  sw_density  NUMERIC,
  payload     JSONB NOT NULL
);

CREATE INDEX aurora_cache_fetched_at_idx ON public.aurora_cache (fetched_at DESC);

ALTER TABLE public.aurora_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cache_public_read" ON public.aurora_cache FOR SELECT USING (TRUE);
CREATE POLICY "cache_service_write" ON public.aurora_cache FOR INSERT TO service_role WITH CHECK (TRUE);

CREATE OR REPLACE FUNCTION public.cleanup_aurora_cache(keep_rows INTEGER DEFAULT 100)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM public.aurora_cache
  WHERE id NOT IN (
    SELECT id FROM public.aurora_cache
    ORDER BY fetched_at DESC
    LIMIT keep_rows
  );
END;
$$;

-- ── alert_log ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.alert_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  channel     TEXT NOT NULL,
  recipient   TEXT NOT NULL,
  kp_at_send  NUMERIC NOT NULL,
  message     TEXT,
  success     BOOLEAN NOT NULL,
  error       TEXT
);

CREATE INDEX alert_log_sent_at_idx   ON public.alert_log (sent_at DESC);
CREATE INDEX alert_log_recipient_idx ON public.alert_log (recipient, sent_at DESC);

ALTER TABLE public.alert_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alert_log_service_only" ON public.alert_log
  FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

-- ── community_photos ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.community_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,
  thumb_path    TEXT,
  location      TEXT,
  kp_at_time    NUMERIC,
  lat           NUMERIC,
  lng           NUMERIC,
  approved      BOOLEAN NOT NULL DEFAULT FALSE,
  likes         INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE public.community_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_public_read"  ON public.community_photos FOR SELECT USING (approved = TRUE);
CREATE POLICY "photos_own_insert"   ON public.community_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photos_own_delete"   ON public.community_photos FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "photos_admin_all"    ON public.community_photos FOR ALL TO service_role USING (TRUE);

-- ── profiles ─────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE,
  avatar_url  TEXT,
  level       TEXT NOT NULL DEFAULT 'beginner' CHECK (level IN ('beginner','intermediate','expert')),
  points      INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_public_read" ON public.profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_own_update"  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Storage (spusť ručně v Supabase Dashboard) ───────────────────────────────
-- INSERT INTO storage.buckets (id, name, public) VALUES ('aurora-photos', 'aurora-photos', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- CREATE POLICY "photos_public" ON storage.objects FOR SELECT USING (bucket_id = 'aurora-photos');
-- CREATE POLICY "photos_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'aurora-photos' AND auth.role() = 'authenticated');
