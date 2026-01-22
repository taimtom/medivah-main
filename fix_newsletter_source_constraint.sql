-- Quick fix: Update newsletter_subscribers source constraint to allow 'like'
-- Run this in your Supabase SQL editor if you're getting the constraint violation error

ALTER TABLE newsletter_subscribers 
  DROP CONSTRAINT IF EXISTS newsletter_subscribers_source_check;

ALTER TABLE newsletter_subscribers 
  ADD CONSTRAINT newsletter_subscribers_source_check 
  CHECK (source IN ('manual', 'purchase', 'signup', 'like'));
