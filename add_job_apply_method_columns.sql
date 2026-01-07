-- Migration: Add apply_method and apply_link columns to jobs table
-- Run this in your Supabase SQL Editor

-- Add apply_method column with default value 'email'
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS apply_method TEXT DEFAULT 'email';

-- Add apply_link column (nullable, for external application URLs)
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS apply_link TEXT;

-- Update existing jobs to have 'email' as apply_method if they don't have one
UPDATE jobs 
SET apply_method = 'email' 
WHERE apply_method IS NULL;

-- Optional: Add a check constraint to ensure apply_method is either 'email' or 'link'
ALTER TABLE jobs 
ADD CONSTRAINT check_apply_method 
CHECK (apply_method IN ('email', 'link'));

