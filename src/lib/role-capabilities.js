import { paths } from 'src/routes/paths';

export const ROLE_CAPABILITY_STATUSES = ['not_started', 'in_progress', 'active'];

export const SWITCHABLE_ROLES = [
  {
    role: 'applicant',
    label: 'Applicant',
    description: 'Find jobs, save roles, and manage your applications.',
    onboardingPath: paths.dashboard.applicant.profile,
    landingPath: paths.dashboard.applicant.profile,
  },
  {
    role: 'recruiter',
    label: 'Recruiter',
    description: 'Post jobs, review applicants, and manage employer tools.',
    onboardingPath: paths.dashboard.verification.root,
    landingPath: paths.dashboard.root,
  },
];

export function normalizeDashboardRole(role = 'recruiter') {
  if (role === 'admin' || role === 'applicant') return role;
  return 'recruiter';
}

export function getRoleLandingPath(role) {
  const option = SWITCHABLE_ROLES.find((item) => item.role === role);
  return option?.landingPath || paths.dashboard.root;
}

export function getRoleOnboardingPath(role) {
  const option = SWITCHABLE_ROLES.find((item) => item.role === role);
  return option?.onboardingPath || paths.dashboard.root;
}

export function buildRoleCapabilities(memberProfile, rows = []) {
  const activeRole = normalizeDashboardRole(
    memberProfile?.active_role || memberProfile?.business_role || 'recruiter'
  );
  const rowMap = new Map((rows || []).map((row) => [row.role, row]));

  const capabilities = SWITCHABLE_ROLES.map((option) => {
    const row = rowMap.get(option.role);
    const seededActive =
      option.role === activeRole ||
      (option.role === 'recruiter' &&
        (memberProfile?.business_role === 'member' || memberProfile?.business_role === 'recruiter'));

    return {
      ...option,
      status: row?.status || (seededActive ? 'active' : 'not_started'),
      onboardingStartedAt: row?.onboarding_started_at || null,
      activatedAt: row?.activated_at || null,
    };
  });

  if (memberProfile?.business_role === 'admin') {
    capabilities.push({
      role: 'admin',
      label: 'Admin',
      description: 'Manage the platform.',
      status: 'active',
      onboardingStartedAt: null,
      activatedAt: memberProfile.created_at || null,
      onboardingPath: paths.dashboard.root,
      landingPath: paths.dashboard.root,
    });
  }

  return capabilities;
}

export function canUseRole(capability) {
  return capability?.status === 'active';
}

export function canOnboardRole(capability) {
  return capability?.status === 'not_started' || capability?.status === 'in_progress';
}
