-- ============================================
-- UPDATE RLS TO HIDE REJECTED & SPAM COMMENTS
-- Rejected and spam comments will only be visible to authenticated users (admins)
-- ============================================

-- Drop the existing public view policy
DROP POLICY IF EXISTS "Allow all selects" ON public.blog_comments;
DROP POLICY IF EXISTS "Anyone can view approved comments" ON public.blog_comments;

-- Create new policy: Anonymous users can only see approved comments
CREATE POLICY "Anonymous users see only approved comments"
  ON public.blog_comments
  FOR SELECT
  TO anon
  USING (status = 'approved');

-- Create new policy: Authenticated users can see all comments (for moderation)
CREATE POLICY "Authenticated users see all comments"
  ON public.blog_comments
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================
-- VERIFY THE POLICIES
-- ============================================

-- Check that policies are correctly set
SELECT 
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'blog_comments'
ORDER BY policyname;

-- ============================================
-- TEST QUERIES
-- ============================================

-- Test 1: As anonymous user, you should only see approved comments
-- SELECT * FROM blog_comments;  -- Should only show approved

-- Test 2: As authenticated user (in dashboard), you should see all comments
-- (Login first, then run this query)
-- SELECT * FROM blog_comments;  -- Should show all statuses

