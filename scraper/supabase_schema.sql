-- ==========================================================================
-- AETHERNEWS - Supabase Database Schema
-- Run this in your Supabase SQL Editor to initialize the database table.
-- ==========================================================================

-- To add video_url to an existing posts table, run:
-- ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS video_url TEXT;

-- 1. Create the posts table
CREATE TABLE IF NOT EXISTS public.posts (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    category TEXT NOT NULL,
    seo_description TEXT,
    source_url TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create index on source_url for quick duplicate lookups
CREATE INDEX IF NOT EXISTS idx_posts_source_url ON public.posts(source_url);

-- 3. Create index on category for fast frontend sidebar filtering
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);

-- 4. Create index on created_at for chronological article sorting
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 6. Create Policy to allow public read-only access (for Next.js dynamic routing)
CREATE POLICY "Allow public read access" 
ON public.posts 
FOR SELECT 
USING (true);

-- 7. Create Policy to allow service_role write access (for scraper automation)
-- Note: Service role bypasses RLS by default, but this policy explicitly permits insert operations.
CREATE POLICY "Allow write access for authenticated role" 
ON public.posts 
FOR INSERT 
TO authenticated, service_role
WITH CHECK (true);
