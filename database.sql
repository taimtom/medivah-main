-- ============================================
-- MAVIDAH BLOG PROJECT - COMPLETE DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. CORE TABLES
-- ============================================

-- Blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT false,
  paywall_enabled BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  is_free BOOLEAN DEFAULT false,
  file_url TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  type TEXT,
  experience TEXT,
  description TEXT,
  requirements TEXT, -- HTML format
  salary_range TEXT,
  apply_method TEXT DEFAULT 'email' CHECK (apply_method IN ('email', 'link')),
  apply_email TEXT DEFAULT 'contact@mavidah.co',
  apply_link TEXT,
  published BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  product_id UUID REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  paystack_reference TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. BLOG ENGAGEMENT TABLES
-- ============================================

-- Blog Likes table
CREATE TABLE IF NOT EXISTS blog_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_like BOOLEAN NOT NULL DEFAULT true, -- true = like, false = dislike
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(blog_id, user_id)
);

-- Blog Comments table
CREATE TABLE IF NOT EXISTS blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Allow anonymous comments
  author_name VARCHAR(255) NOT NULL,
  author_email VARCHAR(255),
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE, -- For replies
  status VARCHAR(50) DEFAULT 'approved', -- pending, approved, spam, deleted
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- 3. NEWSLETTER TABLES
-- ============================================

-- Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  status TEXT DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed', 'bounced')),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'purchase', 'signup', 'like')),
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletters table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  content_text TEXT,
  preview_text TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  recipients_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  is_ab_test BOOLEAN DEFAULT false,
  ab_test_split INTEGER DEFAULT 50,
  ab_test_winner_id UUID,
  ab_test_end_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter sends tracking
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  bounce_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter variants (for A/B testing)
CREATE TABLE IF NOT EXISTS newsletter_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  variant_type TEXT NOT NULL CHECK (variant_type IN ('subject', 'content')),
  variant_name TEXT NOT NULL,
  subject TEXT,
  content_html TEXT,
  preview_text TEXT,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter links (for click tracking)
CREATE TABLE IF NOT EXISTS newsletter_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  tracking_url TEXT NOT NULL UNIQUE,
  click_count INTEGER DEFAULT 0,
  unique_click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter link clicks (detailed click tracking)
