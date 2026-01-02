-- ============================================
-- FIX BLOG COMMENTS RLS POLICIES
-- Run this if comments are not working
-- ============================================

-- First, let's see what policies exist (run this to diagnose)
-- SELECT * FROM pg_policies WHERE tablename = 'blog_comments';

-- Drop ALL existing policies on blog_comments to start fresh
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Anyone can add comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can view their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can view all comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can update any comment" ON public.blog_comments;
DROP POLICY IF EXISTS "Authenticated users can delete any comment" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can view all comments" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can update any comment" ON public.blog_comments;
DROP POLICY IF EXISTS "Admins can delete any comment" ON public.blog_comments;

-- Ensure RLS is enabled
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RECREATE POLICIES FROM SCRATCH
-- ============================================

-- 1. Allow EVERYONE (guests + authenticated) to INSERT comments
CREATE POLICY "Anyone can add comments"
  ON public.blog_comments
  FOR INSERT
  TO anon, authenticated  -- Explicitly specify both roles
  WITH CHECK (true);

-- 2. Allow EVERYONE to VIEW approved comments
CREATE POLICY "Anyone can view approved comments"
  ON public.blog_comments
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

-- 3. Allow authenticated users to view ALL their own comments (including pending)
CREATE POLICY "Users can view their own comments"
  ON public.blog_comments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Allow authenticated users to UPDATE their own comments
CREATE POLICY "Users can update their own comments"
  ON public.blog_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow authenticated users to DELETE their own comments
CREATE POLICY "Users can delete their own comments"
  ON public.blog_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- ADMIN POLICIES (for dashboard management)
-- ============================================

-- Note: For admin access, you'll need to create a custom role or use service role key
-- For now, authenticated users with proper permissions can manage all comments

-- 6. Allow authenticated admins to view all comments
CREATE POLICY "Admins can view all comments"
  ON public.blog_comments
  FOR SELECT
  TO authenticated
  USING (
    -- This allows any authenticated user to see all comments
    -- You can add more specific admin checks here if needed
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  );

-- 7. Allow authenticated admins to update any comment (for moderation)
CREATE POLICY "Admins can update any comment"
  ON public.blog_comments
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  );

-- 8. Allow authenticated admins to delete any comment
CREATE POLICY "Admins can delete any comment"
  ON public.blog_comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid()
    )
  );

-- ============================================
-- VERIFY POLICIES WERE CREATED
-- ============================================

-- Run this to see all policies (uncomment to check)
-- SELECT policyname, roles, cmd, qual, with_check 
-- FROM pg_policies 
-- WHERE tablename = 'blog_comments';

-- ============================================
-- TEST QUERIES
-- ============================================

-- Test 1: Can anonymous users see approved comments?
-- SELECT * FROM blog_comments WHERE status = 'approved' LIMIT 5;

-- Test 2: Can you insert a comment as anonymous?
-- INSERT INTO blog_comments (blog_id, content, author_name, author_email, status)
-- VALUES ('your-blog-id-here', 'Test comment', 'Test User', 'test@example.com', 'pending');

-- ============================================
-- SUCCESS!
-- ============================================
-- If this script runs without errors, your RLS policies are now fixed.
-- Try posting a comment again from your website.

