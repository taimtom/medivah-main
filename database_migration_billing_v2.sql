-- ============================================
-- BILLING V2: credit packs validity + allotments
-- ============================================

-- Pack identity for stable upserts and API lookups
ALTER TABLE credit_packages
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS validity_months INTEGER NOT NULL DEFAULT 12;

-- Stable pack lookup (multiple NULL slugs allowed if any legacy rows exist)
CREATE UNIQUE INDEX IF NOT EXISTS credit_packages_slug_unique
  ON credit_packages (slug);

-- Allotment ledger: each purchase or free grant is one row; debits consume FIFO by expires_at
CREATE TABLE IF NOT EXISTS credit_allotments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allotment_type TEXT NOT NULL CHECK (allotment_type IN ('pack_purchase', 'free_signup', 'free_monthly')),
  package_id UUID REFERENCES credit_packages(id) ON DELETE SET NULL,
  credits_granted NUMERIC(12,2) NOT NULL CHECK (credits_granted > 0),
  credits_remaining NUMERIC(12,2) NOT NULL CHECK (credits_remaining >= 0),
  expires_at TIMESTAMPTZ NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_allotments_member_expires
  ON credit_allotments (member_id, expires_at ASC)
  WHERE credits_remaining > 0;

CREATE INDEX IF NOT EXISTS idx_credit_allotments_member_id ON credit_allotments (member_id);

-- Seed / refresh the four public bundles (anchor: ₦10k per credit; bundles only)
INSERT INTO credit_packages (slug, name, credits, naira_price, validity_months, active)
VALUES
  ('starter', 'Starter Pack', 3, 25000, 6, TRUE),
  ('growth', 'Growth Pack', 7, 50000, 9, TRUE),
  ('business', 'Business Pack', 15, 100000, 12, TRUE),
  ('enterprise', 'Enterprise Pack', 30, 180000, 18, TRUE)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  credits = EXCLUDED.credits,
  naira_price = EXCLUDED.naira_price,
  validity_months = EXCLUDED.validity_months,
  active = EXCLUDED.active,
  updated_at = NOW();

ALTER TABLE credit_allotments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own credit allotments" ON credit_allotments;
CREATE POLICY "Users read own credit allotments" ON credit_allotments
  FOR SELECT USING (auth.uid() = member_id);

-- Writes go through service role (API routes); no INSERT/UPDATE for authenticated role
