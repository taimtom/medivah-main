-- ============================================
-- MAVIDAH BLOG ENGAGEMENT SCHEMA
-- Comments, Replies, and Likes/Dislikes
-- ============================================

-- ============================================
-- 1. BLOG LIKES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL DEFAULT true, -- true = like, false = dislike
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure one reaction per user per blog
  UNIQUE(blog_id, user_id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON public.blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON public.blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_is_like ON public.blog_likes(is_like);

-- ============================================
-- 2. BLOG COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES public.blogs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Allow anonymous comments
  author_name VARCHAR(255) NOT NULL, -- For display (from user profile or guest input)
  author_email VARCHAR(255), -- Optional, for guest commenters
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.blog_comments(id) ON DELETE CASCADE, -- For replies
  status VARCHAR(50) DEFAULT 'pending', -- pending, approved, spam, deleted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON public.blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON public.blog_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON public.blog_comments(status);

-- ============================================
-- 3. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BLOG LIKES POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view likes" ON public.blog_likes;
DROP POLICY IF EXISTS "Authenticated users can add likes" ON public.blog_likes;
DROP POLICY IF EXISTS "Users can update their own likes" ON public.blog_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON public.blog_likes;

-- Anyone can view likes (for public blog posts)
CREATE POLICY "Anyone can view likes"
  ON public.blog_likes
  FOR SELECT
  USING (true);

-- Authenticated users can add likes
CREATE POLICY "Authenticated users can add likes"
  ON public.blog_likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own likes (change from like to dislike or vice versa)
CREATE POLICY "Users can update their own likes"
  ON public.blog_likes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own likes
CREATE POLICY "Users can delete their own likes"
  ON public.blog_likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- BLOG COMMENTS POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Anyone can add comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can update any comment" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can delete any comment" ON public.blog_comments;

-- Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments"
  ON public.blog_comments
  FOR SELECT
  USING (status = 'approved');

-- Anyone can add comments (both authenticated and anonymous)
CREATE POLICY "Anyone can add comments"
  ON public.blog_comments
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON public.blog_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.blog_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users (admins) can view all comments
CREATE POLICY "Authenticated users can view all comments"
  ON public.blog_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users (admins) can update any comment (for moderation)
CREATE POLICY "Authenticated users can update any comment"
  ON public.blog_comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users (admins) can delete any comment
CREATE POLICY "Authenticated users can delete any comment"
  ON public.blog_comments
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- 4. HELPER FUNCTIONS
-- ============================================

-- Function to get like/dislike counts for a blog
CREATE OR REPLACE FUNCTION get_blog_engagement_stats(blog_uuid UUID)
RETURNS TABLE (
  likes_count BIGINT,
  dislikes_count BIGINT,
  comments_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(CASE WHEN is_like = true THEN 1 END) as likes_count,
    COUNT(CASE WHEN is_like = false THEN 1 END) as dislikes_count,
    (SELECT COUNT(*) FROM public.blog_comments WHERE blog_id = blog_uuid AND status = 'approved') as comments_count
  FROM public.blog_likes
  WHERE blog_id = blog_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to get top liked blogs
CREATE OR REPLACE FUNCTION get_top_liked_blogs(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  blog_id UUID,
  blog_title TEXT,
  likes_count BIGINT,
  dislikes_count BIGINT,
  net_likes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as blog_id,
    b.title as blog_title,
    COUNT(CASE WHEN bl.is_like = true THEN 1 END) as likes_count,
    COUNT(CASE WHEN bl.is_like = false THEN 1 END) as dislikes_count,
    COUNT(CASE WHEN bl.is_like = true THEN 1 END) - COUNT(CASE WHEN bl.is_like = false THEN 1 END) as net_likes
  FROM public.blogs b
  LEFT JOIN public.blog_likes bl ON b.id = bl.blog_id
  WHERE b.status = 'published'
  GROUP BY b.id, b.title
  ORDER BY net_likes DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. UPDATED_AT TRIGGERS
-- ============================================

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
DROP TRIGGER IF EXISTS update_blog_likes_updated_at ON public.blog_likes;
CREATE TRIGGER update_blog_likes_updated_at
  BEFORE UPDATE ON public.blog_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON public.blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON public.blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- END OF SCHEMA
-- ============================================

-- To apply this schema:
-- 1. Go to Supabase Dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute

