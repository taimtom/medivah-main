-- ============================================
-- TALENT PROFILE STEPPER MIGRATION
-- ============================================
-- Migrates work_experience and education from free-text (TEXT/HTML) to
-- structured JSONB arrays to support the multi-entry stepper form.
--
-- NOTE: Existing rich-text content in those columns will be cleared because
-- the old HTML cannot be automatically cast to the new structured JSON shape.
-- Users will re-enter their information in the structured form.
-- ============================================

ALTER TABLE applicant_profiles
  ALTER COLUMN work_experience TYPE JSONB USING '[]'::jsonb,
  ALTER COLUMN education TYPE JSONB USING '[]'::jsonb;

ALTER TABLE applicant_profiles
  ALTER COLUMN work_experience SET DEFAULT '[]'::jsonb,
  ALTER COLUMN education SET DEFAULT '[]'::jsonb;

-- Ensure any existing rows that had NULL or text content are set to empty arrays.
UPDATE applicant_profiles
  SET work_experience = '[]'::jsonb
  WHERE work_experience IS NULL OR jsonb_typeof(work_experience) != 'array';

UPDATE applicant_profiles
  SET education = '[]'::jsonb
  WHERE education IS NULL OR jsonb_typeof(education) != 'array';

-- Also reset profile_completion scores so they are recalculated with the
-- new 5-step formula when users next save their profile.
UPDATE applicant_profiles
  SET profile_completion = 0
  WHERE profile_completion > 0;
