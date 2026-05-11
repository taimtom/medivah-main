-- Smoke assertions for recruiter/member financial invariants
-- Run manually in Supabase SQL editor after migration + seed.

-- 1) No duplicate idempotency keys in wallet transactions.
SELECT idempotency_key, COUNT(*) AS duplicate_count
FROM wallet_transactions
GROUP BY idempotency_key
HAVING COUNT(*) > 1;

-- 2) No negative wallet balances.
SELECT id, member_id, balance
FROM wallet_accounts
WHERE balance < 0;

-- 3) Every job credit consumption links to a debit transaction.
SELECT jcc.id
FROM job_credit_consumptions jcc
LEFT JOIN wallet_transactions wt ON wt.id = jcc.debit_transaction_id
WHERE wt.id IS NULL OR wt.transaction_type <> 'debit';

-- 4) Commission split math check.
SELECT
  id,
  gross_amount,
  platform_amount,
  member_amount
FROM order_commission_splits
WHERE ROUND(platform_amount + member_amount, 2) <> ROUND(gross_amount, 2);

-- 5) Payment event uniqueness check.
SELECT provider, provider_reference, event_type, COUNT(*) AS duplicate_count
FROM payment_events
GROUP BY provider, provider_reference, event_type
HAVING COUNT(*) > 1;

-- 6) Duplicate applications are not allowed.
SELECT job_id, applicant_id, COUNT(*) AS duplicate_count
FROM job_applications
GROUP BY job_id, applicant_id
HAVING COUNT(*) > 1;

-- 7) Application history entries must reference existing applications.
SELECT ash.id
FROM application_status_history ash
LEFT JOIN job_applications ja ON ja.id = ash.application_id
WHERE ja.id IS NULL;

-- 8) Saved jobs are unique by applicant/job pair.
SELECT applicant_id, job_id, COUNT(*) AS duplicate_count
FROM saved_jobs
GROUP BY applicant_id, job_id
HAVING COUNT(*) > 1;

-- 9) Application status changes should include valid statuses.
SELECT id, status
FROM job_applications
WHERE status NOT IN ('submitted', 'under_review', 'shortlisted', 'interview', 'hired', 'rejected', 'closed');

-- 10) Verification policy keys should exist.
SELECT key
FROM platform_settings
WHERE key IN ('verification_enforcement_mode', 'verification_grace_deadline');

-- 11) Every application should have at least one status history record.
SELECT ja.id
FROM job_applications ja
LEFT JOIN application_status_history ash ON ash.application_id = ja.id
GROUP BY ja.id
HAVING COUNT(ash.id) = 0;

-- 12) Audit logs should exist for status changes and verification reviews.
SELECT action_type, COUNT(*) AS total
FROM application_audit_logs
WHERE action_type IN ('application_status_changed', 'verification_reviewed')
GROUP BY action_type;
