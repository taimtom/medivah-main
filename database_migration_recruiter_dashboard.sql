-- ============================================
-- RECRUITER DASHBOARD MIGRATION
-- ============================================
-- Adds extra organisational fields to employer_verifications so the
-- redesigned verification form can capture phone, address, and an
-- alternative business registration number in place of a document upload.
-- ============================================

ALTER TABLE employer_verifications
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS business_registration_number TEXT;
