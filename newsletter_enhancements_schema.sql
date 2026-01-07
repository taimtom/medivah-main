-- Newsletter Enhancements: A/B Testing, Click Tracking, Analytics
-- Run this after create_newsletter_tables.sql

-- Newsletter variants table (for A/B testing)
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

-- Newsletter links table (for click tracking)
CREATE TABLE IF NOT EXISTS newsletter_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  newsletter_id UUID REFERENCES newsletters(id) ON DELETE CASCADE,
  original_url TEXT NOT NULL,
  tracking_url TEXT NOT NULL UNIQUE,
  click_count INTEGER DEFAULT 0,
  unique_click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter link clicks table (detailed click tracking)
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

-- Update newsletters table for A/B testing
ALTER TABLE newsletters 
ADD COLUMN IF NOT EXISTS is_ab_test BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ab_test_split INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS ab_test_winner_id UUID REFERENCES newsletter_variants(id),
ADD COLUMN IF NOT EXISTS ab_test_end_at TIMESTAMPTZ;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_variants_newsletter_id ON newsletter_variants(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_links_newsletter_id ON newsletter_links(newsletter_id);
CREATE INDEX IF NOT EXISTS idx_links_tracking_url ON newsletter_links(tracking_url);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON newsletter_link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_send_id ON newsletter_link_clicks(send_id);
CREATE INDEX IF NOT EXISTS idx_clicks_subscriber_id ON newsletter_link_clicks(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_newsletters_is_ab_test ON newsletters(is_ab_test);

-- Add trigger for newsletter_variants updated_at
CREATE TRIGGER update_variants_updated_at BEFORE UPDATE ON newsletter_variants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE newsletter_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage variants" ON newsletter_variants
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view links" ON newsletter_links
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert links" ON newsletter_links
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update links" ON newsletter_links
  FOR UPDATE USING (true);

CREATE POLICY "Authenticated users can view clicks" ON newsletter_link_clicks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert clicks" ON newsletter_link_clicks
  FOR INSERT WITH CHECK (true);

