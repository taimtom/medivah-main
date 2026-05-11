'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';

import { supabase } from 'src/lib/supabase';
import { CREDIT_PACKS, FINANCIAL_CONFIG } from 'src/lib/financial-config';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const fmt = (amount) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(amount);

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function packUiMeta(slug) {
  return CREDIT_PACKS.find((p) => p.slug === slug) || null;
}

// ─── Balance hero card ────────────────────────────────────────────────────────

function BalanceCard({ balance, creditValue }) {
  const theme = useTheme();
  const nairaValue = balance * creditValue;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.darker || theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'common.white',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="solar:wallet-bold-duotone" width={24} sx={{ color: alpha('#fff', 0.8) }} />
              <Typography variant="overline" sx={{ color: alpha('#fff', 0.7), letterSpacing: 1.5 }}>
                Spendable credits
              </Typography>
            </Stack>
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1 }}>
              {balance}
              <Typography component="span" variant="h5" sx={{ ml: 1, color: alpha('#fff', 0.7), fontWeight: 400 }}>
                credits
              </Typography>
            </Typography>
            <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
              Anchor value (not sold per credit): {fmt(nairaValue)} at {fmt(creditValue)} / credit
            </Typography>
          </Stack>

          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: alpha('#fff', 0.15),
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:star-bold-duotone" width={36} sx={{ color: alpha('#fff', 0.9) }} />
          </Stack>
        </Stack>

        <Divider sx={{ my: 2.5, borderColor: alpha('#fff', 0.2) }} />

        <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
          <Stack spacing={0.25}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
              Job publish cost
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'common.white' }}>
              {FINANCIAL_CONFIG.jobPublishCostCredits} credit per post
            </Typography>
          </Stack>
          <Stack spacing={0.25}>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.6) }}>
              Paid credits
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'common.white' }}>
              Bundles only (better per-credit price)
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Free credits status ─────────────────────────────────────────────────────

