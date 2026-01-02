# Supabase Database Setup Instructions

## 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Choose a region close to your target audience
3. Wait for the project to be provisioned (2-3 minutes)

## 2. Run Database Migrations

Go to the SQL Editor in your Supabase dashboard and run these SQL commands:

### Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Blogs table
CREATE TABLE blogs (
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
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  file_url TEXT,
  image_url TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  type TEXT,
  experience TEXT,
  description TEXT,
  requirements TEXT[],
  salary_range TEXT,
  apply_email TEXT DEFAULT 'contact@mavidah.co',
  published BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  product_id UUID REFERENCES products(id),
  amount DECIMAL(10,2) NOT NULL,
  paystack_reference TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(published);
CREATE INDEX idx_blogs_category ON blogs(category);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_jobs_published ON jobs(published);
CREATE INDEX idx_orders_status ON orders(status);
```

### Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Blogs policies
CREATE POLICY "Blogs are viewable by everyone" ON blogs
  FOR SELECT USING (published = true OR auth.uid() = author_id);

CREATE POLICY "Authenticated users can create blogs" ON blogs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own blogs" ON blogs
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own blogs" ON blogs
  FOR DELETE USING (auth.uid() = author_id);

-- Products policies
CREATE POLICY "Published products are viewable by everyone" ON products
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- Jobs policies
CREATE POLICY "Published jobs are viewable by everyone" ON jobs
  FOR SELECT USING (published = true OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage jobs" ON jobs
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR customer_email IS NOT NULL);

CREATE POLICY "Authenticated users can update orders" ON orders
  FOR UPDATE USING (auth.role() = 'authenticated');
```

## 3. Set Up Storage Buckets

In the Supabase dashboard, go to Storage and create these buckets:

1. **blog-images** (Public bucket)
   - Allow public access
   - For blog post featured images

2. **products** (Private bucket)
   - Require authentication
   - For digital product files (PDFs, templates, etc.)

3. **avatars** (Public bucket)
   - Allow public access
   - For user profile pictures

### Storage Policies

For each bucket, set up appropriate policies:

#### blog-images (Public)
```sql
-- Anyone can view
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

-- Authenticated users can upload
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Users can delete own uploads
CREATE POLICY "Users Delete Own" ON storage.objects FOR DELETE
  USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
```

#### products (Private)
```sql
-- Only authenticated users can access
CREATE POLICY "Authenticated Access" ON storage.objects FOR SELECT
  USING (bucket_id = 'products' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');
```

## 4. Get API Keys

1. Go to Project Settings > API
2. Copy the following:
   - Project URL (NEXT_PUBLIC_SUPABASE_URL)
   - anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - service_role key (SUPABASE_SERVICE_ROLE_KEY)

3. Add these to your `.env.local` file

## 5. Optional: Add Sample Data

```sql
-- Add sample blog post
INSERT INTO blogs (title, slug, content, excerpt, category, published, published_at)
VALUES (
  'Welcome to Mavidah',
  'welcome-to-mavidah',
  '<h1>Welcome to Mavidah</h1><p>Your HR knowledge hub...</p>',
  'Learn about HR, career guidance, and workplace insights',
  'HR Basics',
  true,
  NOW()
);

-- Add sample product
INSERT INTO products (name, slug, description, category, price, published)
VALUES (
  'CV Template Pack',
  'cv-template-pack',
  'Professional CV templates for various industries',
  'Templates & Tools',
  2500.00,
  true
);

-- Add sample job
INSERT INTO jobs (title, company, location, type, experience, description, published)
VALUES (
  'HR Manager',
  'Tech Startup',
  'Lagos, Nigeria',
  'Full-time',
  '3+ years',
  'Looking for an experienced HR Manager to join our growing team...',
  true
);
```

## Complete!

Your Supabase database is now set up and ready to use with the Mavidah application.


