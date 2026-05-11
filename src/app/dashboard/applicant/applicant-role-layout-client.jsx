'use client';

import { useState, useEffect } from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useAuthContext } from 'src/auth/hooks';
import { RoleBasedGuard } from 'src/auth/guard/role-based-guard';

export function ApplicantRoleLayoutClient({ children }) {
  const { user } = useAuthContext();
  const [enabled, setEnabled] = useState(true);
  const applicantCapability = user?.roleCapabilities?.find((capability) => capability.role === 'applicant');
  const canUseApplicantView =
    user?.role === 'admin' ||
    (user?.role === 'applicant' && applicantCapability?.status !== 'not_started');

  useEffect(() => {
    const checkRollout = async () => {
      if (!user?.id || user?.role !== 'applicant') return;
      const response = await fetch(`/api/applicant/rollout?user_id=${user.id}`);
      const result = await response.json();
      if (response.ok) setEnabled(Boolean(result.enabled));
    };
    checkRollout();
  }, [user?.id, user?.role]);

  if (!enabled && user?.role === 'applicant') {
    return (
      <Container sx={{ py: 6 }}>
        <Typography variant="h5">Applicant dashboard rollout is not enabled for this account yet.</Typography>
      </Container>
    );
  }

  return (
    <RoleBasedGuard
      currentRole={canUseApplicantView ? user?.role : 'member'}
      acceptRoles={['applicant', 'admin']}
      hasContent
    >
      {children}
    </RoleBasedGuard>
  );
}