CREATE TABLE IF NOT EXISTS newsletter_link_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES newsletter_links(id) ON DELETE CASCADE,
  send_id UUID REFERENCES newsletter_sends(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- ============================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================

-- Blogs indexes
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_paywall_enabled ON blogs(paywall_enabled);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_free ON products(is_free);

-- Jobs indexes
CREATE INDEX IF NOT EXISTS idx_jobs_published ON jobs(published);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Blog engagement indexes
CREATE INDEX IF NOT EXISTS idx_blog_likes_blog_id ON blog_likes(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_user_id ON blog_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_likes_is_like ON blog_likes(is_like);
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);

-- Newsletter indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_status ON newsletters(status);
CREATE INDEX IF NOT EXISTS idx_newsletters_scheduled_at ON newsletters(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_newsletters_is_ab_test ON newsletters(is_ab_test);
CREATE INDEX IF NOT EXISTS idx_sends_newsletter_id ON newsletter_sends(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_sends_subscriber_id ON newsletter_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sends_status ON newsletter_sends(status);
CREATE INDEX IF NOT EXISTS idx_sends_email ON newsletter_sends(email);
CREATE INDEX IF NOT EXISTS idx_variants_newsletter_id ON newsletter_variants(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_links_newsletter_id ON newsletter_links(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_links_tracking_url ON newsletter_links(tracking_url);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON newsletter_link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_send_id ON newsletter_link_clicks(send_id);
CREATE INDEX IF NOT EXISTS idx_clicks_subscriber_id ON newsletter_link_clicks(subscriber_id);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_link_clicks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BLOGS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Blogs are viewable by everyone" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can create blogs" ON blogs;
DROP POLICY IF EXISTS "Users can update own blogs" ON blogs;
DROP POLICY IF EXISTS "Users can delete own blogs" ON blogs;

CREATE POLICY "Blogs are viewable by everyone" ON blogs
  FOR SELECT USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create blogs" ON blogs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own blogs" ON blogs
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own blogs" ON blogs
  FOR DELETE USING (auth.uid() = author_id);

-- ============================================
-- PRODUCTS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Published products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Authenticated users can manage products" ON products;

CREATE POLICY "Published products are viewable by everyone" ON products
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- JOBS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Published jobs are viewable by everyone" ON jobs;
DROP POLICY IF EXISTS "Authenticated users can manage jobs" ON jobs;

CREATE POLICY "Published jobs are viewable by everyone" ON jobs
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage jobs" ON jobs
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- ORDERS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR customer_email IS NOT NULL);

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================
-- BLOG LIKES POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view likes" ON blog_likes;
DROP POLICY IF EXISTS "Authenticated users can add likes" ON blog_likes;
DROP POLICY IF EXISTS "Users can update their own likes" ON blog_likes;
DROP POLICY IF EXISTS "Users can delete their own likes" ON blog_likes;

CREATE POLICY "Anyone can view likes" ON blog_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add likes" ON blog_likes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own likes" ON blog_likes
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" ON blog_likes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- BLOG COMMENTS POLICIES
-- ============================================

-- Drop all existing policies
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

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.blog_comments TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Anonymous users can only see approved comments
CREATE POLICY "Anonymous users see only approved comments" ON blog_comments
  FOR SELECT TO anon
  USING (status = 'approved');

-- Authenticated users can see all comments (for moderation)
CREATE POLICY "Authenticated users see all comments" ON blog_comments
  FOR SELECT TO authenticated
  USING (true);

-- Anyone can add comments
CREATE POLICY "Anyone can add comments" ON blog_comments
  FOR INSERT
  WITH CHECK (true);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments" ON blog_comments
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments" ON blog_comments
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users (admins) can update any comment (for moderation)
CREATE POLICY "Authenticated users can update any comment" ON blog_comments
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users (admins) can delete any comment
CREATE POLICY "Authenticated users can delete any comment" ON blog_comments
  FOR DELETE TO authenticated
  USING (true);

-- ============================================
-- NEWSLETTER POLICIES
-- ============================================

-- Subscribers policies
DROP POLICY IF EXISTS "Anyone can subscribe" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Authenticated users can update subscribers" ON newsletter_subscribers;

CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can view subscribers" ON newsletter_subscribers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update subscribers" ON newsletter_subscribers
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Newsletters policies
DROP POLICY IF EXISTS "Authenticated users can manage newsletters" ON newsletters;

CREATE POLICY "Authenticated users can manage newsletters" ON newsletters
  FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter sends policies
DROP POLICY IF EXISTS "Authenticated users can view sends" ON newsletter_sends;
DROP POLICY IF EXISTS "System can insert sends" ON newsletter_sends;
DROP POLICY IF EXISTS "System can update sends" ON newsletter_sends;

CREATE POLICY "Authenticated users can view sends" ON newsletter_sends
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert sends" ON newsletter_sends
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update sends" ON newsletter_sends
  FOR UPDATE USING (true);

-- Newsletter variants policies
DROP POLICY IF EXISTS "Authenticated users can manage variants" ON newsletter_variants;

CREATE POLICY "Authenticated users can manage variants" ON newsletter_variants
  FOR ALL USING (auth.role() = 'authenticated');

-- Newsletter links policies
DROP POLICY IF EXISTS "Authenticated users can view links" ON newsletter_links;
DROP POLICY IF EXISTS "System can insert links" ON newsletter_links;
DROP POLICY IF EXISTS "System can update links" ON newsletter_links;

CREATE POLICY "Authenticated users can view links" ON newsletter_links
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert links" ON newsletter_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update links" ON newsletter_links
  FOR UPDATE USING (true);

-- Newsletter link clicks policies
DROP POLICY IF EXISTS "Authenticated users can view clicks" ON newsletter_link_clicks;
DROP POLICY IF EXISTS "System can insert clicks" ON newsletter_link_clicks;

CREATE POLICY "Authenticated users can view clicks" ON newsletter_link_clicks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert clicks" ON newsletter_link_clicks
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get blog engagement stats
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
    (SELECT COUNT(*) FROM blog_comments WHERE blog_id = blog_uuid AND status = 'approved') as comments_count
  FROM blog_likes
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
  FROM blogs b
  LEFT JOIN blog_likes bl ON b.id = bl.blog_id
  WHERE b.published = true
  GROUP BY b.id, b.title
  ORDER BY net_likes DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function for incrementing counters
CREATE OR REPLACE FUNCTION increment(
  table_name TEXT,
  id UUID,
  column_name TEXT
)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'UPDATE %I SET %I = %I + 1 WHERE id = $1',
    table_name,
    column_name,
    column_name
  ) USING id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Triggers for updated_at columns
DROP TRIGGER IF EXISTS update_blogs_updated_at ON blogs;
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_jobs_updated_at ON jobs;
CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_likes_updated_at ON blog_likes;
CREATE TRIGGER update_blog_likes_updated_at
  BEFORE UPDATE ON blog_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_blog_comments_updated_at ON blog_comments;
CREATE TRIGGER update_blog_comments_updated_at
  BEFORE UPDATE ON blog_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_newsletters_updated_at ON newsletters;
CREATE TRIGGER update_newsletters_updated_at
  BEFORE UPDATE ON newsletters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_variants_updated_at ON newsletter_variants;
CREATE TRIGGER update_variants_updated_at
  BEFORE UPDATE ON newsletter_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. STORAGE BUCKET POLICIES
-- ============================================
-- Note: Create these buckets in Supabase Dashboard → Storage first:
-- - blog-images (public)
-- - products (private)
-- - product-images (public)
-- - avatars (public)

-- Blog images policies
DROP POLICY IF EXISTS "Blog Images Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Blog Images Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Blog Images Authenticated Delete" ON storage.objects;

CREATE POLICY "Blog Images Public Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Blog Images Authenticated Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

CREATE POLICY "Blog Images Authenticated Delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Product images policies
DROP POLICY IF EXISTS "Product Images Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Product Images Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Product Images Authenticated Delete" ON storage.objects;
DROP POLICY IF EXISTS "Product Images Authenticated Update" ON storage.objects;

CREATE POLICY "Product Images Public Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Product Images Authenticated Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Product Images Authenticated Delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Product Images Authenticated Update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Products (private) policies
DROP POLICY IF EXISTS "Products Authenticated Access" ON storage.objects;
DROP POLICY IF EXISTS "Products Authenticated Upload" ON storage.objects;

CREATE POLICY "Products Authenticated Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Products Authenticated Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Avatars policies
DROP POLICY IF EXISTS "Avatars Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Authenticated Upload" ON storage.objects;

CREATE POLICY "Avatars Public Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Avatars Authenticated Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now fully configured with:
-- ✅ All core tables (blogs, products, jobs, orders)
-- ✅ Blog engagement tables (likes, comments)
-- ✅ Newsletter system tables
-- ✅ All indexes for performance
-- ✅ Row Level Security policies
-- ✅ Helper functions and triggers
-- ✅ Storage bucket policies
--
-- Next steps:
-- 1. Create storage buckets in Supabase Dashboard → Storage
-- 2. Add your environment variables to .env.local
-- 3. Start your development server: npm run dev
-- ============================================
