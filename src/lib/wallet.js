import { FINANCIAL_CONFIG } from 'src/lib/financial-config';

export class InsufficientCreditsError extends Error {
  constructor(message = 'Insufficient credits') {
    super(message);
    this.name = 'InsufficientCreditsError';
    this.code = 'INSUFFICIENT_CREDITS';
  }
}

export async function getOrCreateWalletAccount(supabaseClient, memberId) {
  const { data: existing, error: fetchError } = await supabaseClient
    .from('wallet_accounts')
    .select('*')
    .eq('member_id', memberId)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing;

  const { data: created, error: createError } = await supabaseClient
    .from('wallet_accounts')
    .insert([{ member_id: memberId, wallet_type: 'job_credits' }])
    .select('*')
    .single();

  if (createError) throw createError;
  return created;
}

/** Sum of non-expired allotment credits (source of truth for spendable balance). */
export async function getAvailableCreditUnits(supabaseClient, memberId) {
  const now = new Date().toISOString();
  const { data, error } = await supabaseClient
    .from('credit_allotments')
    .select('credits_remaining')
    .eq('member_id', memberId)
    .gt('expires_at', now)
    .gt('credits_remaining', 0);

  if (error) throw error;
  return (data || []).reduce((s, r) => s + Number(r.credits_remaining || 0), 0);
}

export async function reconcileWalletBalance(supabaseClient, memberId) {
  const wallet = await getOrCreateWalletAccount(supabaseClient, memberId);
  const sum = await getAvailableCreditUnits(supabaseClient, memberId);
  const now = new Date().toISOString();
  const { error: walletError } = await supabaseClient
    .from('wallet_accounts')
    .update({ balance: sum, updated_at: now })
    .eq('id', wallet.id);

  if (walletError) throw walletError;
  return { ...wallet, balance: sum };
}

/**
 * Append a row to wallet_transactions and refresh wallet_accounts.balance from allotments.
 */
export async function insertWalletLedgerEntry({
  supabaseClient,
  memberId,
  transactionType,
  amount,
  reasonCode,
  idempotencyKey,
  externalReference = null,
  metadata = {},
}) {
  const wallet = await getOrCreateWalletAccount(supabaseClient, memberId);

  const { data: existingTxn } = await supabaseClient
    .from('wallet_transactions')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existingTxn) {
    const reconciled = await reconcileWalletBalance(supabaseClient, memberId);
    return { wallet: reconciled, transaction: existingTxn };
  }

  const delta = Number(amount || 0);
  const { data: transaction, error: transactionError } = await supabaseClient
    .from('wallet_transactions')
    .insert([
      {
        wallet_account_id: wallet.id,
        member_id: memberId,
        transaction_type: transactionType,
        amount: delta,
        reason_code: reasonCode,
        idempotency_key: idempotencyKey,
        external_reference: externalReference,
        metadata,
      },
    ])
    .select('*')
    .single();

  if (transactionError) throw transactionError;

  const reconciled = await reconcileWalletBalance(supabaseClient, memberId);
  return { wallet: reconciled, transaction };
}

/** @deprecated Prefer grantCreditAllotment + insertWalletLedgerEntry; kept for legacy callers */
export async function applyWalletTransaction({
  supabaseClient,
  memberId,
  transactionType,
  amount,
  reasonCode,
  idempotencyKey,
  externalReference = null,
  metadata = {},
}) {
  return insertWalletLedgerEntry({
    supabaseClient,
    memberId,
    transactionType,
    amount,
    reasonCode,
    idempotencyKey,
    externalReference,
    metadata,
  });
}

/**
 * Grant credits as a new allotment row + credit ledger entry.
 */
export async function grantCreditAllotment({
  supabaseClient,
  memberId,
  allotmentType,
  packageId = null,
  credits,
  expiresAt,
  idempotencyKey,
  metadata = {},
}) {
  const { data: existing } = await supabaseClient
    .from('credit_allotments')
    .select('*')
    .eq('idempotency_key', idempotencyKey)
    .maybeSingle();

  if (existing) {
    const wallet = await reconcileWalletBalance(supabaseClient, memberId);
    return { allotment: existing, wallet, alreadyGranted: true, transaction: null };
  }

  const { data: allotment, error } = await supabaseClient
    .from('credit_allotments')
    .insert([
      {
        member_id: memberId,
        allotment_type: allotmentType,
        package_id: packageId,
        credits_granted: credits,
        credits_remaining: credits,
        expires_at: expiresAt,
        idempotency_key: idempotencyKey,
        metadata,
      },
    ])
    .select('*')
    .single();

  if (error) {
    if (String(error.code) === '23505' || String(error.message || '').toLowerCase().includes('duplicate')) {
      const { data: again } = await supabaseClient
        .from('credit_allotments')
        .select('*')
        .eq('idempotency_key', idempotencyKey)
        .maybeSingle();
      const wallet = await reconcileWalletBalance(supabaseClient, memberId);
      return { allotment: again, wallet, alreadyGranted: true, transaction: null };
    }
    throw error;
  }

  const reasonCode =
    allotmentType === 'pack_purchase'
      ? 'credit_purchase'
      : allotmentType === 'free_signup'
        ? 'free_signup_credit'
        : 'free_monthly_credit';

  const { wallet, transaction } = await insertWalletLedgerEntry({
    supabaseClient,
    memberId,
    transactionType: 'credit',
    amount: credits,
    reasonCode,
    idempotencyKey: `wallet-${idempotencyKey}`,
    externalReference: metadata.paystack_reference ?? null,
    metadata: {
      ...metadata,
      allotment_id: allotment.id,
      allotment_type: allotmentType,
      expires_at: expiresAt,
    },
  });

  return { allotment, wallet, alreadyGranted: false, transaction };
}

function endOfUtcMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0, 23, 59, 59, 999));
}

/** Idempotent: one free credit per calendar month (UTC), expires end of that month. */
export async function grantMonthlyFreeCredits(supabaseClient, memberId) {
  const now = new Date();
  const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  const idempotencyKey = `free-monthly-${memberId}-${monthKey}`;
  return grantCreditAllotment({
    supabaseClient,
    memberId,
    allotmentType: 'free_monthly',
    packageId: null,
    credits: 1,
    expiresAt: endOfUtcMonth(now).toISOString(),
    idempotencyKey,
    metadata: { monthKey },
  });
}

/** Idempotent: 2 welcome credits, valid 30 days from first grant. */
export async function grantSignupFreeCredits(supabaseClient, memberId) {
  const idempotencyKey = `free-signup-${memberId}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  return grantCreditAllotment({
    supabaseClient,
    memberId,
    allotmentType: 'free_signup',
    packageId: null,
    credits: 2,
    expiresAt,
    idempotencyKey,
    metadata: { kind: 'signup_welcome' },
  });
}

/**
 * Debit credits from allotments (FIFO by earliest expires_at). Updates rows then ledger.
 */
export async function debitFromAllotments({
  supabaseClient,
  memberId,
  amount,
  reasonCode,
  idempotencyKey,
  externalReference = null,
  metadata = {},
}) {
  const normalizedAmount = Number(amount || 0);
  if (normalizedAmount <= 0) {
    throw new Error('Debit amount must be positive');
  }

  const walletTxnKey = `debit-${idempotencyKey}`;
  const { data: existingTxn } = await supabaseClient
    .from('wallet_transactions')
    .select('*')
    .eq('idempotency_key', walletTxnKey)
    .maybeSingle();

  if (existingTxn) {
    const wallet = await reconcileWalletBalance(supabaseClient, memberId);
    return { wallet, transaction: existingTxn, alreadyDebited: true };
  }

  const now = new Date().toISOString();
  const { data: rows, error: selErr } = await supabaseClient
    .from('credit_allotments')
    .select('id, credits_remaining, expires_at')
    .eq('member_id', memberId)
    .gt('credits_remaining', 0)
    .gt('expires_at', now)
    .order('expires_at', { ascending: true });

  if (selErr) throw selErr;

  const available = (rows || []).reduce((s, r) => s + Number(r.credits_remaining || 0), 0);
  if (available < normalizedAmount) {
    throw new InsufficientCreditsError();
  }

  let remaining = normalizedAmount;
  await (rows || []).reduce(async (accPromise, row) => {
    await accPromise;
    if (remaining <= 0) return undefined;
    const cur = Number(row.credits_remaining || 0);
    if (cur <= 0) return undefined;
    const take = Math.min(cur, remaining);
    const next = cur - take;
    const { error: upErr } = await supabaseClient
      .from('credit_allotments')
      .update({ credits_remaining: next })
      .eq('id', row.id);
    if (upErr) throw upErr;
    remaining -= take;
    return undefined;
  }, Promise.resolve());

  if (remaining > 0) {
    throw new InsufficientCreditsError();
  }

  const { wallet, transaction } = await insertWalletLedgerEntry({
    supabaseClient,
    memberId,
    transactionType: 'debit',
    amount: normalizedAmount,
    reasonCode,
    idempotencyKey: walletTxnKey,
    externalReference,
    metadata,
  });

  return { wallet, transaction, alreadyDebited: false };
}

export async function debitCreditsForJobPublish({
  supabaseClient,
  memberId,
  jobId,
  idempotencyKey,
}) {
  const key = idempotencyKey || `job-publish-${jobId}`;
  const { transaction } = await debitFromAllotments({
    supabaseClient,
    memberId,
    amount: FINANCIAL_CONFIG.jobPublishCostCredits,
    reasonCode: 'job_publish',
    idempotencyKey: key,
    externalReference: jobId,
    metadata: { jobId },
  });

  const { error } = await supabaseClient.from('job_credit_consumptions').insert([
    {
      job_id: jobId,
      member_id: memberId,
      debit_transaction_id: transaction.id,
      credits_used: FINANCIAL_CONFIG.jobPublishCostCredits,
    },
  ]);

  if (error && !String(error.message || '').includes('duplicate')) {
    throw error;
  }

  return transaction;
}
