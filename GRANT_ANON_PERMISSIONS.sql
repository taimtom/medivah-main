-- ============================================
-- GRANT PERMISSIONS TO ANON ROLE
-- This ensures anonymous users can insert comments
-- ============================================

-- First, drop all policies to start fresh
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'blog_comments'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.blog_comments', r.policyname);
    END LOOP;
END $$;

-- Grant table permissions to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.blog_comments TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Ensure RLS is enabled
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create super simple permissive policy for INSERT
CREATE POLICY "Allow all inserts"
  ON public.blog_comments
  FOR INSERT
  WITH CHECK (true);

-- Create super simple permissive policy for SELECT
CREATE POLICY "Allow all selects"
  ON public.blog_comments
  FOR SELECT
  USING (true);

-- Allow updates for authenticated users only
CREATE POLICY "Allow authenticated updates"
  ON public.blog_comments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow deletes for authenticated users only  
CREATE POLICY "Allow authenticated deletes"
  ON public.blog_comments
  FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- Verify it worked
-- ============================================

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'blog_comments';

-- Check grants
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges
WHERE table_name = 'blog_comments';

