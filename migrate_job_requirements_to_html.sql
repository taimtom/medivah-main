-- Migration: Convert job requirements from array to HTML text
-- Run this in your Supabase SQL Editor

-- Step 1: Add a temporary column for HTML text
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requirements_html TEXT;

-- Step 2: Convert existing array data to HTML format
-- This function converts text array to HTML list
DO $$
DECLARE
    job_record RECORD;
    html_list TEXT;
    item TEXT;
BEGIN
    FOR job_record IN SELECT id, requirements FROM jobs WHERE requirements IS NOT NULL LOOP
        -- Check if requirements is an array (PostgreSQL arrays are represented as text like {item1,item2})
        IF job_record.requirements::text LIKE '{%}' THEN
            -- Convert array to HTML list
            html_list := '<ul>';
            FOR item IN SELECT unnest(job_record.requirements::text[]) LOOP
                html_list := html_list || '<li>' || item || '</li>';
            END LOOP;
            html_list := html_list || '</ul>';
            
            UPDATE jobs SET requirements_html = html_list WHERE id = job_record.id;
        ELSE
            -- Already text, copy as is
            UPDATE jobs SET requirements_html = job_record.requirements::text WHERE id = job_record.id;
        END IF;
    END LOOP;
END $$;

-- Step 3: Drop the old column and rename the new one
ALTER TABLE jobs DROP COLUMN requirements;
ALTER TABLE jobs RENAME COLUMN requirements_html TO requirements;

-- Step 4: Make sure the column allows NULL
ALTER TABLE jobs ALTER COLUMN requirements DROP NOT NULL;

