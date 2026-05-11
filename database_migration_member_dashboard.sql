-- ============================================
-- MEMBER/RECRUITER DASHBOARD FOUNDATION MIGRATION
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_role') THEN
    CREATE TYPE business_role AS ENUM ('admin', 'recruiter', 'member', 'applicant');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wallet_transaction_type') THEN
    CREATE TYPE wallet_transaction_type AS ENUM ('credit', 'debit');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'earning_status') THEN
    CREATE TYPE earning_status AS ENUM ('pending', 'available', 'paid');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'application_status') THEN
    CREATE TYPE application_status AS ENUM (
      'submitted',
      'under_review',
      'shortlisted',
      'interview',
      'hired',
      'rejected',
      'closed'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS member_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_role business_role NOT NULL DEFAULT 'member',
  company TEXT,
  contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  soft_deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE blogs ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES auth.users(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES auth.users(id);
ALTER TABLE products ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS resource_member_id UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type TEXT DEFAULT 'resource_purchase';
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS accept_internal_applications BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS requires_verification_for_internal_only BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS wallet_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_type TEXT NOT NULL DEFAULT 'job_credits',
  unit_label TEXT NOT NULL DEFAULT 'credits',
  balance NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_account_id UUID NOT NULL REFERENCES wallet_accounts(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type wallet_transaction_type NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason_code TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  external_reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL CHECK (credits > 0),
  naira_price NUMERIC(12,2) NOT NULL CHECK (naira_price >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_credit_consumptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debit_transaction_id UUID NOT NULL REFERENCES wallet_transactions(id) ON DELETE RESTRICT,
  credits_used NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'paystack',
  event_type TEXT NOT NULL,
  provider_reference TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed')),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, provider_reference, event_type)
);

CREATE TABLE IF NOT EXISTS order_commission_splits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_amount NUMERIC(12,2) NOT NULL,
  platform_commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.20,
  platform_amount NUMERIC(12,2) NOT NULL,
  member_amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(order_id)
);

CREATE TABLE IF NOT EXISTS member_earnings_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  commission_split_id UUID REFERENCES order_commission_splits(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  status earning_status NOT NULL DEFAULT 'pending',
  payout_batch_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
  total_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payout_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_batch_id UUID NOT NULL REFERENCES payout_batches(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  earning_ledger_id UUID REFERENCES member_earnings_ledger(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applicant_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  location TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_experience TEXT,
  education TEXT,
  cv_file_path TEXT,
  profile_completion INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status application_status NOT NULL DEFAULT 'submitted',
  cover_letter TEXT,
  cv_snapshot_path TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_status_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, applicant_id)
);

CREATE TABLE IF NOT EXISTS application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES job_applications(id) ON DELETE CASCADE,
  old_status application_status,
  new_status application_status NOT NULL,
  changed_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(applicant_id, job_id)
);

CREATE TABLE IF NOT EXISTS employer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_name TEXT,
  requester_email TEXT,
  company_name TEXT NOT NULL,
  company_email TEXT NOT NULL,
  domain TEXT,
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'rejected', 'suspended')),
  review_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (member_id)
);

