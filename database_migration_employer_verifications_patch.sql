-- Run once in Supabase SQL Editor if verification submit fails with missing column errors.
-- Safe to re-run (uses IF NOT EXISTS).

ALTER TABLE employer_verifications
  ADD COLUMN IF NOT EXISTS requester_name TEXT,
  ADD COLUMN IF NOT EXISTS requester_email TEXT,
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS business_registration_number TEXT;

-- Keep the newest row per member (removes duplicates before unique constraint).
DELETE FROM employer_verifications ev
WHERE ev.id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (PARTITION BY member_id ORDER BY created_at DESC, id DESC) AS rn
    FROM employer_verifications
  ) ranked
  WHERE ranked.rn > 1
);

-- Backfill requester snapshot from auth where missing (admin list display).
UPDATE employer_verifications ev
SET
  requester_email = COALESCE(NULLIF(TRIM(ev.requester_email), ''), au.email),
  requester_name = COALESCE(
    NULLIF(TRIM(ev.requester_name), ''),
    NULLIF(TRIM(au.raw_user_meta_data->>'full_name'), ''),
    split_part(au.email, '@', 1)
  )
FROM auth.users au
WHERE ev.member_id = au.id
  AND (
    ev.requester_email IS NULL OR TRIM(ev.requester_email) = ''
    OR ev.requester_name IS NULL OR TRIM(ev.requester_name) = ''
  );

-- One verification row per member (skip if constraint already exists).
DO $$
BEGIN
  ALTER TABLE employer_verifications ADD CONSTRAINT employer_verifications_member_id_key UNIQUE (member_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
