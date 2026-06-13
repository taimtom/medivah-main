import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import { calculateApplicantProfileCompletion } from 'src/lib/applicant-profile';
import { normalizeDashboardRole } from 'src/lib/role-capabilities';

async function canViewApplicantProfile(supabase, requester, targetUserId) {
  if (requester.id === targetUserId) return true;

  const { data: memberProfile } = await supabase
    .from('member_profiles')
    .select('business_role, active_role')
    .eq('user_id', requester.id)
    .maybeSingle();

  if (memberProfile?.business_role === 'admin') return true;

  const role = normalizeDashboardRole(
    memberProfile?.active_role || memberProfile?.business_role || 'member'
  );
  if (role === 'applicant') return false;

  const { data: application } = await supabase
    .from('job_applications')
    .select('id')
    .eq('applicant_id', targetUserId)
    .eq('employer_member_id', requester.id)
    .limit(1)
    .maybeSingle();

  return Boolean(application);
}

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

function normaliseProfile(row) {
  if (!row) return row;
  return {
    ...row,
    skills: parseJsonArray(row.skills),
    work_experience: parseJsonArray(row.work_experience),
    education: parseJsonArray(row.education),
  };
}

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('user_id') || user.id;

    const supabase = createServerClient();

    const allowed = await canViewApplicantProfile(supabase, user, targetUserId);
    if (!allowed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('applicant_profiles')
      .select('*')
      .eq('user_id', targetUserId)
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ profile: normaliseProfile(data) || null }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch applicant profile' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const payload = await request.json();

    const profileCompletion = calculateApplicantProfileCompletion(payload);
    const now = new Date().toISOString();

    const upsertPayload = {
      user_id: user.id,
      full_name: payload.full_name || '',
      location: payload.location || null,
      skills: payload.skills || [],
      work_experience: Array.isArray(payload.work_experience) ? payload.work_experience : [],
      education: Array.isArray(payload.education) ? payload.education : [],
      cv_file_path: payload.cv_file_path || null,
      profile_completion: profileCompletion,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('applicant_profiles')
      .upsert([upsertPayload], { onConflict: 'user_id' })
      .select('*')
      .single();

    if (error) throw error;

    await supabase.from('member_role_capabilities').upsert(
      [
        {
          user_id: user.id,
          role: 'applicant',
          status: profileCompletion >= 50 ? 'active' : 'in_progress',
          onboarding_started_at: now,
          activated_at: profileCompletion >= 50 ? now : null,
          updated_at: now,
        },
      ],
      { onConflict: 'user_id,role' }
    );

    return NextResponse.json({ profile: normaliseProfile(data) }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to save applicant profile' },
      { status: 500 }
    );
  }
}