CREATE TABLE IF NOT EXISTS application_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO platform_settings (key, value)
VALUES ('verification_enforcement_mode', '{"mode":"grace_then_gate"}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value)
VALUES (
  'verification_grace_deadline',
  jsonb_build_object('iso', (NOW() + INTERVAL '30 days')::text)
)
ON CONFLICT (key) DO NOTHING;

INSERT INTO platform_settings (key, value)
VALUES (
  'applicant_rollout_control',
  '{"enabled":true,"pilot_only":false,"pilot_member_ids":[]}'::jsonb
)
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_member_profiles_role ON member_profiles(business_role);
CREATE INDEX IF NOT EXISTS idx_member_profiles_status ON member_profiles(status);
CREATE INDEX IF NOT EXISTS idx_blogs_member_id ON blogs(member_id);
CREATE INDEX IF NOT EXISTS idx_jobs_member_id ON jobs(member_id);
CREATE INDEX IF NOT EXISTS idx_products_member_id ON products(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_member_id ON orders(member_id);
CREATE INDEX IF NOT EXISTS idx_orders_resource_member_id ON orders(resource_member_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_member_id ON wallet_transactions(member_id);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_reason_code ON wallet_transactions(reason_code);
CREATE INDEX IF NOT EXISTS idx_job_credit_consumptions_member_id ON job_credit_consumptions(member_id);
CREATE INDEX IF NOT EXISTS idx_job_credit_consumptions_job_id ON job_credit_consumptions(job_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_reference ON payment_events(provider_reference);
CREATE INDEX IF NOT EXISTS idx_member_earnings_member_id ON member_earnings_ledger(member_id);
CREATE INDEX IF NOT EXISTS idx_member_earnings_status ON member_earnings_ledger(status);
CREATE INDEX IF NOT EXISTS idx_applicant_profiles_user_id ON applicant_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_applicant_profiles_location ON applicant_profiles(location);
CREATE INDEX IF NOT EXISTS idx_job_applications_applicant_id ON job_applications(applicant_id, applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applications_employer_member_id ON job_applications(employer_member_id, status);
CREATE INDEX IF NOT EXISTS idx_job_applications_job_id ON job_applications(job_id, status);
CREATE INDEX IF NOT EXISTS idx_application_status_history_application_id ON application_status_history(application_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_applicant_id ON saved_jobs(applicant_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_employer_verifications_status ON employer_verifications(status);
CREATE INDEX IF NOT EXISTS idx_application_audit_logs_entity ON application_audit_logs(entity_type, entity_id);

ALTER TABLE member_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_credit_consumptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_commission_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_earnings_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE applicant_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin_user(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM member_profiles
    WHERE user_id = uid
      AND business_role = 'admin'
      AND status = 'active'
  );
$$;

DROP POLICY IF EXISTS "Users can read own member profile" ON member_profiles;
CREATE POLICY "Users can read own member profile" ON member_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own member profile" ON member_profiles;
CREATE POLICY "Users can update own member profile" ON member_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own member profile" ON member_profiles;
CREATE POLICY "Users can insert own member profile" ON member_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can read own wallet account" ON wallet_accounts;
CREATE POLICY "Users can read own wallet account" ON wallet_accounts
  FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can read own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users can read own wallet transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can read own credit consumptions" ON job_credit_consumptions;
CREATE POLICY "Users can read own credit consumptions" ON job_credit_consumptions
  FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Users can read own earnings" ON member_earnings_ledger;
CREATE POLICY "Users can read own earnings" ON member_earnings_ledger
  FOR SELECT USING (auth.uid() = member_id);

DROP POLICY IF EXISTS "Authenticated users can view credit packages" ON credit_packages;
CREATE POLICY "Authenticated users can view credit packages" ON credit_packages
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins manage credit packages" ON credit_packages;
CREATE POLICY "Admins manage credit packages" ON credit_packages
  FOR ALL USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Applicants manage own profile" ON applicant_profiles;
CREATE POLICY "Applicants manage own profile" ON applicant_profiles
  FOR ALL USING (auth.uid() = user_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Applicants view own applications" ON job_applications;
CREATE POLICY "Applicants view own applications" ON job_applications
  FOR SELECT USING (auth.uid() = applicant_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Applicants create own applications" ON job_applications;
CREATE POLICY "Applicants create own applications" ON job_applications
  FOR INSERT WITH CHECK (auth.uid() = applicant_id);

DROP POLICY IF EXISTS "Recruiters update scoped applications" ON job_applications;
CREATE POLICY "Recruiters update scoped applications" ON job_applications
  FOR UPDATE USING (auth.uid() = employer_member_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = employer_member_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Applications history readable by stakeholders" ON application_status_history;
CREATE POLICY "Applications history readable by stakeholders" ON application_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM job_applications ja
      WHERE ja.id = application_id
        AND (ja.applicant_id = auth.uid() OR ja.employer_member_id = auth.uid())
    )
    OR is_admin_user(auth.uid())
  );

DROP POLICY IF EXISTS "Applications history writable by stakeholders" ON application_status_history;
CREATE POLICY "Applications history writable by stakeholders" ON application_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM job_applications ja
      WHERE ja.id = application_id
        AND (ja.applicant_id = auth.uid() OR ja.employer_member_id = auth.uid())
    )
    OR is_admin_user(auth.uid())
  );

DROP POLICY IF EXISTS "Applicants manage saved jobs" ON saved_jobs;
CREATE POLICY "Applicants manage saved jobs" ON saved_jobs
  FOR ALL USING (auth.uid() = applicant_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = applicant_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Members manage own verification requests" ON employer_verifications;
CREATE POLICY "Members manage own verification requests" ON employer_verifications
  FOR ALL USING (auth.uid() = member_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = member_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins read platform settings" ON platform_settings;
CREATE POLICY "Admins read platform settings" ON platform_settings
  FOR SELECT USING (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Admins manage platform settings" ON platform_settings;
CREATE POLICY "Admins manage platform settings" ON platform_settings
  FOR ALL USING (is_admin_user(auth.uid()))
  WITH CHECK (is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Stakeholders write application audit logs" ON application_audit_logs;
CREATE POLICY "Stakeholders write application audit logs" ON application_audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admins read application audit logs" ON application_audit_logs;
CREATE POLICY "Admins read application audit logs" ON application_audit_logs
  FOR SELECT USING (is_admin_user(auth.uid()));

CREATE OR REPLACE FUNCTION is_admin_user(uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM member_profiles
    WHERE user_id = uid
      AND business_role = 'admin'
      AND status = 'active'
  );
$$;

DROP POLICY IF EXISTS "Members manage own blogs" ON blogs;
CREATE POLICY "Members manage own blogs" ON blogs
  FOR ALL USING (auth.uid() = member_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = member_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Members manage own jobs" ON jobs;
CREATE POLICY "Members manage own jobs" ON jobs
  FOR ALL USING (auth.uid() = member_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = member_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Members manage own products" ON products;
CREATE POLICY "Members manage own products" ON products
  FOR ALL USING (auth.uid() = member_id OR is_admin_user(auth.uid()))
  WITH CHECK (auth.uid() = member_id OR is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "Members view own orders" ON orders;
CREATE POLICY "Members view own orders" ON orders
  FOR SELECT USING (auth.uid() = resource_member_id OR is_admin_user(auth.uid()));
