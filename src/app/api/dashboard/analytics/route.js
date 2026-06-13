import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import { canAccessAdminMode, normalizeDashboardRole } from 'src/lib/role-capabilities';

function dateRangeFilter(query, field, fromDate, toDate) {
  let scoped = query;
  if (fromDate) scoped = scoped.gte(field, fromDate);
  if (toDate) scoped = scoped.lte(field, toDate);
  return scoped;
}

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    const supabase = createServerClient();

    // Resolve role from the DB — never trust query params for access control
    const { data: memberProfile } = await supabase
      .from('member_profiles')
      .select('business_role, active_role')
      .eq('user_id', user.id)
      .maybeSingle();

    const activeRole = normalizeDashboardRole(
      memberProfile?.active_role || memberProfile?.business_role || 'member'
    );
    const isAdminView = canAccessAdminMode({
      businessRole: memberProfile?.business_role,
      activeRole,
    });
    const role = isAdminView ? 'admin' : activeRole;

    // Admins may pass an explicit memberId to scope results; others are always scoped to themselves
    const requestedMemberId = searchParams.get('memberId');
    const scopeMember =
      role === 'admin' && requestedMemberId
        ? requestedMemberId
        : role === 'admin'
          ? null
          : user.id;

    const scopedTable = (table, ownershipColumn = 'member_id') => {
      const base = supabase.from(table).select('*', { count: 'exact', head: true });
      return scopeMember ? base.eq(ownershipColumn, scopeMember) : base;
    };

    const [blogs, jobs, products, orders, walletTx, earnings, applications] = await Promise.all([
      dateRangeFilter(scopedTable('blogs'), 'created_at', fromDate, toDate),
      dateRangeFilter(scopedTable('jobs'), 'created_at', fromDate, toDate),
      dateRangeFilter(scopedTable('products'), 'created_at', fromDate, toDate),
      dateRangeFilter(scopedTable('orders', 'resource_member_id'), 'created_at', fromDate, toDate),
      dateRangeFilter(scopedTable('wallet_transactions'), 'created_at', fromDate, toDate),
      dateRangeFilter(scopedTable('member_earnings_ledger'), 'created_at', fromDate, toDate),
      dateRangeFilter(scopedTable('job_applications', 'employer_member_id'), 'created_at', fromDate, toDate),
    ]);

    const creditsPurchasedQuery = scopeMember
      ? supabase
          .from('wallet_transactions')
          .select('amount, transaction_type')
          .eq('member_id', scopeMember)
          .eq('transaction_type', 'credit')
      : supabase.from('wallet_transactions').select('amount, transaction_type').eq('transaction_type', 'credit');

    const creditsUsedQuery = scopeMember
      ? supabase
          .from('wallet_transactions')
          .select('amount, transaction_type')
          .eq('member_id', scopeMember)
          .eq('transaction_type', 'debit')
      : supabase.from('wallet_transactions').select('amount, transaction_type').eq('transaction_type', 'debit');

    const [creditsPurchasedRows, creditsUsedRows, earningsRows] = await Promise.all([
      dateRangeFilter(creditsPurchasedQuery, 'created_at', fromDate, toDate),
      dateRangeFilter(creditsUsedQuery, 'created_at', fromDate, toDate),
      dateRangeFilter(
        scopeMember
          ? supabase.from('member_earnings_ledger').select('amount').eq('member_id', scopeMember)
          : supabase.from('member_earnings_ledger').select('amount'),
        'created_at',
        fromDate,
        toDate
      ),
    ]);

    const creditsPurchased =
      creditsPurchasedRows.data?.reduce((sum, row) => sum + Number(row.amount || 0), 0) || 0;
    const creditsUsed = creditsUsedRows.data?.reduce((sum, row) => sum + Number(row.amount || 0), 0) || 0;
    const netEarnings = earningsRows.data?.reduce((sum, row) => sum + Number(row.amount || 0), 0) || 0;

    const scopedApplicantProfiles = scopeMember
      ? supabase.from('applicant_profiles').select('profile_completion').eq('user_id', scopeMember)
      : supabase.from('applicant_profiles').select('profile_completion');

    const scopedApplications = scopeMember
      ? supabase.from('job_applications').select('applicant_id, status').eq('employer_member_id', scopeMember)
      : supabase.from('job_applications').select('applicant_id, status');

    const [{ data: profileRows }, { data: applicationRows }] = await Promise.all([
      dateRangeFilter(scopedApplicantProfiles, 'updated_at', fromDate, toDate),
      dateRangeFilter(scopedApplications, 'created_at', fromDate, toDate),
    ]);

    const profileCompletionRate =
      profileRows && profileRows.length > 0
        ? Math.round(
            profileRows.reduce((sum, row) => sum + Number(row.profile_completion || 0), 0) /
              profileRows.length
          )
        : 0;

    const applicationsPerApplicant =
      applicationRows && applicationRows.length > 0
        ? Number((applicationRows.length / new Set(applicationRows.map((row) => row.applicant_id)).size).toFixed(2))
        : 0;

    const conversionRate =
      Number(jobs.count || 0) > 0
        ? Number((((applications.count || 0) / Number(jobs.count || 1)) * 100).toFixed(2))
        : 0;

    const statusBreakdown = (applicationRows || []).reduce(
      (acc, row) => ({ ...acc, [row.status]: (acc[row.status] || 0) + 1 }),
      {}
    );

    return NextResponse.json({
      content: {
        blogs: blogs.count || 0,
        jobs: jobs.count || 0,
        resources: products.count || 0,
      },
      funnel: {
        applicationsSubmitted: applications.count || 0,
        conversionRate,
        applicationsPerApplicant,
        profileCompletionRate,
        statusBreakdown,
      },
      finance: {
        orders: orders.count || 0,
        creditsPurchased,
        creditsUsed,
        netEarnings,
      },
      rows: {
        walletTransactions: walletTx.count || 0,
        earningRecords: earnings.count || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch analytics' }, { status: 500 });
  }
}
