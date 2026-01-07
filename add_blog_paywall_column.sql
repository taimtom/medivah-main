-- Add paywall feature to blogs table
-- Run this in your Supabase SQL Editor

ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS paywall_enabled BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_blogs_paywall_enabled ON blogs(paywall_enabled);

