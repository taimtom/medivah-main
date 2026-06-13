'use client';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { supabase } from 'src/lib/supabase';
import {
  ADMIN_ROLE,
  SWITCHABLE_ROLES,
  getRoleLandingPath,
  getRoleOnboardingPath,
  isSuperAdmin,
} from 'src/lib/role-capabilities';

import { useAuthContext } from 'src/auth/hooks';

const STATUS_LABELS = {
  not_started: 'Set up',
  in_progress: 'Continue setup',
  active: 'Ready',
};

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || '';
}

export function RoleSwitcher() {
  const router = useRouter();
  const { user, checkUserSession } = useAuthContext();
  const [anchorEl, setAnchorEl] = useState(null);
  const [capabilities, setCapabilities] = useState(user?.roleCapabilities || []);
  const [activeRole, setActiveRole] = useState(user?.role || 'recruiter');
  const [loadingRole, setLoadingRole] = useState('');
  const [error, setError] = useState('');

  const open = Boolean(anchorEl);

  useEffect(() => {
    setCapabilities(user?.roleCapabilities || []);
    setActiveRole(user?.role || 'recruiter');
  }, [user?.role, user?.roleCapabilities]);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user?.id) return;

      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch('/api/account/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json().catch(() => ({}));
      if (response.ok) {
        setCapabilities(result.roleCapabilities || []);
        setActiveRole(result.activeRole || user.role || 'recruiter');
      }
    };

    fetchRoles();
  }, [user?.id, user?.role]);

  const activeOption = useMemo(() => {
    if (activeRole === 'admin') return ADMIN_ROLE;
    return SWITCHABLE_ROLES.find((option) => option.role === activeRole);
  }, [activeRole]);

  const roleOptions = useMemo(() => {
    const baseRoles = SWITCHABLE_ROLES.map((option) => ({
      ...option,
      ...(capabilities.find((capability) => capability.role === option.role) || {
        status: 'not_started',
      }),
    }));

    if (!isSuperAdmin(user?.businessRole)) {
      return baseRoles;
    }

    const adminCapability = capabilities.find((capability) => capability.role === 'admin') || {
      ...ADMIN_ROLE,
      status: 'active',
    };

    return [...baseRoles, adminCapability];
  }, [capabilities, user?.businessRole]);

  const refreshUser = async () => {
    await checkUserSession({ refreshProfile: true });
  };

  const handleRoleAction = async (option) => {
    setError('');
    setLoadingRole(option.role);

    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Your session has expired. Please sign in again.');

      const isReady = option.status === 'active' || option.role === 'admin';
      const endpoint = isReady ? '/api/account/roles/switch' : '/api/account/roles';
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: option.role }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.status === 409) {
        setCapabilities(result.roleCapabilities || capabilities);
        setAnchorEl(null);
        router.push(result.onboardingPath || getRoleOnboardingPath(option.role));
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || 'Unable to update role');
      }

      setCapabilities(result.roleCapabilities || capabilities);
      setActiveRole(result.activeRole || option.role);
      await refreshUser();
      setAnchorEl(null);
      router.push(
        result.landingPath ||
          result.onboardingPath ||
          (isReady ? getRoleLandingPath(option.role) : getRoleOnboardingPath(option.role))
      );
    } catch (roleError) {
      setError(roleError.message);
    } finally {
      setLoadingRole('');
    }
  };

  if (!user) return null;

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
      >
        Switch Role: {activeOption?.label || 'Recruiter'}
      </Button>

      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 340, p: 1 } }}
      >
        <Box sx={{ px: 1, pb: 1 }}>
          <Typography variant="subtitle2">Choose dashboard view</Typography>
          <Typography variant="caption" color="text.secondary">
            {isSuperAdmin(user?.businessRole)
              ? 'Switch between applicant, recruiter, and super admin workspaces.'
              : 'One account can keep both applicant and recruiter workspaces.'}
          </Typography>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        ) : null}

        {roleOptions.map((option) => {
          const isCurrent = option.role === activeRole;
          const isLoading = loadingRole === option.role;
          const actionLabel = isCurrent
            ? 'Current'
            : option.role === 'admin' || option.status === 'active'
              ? 'Switch'
              : STATUS_LABELS[option.status] || 'Set up';

          return (
            <MenuItem
              key={option.role}
              disabled={isCurrent || Boolean(loadingRole)}
              onClick={() => handleRoleAction(option)}
              sx={{ alignItems: 'flex-start', borderRadius: 1 }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.label}
                    <Chip size="small" label={STATUS_LABELS[option.status] || option.status} />
                  </Box>
                }
                secondary={option.description}
              />
              {isLoading ? <CircularProgress size={18} /> : <Typography variant="caption">{actionLabel}</Typography>}
            </MenuItem>
          );
        })}

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            router.push(paths.dashboard.root);
          }}
          sx={{ borderRadius: 1 }}
        >
          <ListItemText primary="Dashboard home" />
        </MenuItem>
      </Menu>
    </>
  );
}
