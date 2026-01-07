-- Helper function for incrementing counters
-- Run this after newsletter_enhancements_schema.sql

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

