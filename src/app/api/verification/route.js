import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import { normalizeDashboardRole } from 'src/lib/role-capabilities';

async function resolveRole(supabase, user) {
  const { data: profile } = await supabase
    .from('member_profiles')
    .select('business_role, active_role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profile?.business_role === 'admin') return 'admin';
  return normalizeDashboardRole(profile?.active_role || profile?.business_role || 'member');
}

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = createServerClient();
    const role = await resolveRole(supabase, user);

    let query = supabase
      .from('employer_verifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (role !== 'admin') {
      query = query.eq('member_id', user.id);
    }

    if (status && status !== 'all') query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ rows: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch verifications' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await request.json();
    if (!payload.company_name || !payload.company_email) {
      return NextResponse.json(
        { error: 'company_name and company_email are required' },
        { status: 400 }
      );
    }

    const requesterName = (payload.requester_name || '').trim();
    const requesterEmail = (payload.requester_email || '').trim();
    if (!requesterName || !requesterEmail) {
      return NextResponse.json(
        { error: 'requester_name and requester_email are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const role = await resolveRole(supabase, user);

    // Non-admins can only submit for themselves; admins may pass an explicit member_id
    const memberId = role === 'admin' && payload.member_id ? payload.member_id : user.id;

    const verificationFields = {
      requester_name: requesterName,
      requester_email: requesterEmail,
      company_name: payload.company_name,
      company_email: payload.company_email,
      phone_number: payload.phone_number || null,
      domain: payload.domain || null,
      address: payload.address || null,
      business_registration_number: payload.business_registration_number || null,
      documents: payload.documents || [],
    };

    const auditMetadata = {
      company_name: payload.company_name,
      requester_name: requesterName,
      requester_email: requesterEmail,
    };

    const { data: existing, error: selectError } = await supabase
      .from('employer_verifications')
      .select('*')
      .eq('member_id', memberId)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existing) {
      if (existing.status === 'pending' || existing.status === 'in_review') {
        return NextResponse.json(
          { error: 'You already have a verification request in progress.' },
          { status: 409 }
        );
      }
      if (existing.status === 'approved') {
        return NextResponse.json(
          { error: 'Your organization is already verified.' },
          { status: 409 }
        );
      }
      if (existing.status === 'suspended') {
        return NextResponse.json(
          { error: 'Verification is suspended. Please contact support.' },
          { status: 403 }
        );
      }
      // rejected: update same row and re-queue for review
      const { data: updated, error: updateError } = await supabase
        .from('employer_verifications')
        .update({
          ...verificationFields,
          status: 'pending',
          review_notes: null,
          reviewed_by: null,
          reviewed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select('*')
        .single();

      if (updateError) throw updateError;

      await supabase.from('member_role_capabilities').upsert(
        [
          {
            user_id: memberId,
            role: 'recruiter',
            status: 'in_progress',
            onboarding_started_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: 'user_id,role' }
      );

      await supabase.from('application_audit_logs').insert([
        {
          actor_id: user.id,
          action_type: 'verification_resubmitted',
          entity_type: 'employer_verification',
          entity_id: updated.id,
          metadata: auditMetadata,
        },
      ]);

      return NextResponse.json({ verification: updated }, { status: 200 });
    }

    const { data, error } = await supabase
      .from('employer_verifications')
      .insert([
        {
          member_id: memberId,
          ...verificationFields,
          status: 'pending',
        },
      ])
      .select('*')
      .single();

    if (error) throw error;

    await supabase.from('member_role_capabilities').upsert(
      [
        {
          user_id: memberId,
          role: 'recruiter',
          status: 'in_progress',
          onboarding_started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'user_id,role' }
    );

    await supabase.from('application_audit_logs').insert([
      {
        actor_id: user.id,
        action_type: 'verification_requested',
        entity_type: 'employer_verification',
        entity_id: data.id,
        metadata: auditMetadata,
      },
    ]);

    return NextResponse.json({ verification: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit verification' },
      { status: 500 }
    );
  }
}
