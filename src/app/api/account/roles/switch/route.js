import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import {
  SWITCHABLE_ROLES,
  getRoleLandingPath,
  buildRoleCapabilities,
  getRoleOnboardingPath,
  normalizeDashboardRole,
} from 'src/lib/role-capabilities';

const SWITCHABLE_ROLE_VALUES = SWITCHABLE_ROLES.map((item) => item.role);

export async function PATCH(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await request.json();
    const role = normalizeDashboardRole(payload.role);
    if (!SWITCHABLE_ROLE_VALUES.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: memberProfile, error: profileError } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!memberProfile) {
      return NextResponse.json({ error: 'Member profile not found' }, { status: 404 });
    }

    const { data: capabilityRows, error: capabilityError } = await supabase
      .from('member_role_capabilities')
      .select('*')
      .eq('user_id', user.id);

    if (capabilityError) throw capabilityError;

    const capabilities = buildRoleCapabilities(memberProfile, capabilityRows || []);
    const capability = capabilities.find((item) => item.role === role);

    if (capability?.status !== 'active') {
      return NextResponse.json(
        {
          error: `${capability?.label || 'This role'} onboarding is not complete yet.`,
          onboardingPath: getRoleOnboardingPath(role),
          roleCapabilities: capabilities,
        },
        { status: 409 }
      );
    }

    const { error: updateError } = await supabase
      .from('member_profiles')
      .update({ active_role: role, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    await supabase.auth.admin.updateUserById(user.id, {
      user_metadata: { ...user.user_metadata, active_role: role },
    });

    return NextResponse.json(
      {
        activeRole: role,
        landingPath: getRoleLandingPath(role),
        roleCapabilities: capabilities,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to switch role' }, { status: 500 });
  }
}
