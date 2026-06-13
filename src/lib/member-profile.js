import { supabase } from 'src/lib/supabase';
import { buildRoleCapabilities, normalizeDashboardRole } from 'src/lib/role-capabilities';

const DEFAULT_ROLE = 'member';

async function getMemberRoleCapabilities(userId) {
  const { data, error } = await supabase
    .from('member_role_capabilities')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data || [];
}

async function attachRoleCapabilities(memberProfile) {
  if (!memberProfile?.user_id) return memberProfile;

  const roleCapabilityRows = await getMemberRoleCapabilities(memberProfile.user_id);
  const activeRole = normalizeDashboardRole(memberProfile.active_role || memberProfile.business_role);

  return {
    ...memberProfile,
    active_role: activeRole,
    role_capabilities: buildRoleCapabilities(
      { ...memberProfile, active_role: activeRole },
      roleCapabilityRows
    ),
  };
}

export async function ensureMemberProfile(user) {
  if (!user?.id) return null;

  const { data: existing, error: fetchError } = await supabase
    .from('member_profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existing) return attachRoleCapabilities(existing);

  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || '';
  const [firstName, ...restNames] = fullName.split(' ');
  const businessRole = user.user_metadata?.business_role || DEFAULT_ROLE;
  const activeRole = normalizeDashboardRole(businessRole);

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

  if (insertError) {
    throw insertError;
  }

  // Sync metadata without blocking auth flows (updateUser can deadlock if awaited
  // during onAuthStateChange).
  supabase.auth
    .updateUser({
      data: {
        first_name: firstName || null,
        last_name: restNames.join(' ') || null,
        business_role: created.business_role,
        active_role: activeRole,
      },
    })
    .catch(() => {});

  await supabase.from('member_role_capabilities').upsert(
    [
      {
        user_id: user.id,
        role: activeRole,
        status: 'active',
        onboarding_started_at: new Date().toISOString(),
        activated_at: new Date().toISOString(),
      },
    ],
    { onConflict: 'user_id,role' }
  );

  return attachRoleCapabilities({ ...created, active_role: activeRole });
}

export async function getCurrentMemberProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  return ensureMemberProfile(user);
}

export function isAdminRole(role) {
  return role === 'admin';
}

export function isMemberRole(role) {
  return role === 'member' || role === 'recruiter';
}
