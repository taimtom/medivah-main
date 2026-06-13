'use client';

import { useRef, useMemo, useEffect, useCallback } from 'react';

import { useSetState } from 'src/hooks/use-set-state';

import { supabase } from 'src/lib/supabase';
import { ensureMemberProfile } from 'src/lib/member-profile';
import { normalizeDashboardRole } from 'src/lib/role-capabilities';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  // Cache member profiles by user ID to avoid redundant DB queries on every session check.
  const profileCache = useRef({});

  const mapUser = useCallback(async (sessionUser) => {
    let memberProfile = profileCache.current[sessionUser.id];
    if (!memberProfile) {
      memberProfile = await ensureMemberProfile(sessionUser);
      profileCache.current[sessionUser.id] = memberProfile;
    }

    return {
      id: sessionUser.id,
      email: sessionUser.email,
      displayName: sessionUser.user_metadata?.full_name || sessionUser.email?.split('@')[0],
      photoURL: sessionUser.user_metadata?.avatar_url || null,
      role: normalizeDashboardRole(
        memberProfile?.active_role ||
          sessionUser.user_metadata?.active_role ||
          memberProfile?.business_role ||
          sessionUser.user_metadata?.business_role
      ),
      businessRole: memberProfile?.business_role || sessionUser.user_metadata?.business_role || 'member',
      roles: (memberProfile?.role_capabilities || [])
        .filter((capability) => capability.status === 'active')
        .map((capability) => capability.role),
      roleCapabilities: memberProfile?.role_capabilities || [],
      company: memberProfile?.company || null,
      memberProfile,
    };
  }, []);

  const checkUserSession = useCallback(async (options = {}) => {
    try {
      if (options.refreshProfile) {
        profileCache.current = {};
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        const mappedUser = await mapUser(session.user);
        setState({ user: mappedUser, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('Error checking session:', error);
      setState({ user: null, loading: false });
    }
  }, [setState, mapUser]);

  useEffect(() => {
    checkUserSession();

    // Defer async work so Supabase auth is not locked (awaiting getSession/updateUser
    // inside this callback deadlocks concurrent auth calls from sign-in/sign-up forms).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && session?.user) {
        setTimeout(async () => {
          if (event === 'USER_UPDATED') {
            profileCache.current = {};
          }
          const mappedUser = await mapUser(session.user);
          setState({ user: mappedUser, loading: false });

          if (event === 'SIGNED_IN' && ['member', 'recruiter'].includes(mappedUser.businessRole)) {
            const token = session.access_token;
            if (token && typeof window !== 'undefined') {
              fetch(`${window.location.origin}/api/credits/grant-free`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ type: 'signup' }),
              }).catch(() => {});
            }
          }
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        profileCache.current = {};
        setState({ user: null, loading: false });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}


