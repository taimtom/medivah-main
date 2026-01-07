-- Add free product support to products table
-- Run this in your Supabase SQL Editor

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_products_is_free ON products(is_free);

-- Update existing products with price 0 to be marked as free
UPDATE products 
SET is_free = true 
WHERE price = 0 OR price IS NULL;

