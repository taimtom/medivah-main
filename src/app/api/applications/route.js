import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import { normalizeDashboardRole } from 'src/lib/role-capabilities';

function applyRange(query, page, limit) {
  const safePage = Number(page || 1);
  const safeLimit = Number(limit || 20);
  const start = (safePage - 1) * safeLimit;
  const end = start + safeLimit - 1;
  return query.range(start, end);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const status = searchParams.get('status');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data: memberProfile, error: profileError } = await supabase
      .from('member_profiles')
      .select('business_role, active_role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    const role =
      memberProfile?.business_role === 'admin'
        ? 'admin'
        : normalizeDashboardRole(memberProfile?.active_role || memberProfile?.business_role);

    if (userId && userId !== user.id && role !== 'admin') {
      return NextResponse.json({ error: 'You can only view your own applications' }, { status: 403 });
    }

    let query = supabase
      .from('job_applications')
      .select(
        `
        *,
        jobs:job_id(id, title, company, location, published, expires_at)
      `,
        { count: 'exact' }
      )
      .order('applied_at', { ascending: false });

    if (role === 'admin') {
      // no additional scope
    } else if (role === 'applicant') {
      query = query.eq('applicant_id', user.id);
    } else {
      query = query.eq('employer_member_id', user.id);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, count, error } = await applyRange(query, page, limit);
    if (error) throw error;

    let rows = data || [];

    if (rows.length > 0) {
      const uniqueApplicantIds = [...new Set(rows.map((r) => r.applicant_id))];
      const { data: profiles } = await supabase
        .from('applicant_profiles')
        .select('user_id, full_name, location')
        .in('user_id', uniqueApplicantIds);
      const profileMap = Object.fromEntries((profiles || []).map((p) => [p.user_id, p]));
      rows = rows.map((r) => ({ ...r, applicant_profile: profileMap[r.applicant_id] || null }));
    }

    return NextResponse.json({ rows, total: count || 0 }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createServerClient();
    const payload = await request.json();

    const required = ['job_id', 'employer_member_id'];
    const missingField = required.find((field) => !payload[field]);
    if (missingField) {
      return NextResponse.json({ error: `${missingField} is required` }, { status: 400 });
    }

    // Always use the authenticated user as the applicant — never trust client-supplied applicant_id
    payload.applicant_id = user.id;

    const { data: existing } = await supabase
      .from('job_applications')
      .select('id')
      .eq('job_id', payload.job_id)
      .eq('applicant_id', payload.applicant_id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ error: 'You already applied for this job' }, { status: 409 });
    }

    const { data: profile } = await supabase
      .from('applicant_profiles')
      .select('profile_completion, cv_file_path')
      .eq('user_id', payload.applicant_id)
      .maybeSingle();

    if (!profile || Number(profile.profile_completion || 0) < 50) {
      return NextResponse.json(
        { error: 'Complete your profile to at least 50% before applying' },
        { status: 400 }
      );
    }

    const insertPayload = {
      job_id: payload.job_id,
      applicant_id: payload.applicant_id,
      employer_member_id: payload.employer_member_id,
      status: 'submitted',
      cover_letter: payload.cover_letter || null,
      cv_snapshot_path: profile.cv_file_path || null,
      applied_at: new Date().toISOString(),
      last_status_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('job_applications')
      .insert([insertPayload])
      .select('*')
      .single();

    if (error) throw error;

    await supabase.from('application_status_history').insert([
      {
        application_id: data.id,
        old_status: null,
        new_status: 'submitted',
        changed_by_user_id: payload.applicant_id,
        note: 'Application submitted',
      },
    ]);

    await supabase.from('application_audit_logs').insert([
      {
        actor_id: payload.applicant_id,
        action_type: 'application_submitted',
        entity_type: 'job_application',
        entity_id: data.id,
        metadata: { job_id: payload.job_id },
      },
    ]);

    return NextResponse.json({ application: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
