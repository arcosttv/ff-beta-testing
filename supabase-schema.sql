-- ============================================================
-- GUILD BETA TEST KANBAN BOARD - SUPABASE DATABASE SCHEMA
-- ============================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/flzrrlizvizikfhkzhpi/sql/new)

-- 1. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'To Test', -- 'To Test', 'In Progress', 'Result', 'Failed'
  priority TEXT DEFAULT 'Normal', -- 'Urgent', 'High', 'Normal', 'Low'
  assigned_to TEXT DEFAULT '',
  created_by TEXT DEFAULT 'Guild Member',
  feedback_notes TEXT DEFAULT '',
  media_url TEXT DEFAULT '',
  bugs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Discord Logins Audit Table (For tracking verified Discord members)
CREATE TABLE IF NOT EXISTS public.discord_logins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  discord_username TEXT NOT NULL,
  discord_id TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  email TEXT DEFAULT '',
  logged_in_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discord_logins ENABLE ROW LEVEL SECURITY;

-- 4. Create Public Access Policy for Guild Testers
DROP POLICY IF EXISTS "Public access for guild testers" ON public.tasks;
CREATE POLICY "Public access for guild testers" ON public.tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access for discord logins" ON public.discord_logins;
CREATE POLICY "Public access for discord logins" ON public.discord_logins FOR ALL USING (true) WITH CHECK (true);

-- 5. Enable Supabase Realtime Publication for Tasks & Logins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'discord_logins'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.discord_logins;
  END IF;
END $$;
