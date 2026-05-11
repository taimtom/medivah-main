-- ============================================================
-- BASE WALLET MIGRATION
-- Run this BEFORE database_migration_billing_v2.sql
-- Creates: wallet_accounts, wallet_transactions,
--          payment_events, job_credit_consumptions
-- ============================================================

-- ── 1. credit_packages (base table) ─────────────────────────

CREATE TABLE IF NOT EXISTS credit_packages (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT        UNIQUE,
  name           TEXT        NOT NULL,
  credits        NUMERIC(12,2) NOT NULL CHECK (credits > 0),
  naira_price    NUMERIC(12,2) NOT NULL CHECK (naira_price >= 0),
  validity_months INTEGER    NOT NULL DEFAULT 12,
  active         BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. wallet_accounts ───────────────────────────────────────

CREATE TABLE IF NOT EXISTS wallet_accounts (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id   UUID        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_type TEXT        NOT NULL DEFAULT 'job_credits',
  balance     NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_accounts_member_id ON wallet_accounts (member_id);

ALTER TABLE wallet_accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own wallet" ON wallet_accounts;
CREATE POLICY "Users read own wallet" ON wallet_accounts
  FOR SELECT USING (auth.uid() = member_id);

-- ── 3. wallet_transactions ───────────────────────────────────

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_account_id   UUID        REFERENCES wallet_accounts(id) ON DELETE SET NULL,
  member_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type    TEXT        NOT NULL CHECK (transaction_type IN ('credit', 'debit')),
  amount              NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  reason_code         TEXT        NOT NULL,
  idempotency_key     TEXT        NOT NULL UNIQUE,
  external_reference  TEXT,
  metadata            JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_member_id
  ON wallet_transactions (member_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_wallet_transactions_idempotency
  ON wallet_transactions (idempotency_key);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own wallet transactions" ON wallet_transactions;
CREATE POLICY "Users read own wallet transactions" ON wallet_transactions
  FOR SELECT USING (auth.uid() = member_id);

-- ── 4. payment_events ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS payment_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  provider           TEXT        NOT NULL DEFAULT 'paystack',
  event_type         TEXT        NOT NULL,
  provider_reference TEXT        NOT NULL,
  payload            JSONB       NOT NULL DEFAULT '{}'::jsonb,
  status             TEXT        NOT NULL DEFAULT 'received'
                                   CHECK (status IN ('received', 'processed', 'failed')),
  processed_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_unique
  ON payment_events (provider, provider_reference, event_type);

CREATE INDEX IF NOT EXISTS idx_payment_events_reference
  ON payment_events (provider_reference);

-- No RLS needed — written exclusively via service role in API routes

-- ── 5. job_credit_consumptions ───────────────────────────────

CREATE TABLE IF NOT EXISTS job_credit_consumptions (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                UUID        NOT NULL,
  member_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  debit_transaction_id  UUID        REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  credits_used          NUMERIC(12,2) NOT NULL DEFAULT 1,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (job_id)
);

CREATE INDEX IF NOT EXISTS idx_job_credit_consumptions_member
  ON job_credit_consumptions (member_id);

ALTER TABLE job_credit_consumptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own job credit consumptions" ON job_credit_consumptions;
CREATE POLICY "Users read own job credit consumptions" ON job_credit_consumptions
  FOR SELECT USING (auth.uid() = member_id);

-- ── 6. order_commission_splits & member_earnings_ledger ─────
-- (referenced by orders/create route)

CREATE TABLE IF NOT EXISTS order_commission_splits (
  id                       UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                 UUID        NOT NULL,
  member_id                UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gross_amount             NUMERIC(12,2) NOT NULL,
  platform_commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.2,
  platform_amount          NUMERIC(12,2) NOT NULL,
  member_amount            NUMERIC(12,2) NOT NULL,
  currency                 TEXT        NOT NULL DEFAULT 'NGN',
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_commission_splits_member
  ON order_commission_splits (member_id);

CREATE TABLE IF NOT EXISTS member_earnings_ledger (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id             UUID,
  commission_split_id  UUID        REFERENCES order_commission_splits(id) ON DELETE SET NULL,
  amount               NUMERIC(12,2) NOT NULL,
  status               TEXT        NOT NULL DEFAULT 'pending'
                                     CHECK (status IN ('pending', 'paid', 'cancelled')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_member_earnings_member
  ON member_earnings_ledger (member_id, created_at DESC);

ALTER TABLE member_earnings_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own earnings" ON member_earnings_ledger;
CREATE POLICY "Users read own earnings" ON member_earnings_ledger
  FOR SELECT USING (auth.uid() = member_id);
