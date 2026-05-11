-- ============================================
-- ROLE SWITCHER: ONE USER, MULTIPLE ROLES
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_capability_status') THEN
    CREATE TYPE role_capability_status AS ENUM ('not_started', 'in_progress', 'active');
  END IF;
END $$;

ALTER TABLE member_profiles
  ADD COLUMN IF NOT EXISTS active_role business_role;

UPDATE member_profiles
SET active_role = CASE
  WHEN business_role = 'applicant' THEN 'applicant'::business_role
  WHEN business_role = 'admin' THEN 'admin'::business_role
  ELSE 'recruiter'::business_role
END
WHERE active_role IS NULL;

ALTER TABLE member_profiles
  ALTER COLUMN active_role SET DEFAULT 'recruiter'::business_role,
  ALTER COLUMN active_role SET NOT NULL;

CREATE TABLE IF NOT EXISTS member_role_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role business_role NOT NULL,
  status role_capability_status NOT NULL DEFAULT 'not_started',
  onboarding_started_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_member_role_capabilities_user_id
  ON member_role_capabilities(user_id);

CREATE INDEX IF NOT EXISTS idx_member_role_capabilities_role_status
  ON member_role_capabilities(role, status);

INSERT INTO member_role_capabilities (user_id, role, status, onboarding_started_at, activated_at)
SELECT
  user_id,
  CASE
    WHEN business_role = 'applicant' THEN 'applicant'::business_role
    WHEN business_role = 'admin' THEN 'admin'::business_role
    ELSE 'recruiter'::business_role
  END AS role,
  'active'::role_capability_status,
  created_at,
  created_at
FROM member_profiles
ON CONFLICT (user_id, role) DO NOTHING;

INSERT INTO member_role_capabilities (user_id, role, status, onboarding_started_at, activated_at)
SELECT user_id, 'recruiter'::business_role, 'active'::role_capability_status, created_at, created_at
FROM member_profiles
WHERE business_role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

ALTER TABLE member_role_capabilities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own role capabilities" ON member_role_capabilities;
CREATE POLICY "Users can read own role capabilities" ON member_role_capabilities
  FOR SELECT USING (auth.uid() = user_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Users can insert own role capabilities" ON member_role_capabilities;
CREATE POLICY "Users can insert own role capabilities" ON member_role_capabilities
  FOR INSERT WITH CHECK (auth.uid() = user_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Users can update own role capabilities" ON member_role_capabilities;
CREATE POLICY "Users can update own role capabilities" ON member_role_capabilities
  FOR UPDATE USING (auth.uid() = user_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR is_admin_user(auth.uid()));
