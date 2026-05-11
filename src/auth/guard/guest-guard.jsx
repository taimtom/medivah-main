'use client';

import { useEffect } from 'react';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

export function GuestGuard({ children }) {
  const router = useRouter();

  const searchParams = useSearchParams();

  const { loading, authenticated } = useAuthContext();

  const returnTo = searchParams.get('returnTo') || CONFIG.auth.redirectPath;

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace(returnTo);
    }
  }, [loading, authenticated, returnTo, router]);

  // Render children immediately — no splash screen blocking the form.
  // If the user is already authenticated the redirect above will fire
  // once the auth check resolves in the background.
  return <>{children}</>;
}
