-- ============================================
-- TEMPORARY FIX: DISABLE RLS FOR TESTING
-- This will allow comments to work while we debug
-- ============================================

-- Option 1: Completely disable RLS on blog_comments (TEMPORARY!)
ALTER TABLE public.blog_comments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- After this works, we'll re-enable with better policies
-- ============================================

-- To re-enable later, run:
-- ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

