import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import { canAccessAdminMode, normalizeDashboardRole } from 'src/lib/role-capabilities';

async function getAdminOverview(supabase) {
  const [
    { count: totalMembers },
    { count: totalApplicants },
    { data: verificationRows },
    { count: totalApplications },
    { count: publishedJobs },
  ] = await Promise.all([
    supabase.from('member_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('applicant_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('employer_verifications').select('status'),
    supabase.from('job_applications').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('published', true),
  ]);

  const verificationByStatus = (verificationRows || []).reduce(
    (acc, row) => ({ ...acc, [row.status]: (acc[row.status] || 0) + 1 }),
    {}
  );

  return {
    totalMembers: totalMembers || 0,
    totalApplicants: totalApplicants || 0,
    totalApplications: totalApplications || 0,
    publishedJobs: publishedJobs || 0,
    verificationRequests: verificationRows?.length || 0,
    verificationByStatus,
    pendingVerifications:
      (verificationByStatus.pending || 0) +
      (verificationByStatus.in_review || 0),
  };
}

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: profile } = await supabase
      .from('member_profiles')
      .select('business_role, active_role')
      .eq('user_id', user.id)
      .maybeSingle();

    const activeRole = normalizeDashboardRole(
      profile?.active_role || profile?.business_role || 'member'
    );
    const isAdminView = canAccessAdminMode({
      businessRole: profile?.business_role,
      activeRole,
    });
    const role = isAdminView ? 'admin' : activeRole === 'applicant' ? 'applicant' : activeRole;
    const memberId = isAdminView ? null : user.id;

    const { data, error } = await supabase.rpc('get_dashboard_analytics', {
      p_role: role,
      p_member_id: memberId,
    });

    if (error) throw error;

    if (isAdminView) {
      const adminOverview = await getAdminOverview(supabase);
      return NextResponse.json({ ...data, adminOverview }, { status: 200 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to load analytics summary' },
      { status: 500 }
    );
  }
}
