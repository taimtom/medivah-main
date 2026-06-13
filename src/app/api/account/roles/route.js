import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import {
  SWITCHABLE_ROLES,
  buildRoleCapabilities,
  getRoleLandingPath,
  getRoleOnboardingPath,
  normalizeDashboardRole,
  isSuperAdmin,
} from 'src/lib/role-capabilities';

const SWITCHABLE_ROLE_VALUES = SWITCHABLE_ROLES.map((item) => item.role);

function canSwitchToRole(memberProfile, role) {
  if (role === 'admin') {
    return isSuperAdmin(memberProfile?.business_role);
  }
  return SWITCHABLE_ROLE_VALUES.includes(role);
}

async function getOrCreateMemberProfile(supabase, user) {
  const { data: existing, error: fetchError } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) throw fetchError;
  if (existing) return existing;

  const businessRole = user.user_metadata?.business_role || 'member';
  const activeRole = normalizeDashboardRole(user.user_metadata?.active_role || businessRole);

  const { data: created, error: insertError } = await supabase
    .from('member_profiles')
    .insert([
      {
        user_id: user.id,
        business_role: businessRole,
        active_role: activeRole,
        company: user.user_metadata?.company || null,
        contact_phone: user.user_metadata?.phone || null,
      },
    ])
    .select('*')
    .single();

  if (insertError) throw insertError;

  return created;
}

async function upsertCapability(supabase, userId, role, status) {
  const now = new Date().toISOString();
  const payload = {
    user_id: userId,
    role,
    status,
    updated_at: now,
    ...(status === 'in_progress' ? { onboarding_started_at: now } : {}),
    ...(status === 'active' ? { onboarding_started_at: now, activated_at: now } : {}),
  };

  const { error } = await supabase
    .from('member_role_capabilities')
    .upsert([payload], { onConflict: 'user_id,role' });

  if (error) throw error;
}

async function syncDerivedCapabilities(supabase, userId, memberProfile) {
  const { data: capabilities, error: capabilityError } = await supabase
    .from('member_role_capabilities')
    .select('*')
    .eq('user_id', userId);

  if (capabilityError) throw capabilityError;

  const capabilityMap = new Map((capabilities || []).map((item) => [item.role, item]));
  const normalizedRole = normalizeDashboardRole(memberProfile.active_role || memberProfile.business_role);

  if (!capabilityMap.has(normalizedRole)) {
    await upsertCapability(supabase, userId, normalizedRole, 'active');
  }

  const { data: applicantProfile } = await supabase
    .from('applicant_profiles')
    .select('profile_completion')
    .eq('user_id', userId)
    .maybeSingle();

  const applicantCapability = capabilityMap.get('applicant');
  if (applicantProfile && applicantCapability?.status !== 'active') {
    await upsertCapability(
      supabase,
      userId,
      'applicant',
      Number(applicantProfile.profile_completion || 0) >= 50 ? 'active' : 'in_progress'
    );
  }

  const { data: verification } = await supabase
    .from('employer_verifications')
    .select('status')
    .eq('member_id', userId)
    .maybeSingle();

  const recruiterCapability = capabilityMap.get('recruiter');
  if (verification && recruiterCapability?.status !== 'active') {
    await upsertCapability(
      supabase,
      userId,
      'recruiter',
      verification.status === 'approved' ? 'active' : 'in_progress'
    );
  }
}

async function getRoleState(supabase, user) {
  const memberProfile = await getOrCreateMemberProfile(supabase, user);
  await syncDerivedCapabilities(supabase, user.id, memberProfile);

  const { data: capabilityRows, error } = await supabase
    .from('member_role_capabilities')
    .select('*')
    .eq('user_id', user.id);

  if (error) throw error;

  const activeRole = normalizeDashboardRole(memberProfile.active_role || memberProfile.business_role);
  const roleCapabilities = buildRoleCapabilities(
    { ...memberProfile, active_role: activeRole },
    capabilityRows || []
  );

  return {
    activeRole,
    businessRole: memberProfile.business_role,
    roleCapabilities,
  };
}

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createServerClient();
    const state = await getRoleState(supabase, user);

    return NextResponse.json(state, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to load roles' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await request.json();
    const role = normalizeDashboardRole(payload.role);

    const supabase = createServerClient();
    const state = await getRoleState(supabase, user);

    if (!canSwitchToRole({ business_role: state.businessRole }, role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (role === 'admin') {
      await supabase
        .from('member_profiles')
        .update({ active_role: 'admin', updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      await supabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, active_role: 'admin' },
      });

      return NextResponse.json(
        {
          activeRole: 'admin',
          landingPath: getRoleLandingPath('admin'),
          roleCapabilities: (await getRoleState(supabase, user)).roleCapabilities,
        },
        { status: 200 }
      );
    }

    const existing = state.roleCapabilities.find((capability) => capability.role === role);
    const nextStatus = existing?.status === 'active' ? 'active' : 'in_progress';

    await upsertCapability(supabase, user.id, role, nextStatus);
    await supabase
      .from('member_profiles')
      .update({ active_role: role, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);
    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, active_role: role },
    });

    return NextResponse.json(
      {
        activeRole: role,
        onboardingPath: getRoleOnboardingPath(role),
        roleCapabilities: (await getRoleState(supabase, user)).roleCapabilities,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to start role onboarding' }, { status: 500 });
  }
}