function FreeCreditsCard({ allotments }) {
  const now = Date.now();
  const freeRows = (allotments || []).filter((a) =>
    ['free_signup', 'free_monthly'].includes(a.allotment_type)
  );

  const signup = freeRows.filter((a) => a.allotment_type === 'free_signup');
  const monthly = freeRows.filter((a) => a.allotment_type === 'free_monthly');

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:gift-bold-duotone" width={22} />
            <Typography variant="h6">Freemium job posts</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            New employers get 2 free posts (valid 30 days from signup). You also receive 1 free post each
            calendar month (expires at month-end). Free posts do not stack month-to-month unused quota beyond
            the monthly grant rule — each month&apos;s grant is one credit with its own expiry.
          </Typography>

          {signup.length === 0 && monthly.length === 0 ? (
            <Typography variant="body2" color="text.disabled">
              No active free-post credits (or you&apos;re on an applicant account).
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {signup.map((row) => (
                <Stack key={row.id} direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="subtitle2">Welcome pack (signup)</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={`${Number(row.credits_remaining)} left`} color="success" variant="soft" />
                    <Typography variant="caption" color="text.secondary">
                      Expires {formatDate(row.expires_at)}
                      {new Date(row.expires_at).getTime() < now ? ' (expired)' : ''}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
              {monthly.map((row) => (
                <Stack key={row.id} direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="subtitle2">This month&apos;s free post</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={`${Number(row.credits_remaining)} left`} color="info" variant="soft" />
                    <Typography variant="caption" color="text.secondary">
                      Expires {formatDate(row.expires_at)}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Pack purchase (Paystack) ─────────────────────────────────────────────────

function PackPurchaseGrid({ dbPacks, onPurchaseSuccess }) {
  const { user } = useAuthContext();
  const [payingSlug, setPayingSlug] = useState(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

  const sorted = [...(dbPacks || [])].sort((a, b) => Number(a.credits) - Number(b.credits));

  const payForPack = useCallback(
    (packRow) => {
      setError('');
      setSuccess('');

      if (!paystackKey) {
        setError('Paystack is not configured. Please contact support.');
        return;
      }
      if (!user?.email) {
        setError('User email not available.');
        return;
      }
      if (!scriptReady || !window.PaystackPop) {
        setError('Payment provider is still loading. Please wait a moment and try again.');
        return;
      }

      setPayingSlug(packRow.slug);

      const reference = `credit-${user.id}-${Date.now()}`;
      const amountKobo = Math.round(Number(packRow.naira_price) * 100);

      try {
        const handler = window.PaystackPop.setup({
          key: paystackKey,
          email: user.email,
          amount: amountKobo,
          currency: 'NGN',
          ref: reference,
          metadata: {
            custom_fields: [
              { display_name: 'Package ID', variable_name: 'package_id', value: String(packRow.id) },
              { display_name: 'Slug', variable_name: 'slug', value: String(packRow.slug) },
              { display_name: 'Member ID', variable_name: 'member_id', value: user.id },
            ],
          },
          onClose: () => {
            setPayingSlug(null);
          },
          callback: (response) => {
            (async () => {
              try {
                const purchaseRes = await fetch('/api/credits/purchase', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    member_id: user.id,
                    package_id: packRow.id,
                    paystack_reference: response.reference,
                    idempotency_key: `credit-purchase-${response.reference}`,
                  }),
                });

                const purchaseData = await purchaseRes.json();
                if (!purchaseRes.ok) {
                  setError(purchaseData.error || 'Failed to add credits.');
                } else {
                  setSuccess(
                    `${packRow.credits} credit${Number(packRow.credits) !== 1 ? 's' : ''} added (${packRow.name}). Valid ${packRow.validity_months} months from purchase.`
                  );
                  onPurchaseSuccess();
                }
              } catch {
                setError(
                  `An error occurred after payment. Please contact support with your reference: ${response.reference}`
                );
              } finally {
                setPayingSlug(null);
              }
            })();
          },
        });

        handler.openIframe();
      } catch (err) {
        setError(err.message || 'Failed to open payment modal. Please try again.');
        setPayingSlug(null);
      }
    },
    [onPurchaseSuccess, paystackKey, scriptReady, user]
  );

  useEffect(() => {
    const existingScript = document.getElementById('paystack-script');
    if (existingScript) {
      // Script tag already injected — may already be loaded
      if (window.PaystackPop) {
        setScriptReady(true);
      } else {
        existingScript.addEventListener('load', () => setScriptReady(true));
      }
      return;
    }
    const script = document.createElement('script');
    script.id = 'paystack-script';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setScriptReady(true);
    script.onerror = () => setError('Failed to load payment provider. Please refresh the page.');
    document.body.appendChild(script);
  }, []);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Typography variant="h6">Buy credit packs</Typography>
            <Typography variant="body2" color="text.secondary">
              We sell bundles only (better value per credit). Pay securely with Paystack. Larger volumes can be
              arranged with Mavidah admin.
            </Typography>
          </Stack>

          {error && (
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            {sorted.map((row) => {
              const meta = packUiMeta(row.slug);
              const perCredit = Math.round(Number(row.naira_price) / Number(row.credits));
              const highlight = meta?.highlight;
              return (
                <Grid item xs={12} sm={6} key={row.id}>
                  <Card
                    variant={highlight ? 'elevation' : 'outlined'}
                    sx={{
                      height: '100%',
                      border: highlight ? (t) => `2px solid ${t.palette.primary.main}` : undefined,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.5} alignItems="flex-start">
                        {highlight && <Chip size="small" label="Popular" color="primary" />}
                        <Typography variant="subtitle1">{row.name}</Typography>
                        <Typography variant="h5" color="primary">
                          {fmt(Number(row.naira_price))}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {row.credits} credits · {fmt(perCredit)} / credit
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Valid {row.validity_months} months from purchase
                        </Typography>
                        <LoadingButton
                          fullWidth
                          variant="contained"
                          color={highlight ? 'primary' : 'inherit'}
                          loading={payingSlug === row.slug}
                          disabled={!!payingSlug && payingSlug !== row.slug}
                          onClick={() => payForPack(row)}
                          startIcon={<Iconify icon="solar:card-bold-duotone" />}
                        >
                          Pay with Paystack
                        </LoadingButton>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold-duotone" />}>
            Each published job uses {FINANCIAL_CONFIG.jobPublishCostCredits} credit ({fmt(FINANCIAL_CONFIG.jobPublishCostCredits * FINANCIAL_CONFIG.creditValueNaira)} anchor value).
          </Alert>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Transaction history ─────────────────────────────────────────────────────

function TransactionHistoryCard({ transactions }) {
  if (transactions.length === 0) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
            <Iconify icon="solar:document-bold-duotone" width={40} color="text.disabled" />
            <Typography variant="body2" color="text.disabled">
              No transactions yet.
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="h6">Transaction History</Typography>
        </Box>
        <Divider />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Credits</TableCell>
                <TableCell>Pack expiry</TableCell>
                <TableCell>Reference</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} hover>
                  <TableCell>
                    <Typography variant="caption">{formatDate(tx.created_at)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Iconify
                        icon={
                          tx.transaction_type === 'credit'
                            ? 'solar:arrow-down-bold-duotone'
                            : 'solar:arrow-up-bold-duotone'
                        }
                        width={16}
                        color={tx.transaction_type === 'credit' ? 'success.main' : 'error.main'}
                      />
                      <Chip
                        label={tx.reason_code?.replace(/_/g, ' ')}
                        size="small"
                        color={tx.transaction_type === 'credit' ? 'success' : 'error'}
                        variant="soft"
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="subtitle2"
                      color={tx.transaction_type === 'credit' ? 'success.main' : 'error.main'}
                    >
                      {tx.transaction_type === 'credit' ? '+' : '-'}
                      {tx.amount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {tx.metadata?.expires_at ? formatDate(tx.metadata.expires_at) : '—'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.disabled" sx={{ fontFamily: 'monospace' }}>
                      {tx.external_reference || tx.idempotency_key?.slice(0, 24) || '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function BillingView() {
  const { user } = useAuthContext();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [dbPacks, setDbPacks] = useState([]);
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;

    const nowIso = new Date().toISOString();

    const { data: allotRows, error: allotErr } = await supabase
      .from('credit_allotments')
      .select('*')
      .eq('member_id', user.id)
      .gt('expires_at', nowIso)
      .gt('credits_remaining', 0);

    if (!allotErr) {
      setAllotments(allotRows || []);
      const sum = (allotRows || []).reduce((s, r) => s + Number(r.credits_remaining || 0), 0);
      setBalance(sum);
    } else {
      const { data: walletData } = await supabase.from('wallet_accounts').select('balance').eq('member_id', user.id).maybeSingle();
      setBalance(Number(walletData?.balance || 0));
      setAllotments([]);
    }

    const { data: txData } = await supabase
      .from('wallet_transactions')
      .select('*')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    setTransactions(txData || []);

    const { data: packData, error: packErr } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('active', true)
      .order('credits', { ascending: true });

    if (!packErr && packData?.length) {
      setDbPacks(packData);
    } else {
      setDbPacks(
        CREDIT_PACKS.map((p, i) => ({
          id: `local-${p.slug}`,
          slug: p.slug,
          name: p.label,
          credits: p.credits,
          naira_price: p.nairaPrice,
          validity_months: p.validityMonths,
          active: true,
        }))
      );
    }

    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <LinearProgress />
      </Container>
    );
  }

  const packsForUi = dbPacks.filter((p) => !String(p.id).startsWith('local-'));

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Typography variant="h4">Credits &amp; Billing</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage bundles, free posts, and your billing history. Payments are processed with Paystack.
          </Typography>
        </Stack>

        <BalanceCard balance={balance} creditValue={FINANCIAL_CONFIG.creditValueNaira} />

        <FreeCreditsCard allotments={allotments} />

        {packsForUi.length > 0 ? (
          <PackPurchaseGrid dbPacks={packsForUi} onPurchaseSuccess={fetchData} />
        ) : (
          <Alert severity="warning">
            Credit packs are not loaded from the database. Run{' '}
            <Typography component="span" variant="body2" sx={{ fontFamily: 'monospace' }}>
              database_migration_billing_v2.sql
            </Typography>{' '}
            in Supabase, then refresh.
          </Alert>
        )}

        <Stack spacing={1.5}>
          <Typography variant="h6">Transaction History</Typography>
          <TransactionHistoryCard transactions={transactions} />
        </Stack>
      </Stack>
    </Container>
  );
}
