-- Migration: Add email support to blog_likes table
-- This allows users to like posts without authentication using their email

-- Step 1: Add email column to blog_likes table
ALTER TABLE blog_likes 
  ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);

-- Step 2: Make user_id nullable (since we now support email-based likes)
ALTER TABLE blog_likes 
  ALTER COLUMN user_id DROP NOT NULL;

-- Step 3: Update the unique constraint to allow either user_id OR user_email
-- First, drop the existing unique constraint
ALTER TABLE blog_likes 
  DROP CONSTRAINT IF EXISTS blog_likes_blog_id_user_id_key;

-- Create separate unique constraints for user_id and user_email
-- This ensures one like per blog per user (either by user_id or email)
CREATE UNIQUE INDEX IF NOT EXISTS blog_likes_blog_user_id_unique 
  ON blog_likes(blog_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS blog_likes_blog_user_email_unique 
  ON blog_likes(blog_id, user_email)
  WHERE user_email IS NOT NULL;

-- For better query performance, create separate indexes
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_email ON blog_likes(user_email);
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_email ON blog_likes(blog_id, user_email);

-- Step 4: Update RLS policies to allow anonymous email-based likes
DROP POLICY IF EXISTS "Authenticated users can add likes" ON blog_likes;
DROP POLICY IF EXISTS "Users can update their own likes" ON blog_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON blog_likes;

-- Allow anyone to insert likes (with email or user_id)
CREATE POLICY "Anyone can add likes" ON blog_likes
  FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own likes (by user_id or email)
CREATE POLICY "Users can update their own likes" ON blog_likes
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (user_email IS NOT NULL)
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (user_email IS NOT NULL)
  );

-- Allow users to delete their own likes (by user_id or email)
CREATE POLICY "Users can delete their own likes" ON blog_likes
  FOR DELETE
  USING (
    (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
    (user_email IS NOT NULL)
  );

-- Step 5: Update newsletter_subscribers source constraint to allow 'like'
ALTER TABLE newsletter_subscribers 
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_source_check;

ALTER TABLE newsletter_subscribers 
  ADD CONSTRAINT newsletter_subscribers_source_check 
  CHECK (source IN ('manual', 'purchase', 'signup', 'like'));
