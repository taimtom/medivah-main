'use client';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { fToNow } from 'src/utils/format-time';

import { supabase } from 'src/lib/supabase';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import { useAuthContext } from 'src/auth/hooks';

// ─── Notification type icons ─────────────────────────────────────────────────

const TYPE_ICON = {
  application_update: 'solar:document-bold-duotone',
  default: 'solar:bell-bold-duotone',
};

const STATUS_CHIP_COLOR = {
  hired: 'success',
  offer: 'primary',
  shortlisted: 'primary',
  interview: 'warning',
  rejected: 'error',
  closed: 'default',
  under_review: 'info',
  submitted: 'default',
};

// ─── Single notification item ─────────────────────────────────────────────────

function NotificationRow({ notification, onMarkRead }) {
  const newStatus = notification.metadata?.new_status;

  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
      sx={{
        py: 2,
        px: 2,
        borderRadius: 1,
        position: 'relative',
        bgcolor: notification.is_read ? 'transparent' : 'action.selected',
        cursor: 'default',
      }}
    >
      {/* Unread dot */}
      {!notification.is_read && (
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'info.main',
          }}
        />
      )}

      {/* Icon */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          bgcolor: 'background.neutral',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify
          icon={TYPE_ICON[notification.type] || TYPE_ICON.default}
          width={22}
          color={notification.is_read ? 'text.disabled' : 'primary.main'}
        />
      </Box>

      {/* Content */}
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: notification.is_read ? 400 : 600 }}
        >
          {notification.title}
        </Typography>

        {notification.body && (
          <Typography variant="body2" color="text.secondary">
            {notification.body}
          </Typography>
        )}

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant="caption" color="text.disabled">
            {fToNow(notification.created_at)}
          </Typography>

          {newStatus && (
            <Chip
              label={newStatus.replace(/_/g, ' ')}
              size="small"
              color={STATUS_CHIP_COLOR[newStatus] || 'default'}
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Stack>
      </Stack>

      {/* Mark read action */}
      {!notification.is_read && (
        <Tooltip title="Mark as read">
          <IconButton size="small" onClick={() => onMarkRead(notification.id)}>
            <Iconify icon="eva:done-all-fill" width={16} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 2, px: 2 }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ flexShrink: 0 }} />
      <Stack spacing={0.75} sx={{ flex: 1 }}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="85%" height={15} />
        <Skeleton width="30%" height={13} />
      </Stack>
    </Stack>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function NotificationsView() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/notifications?limit=100', {
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      const result = await res.json();
      if (res.ok) setNotifications(result.notifications || []);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = useCallback(
    async (id) => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    },
    []
  );

  const handleMarkAllRead = useCallback(async () => {
    setMarkingAll(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await fetch('/api/notifications?mark_all=true', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${session?.access_token || ''}` },
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setMarkingAll(false);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const displayed =
    currentTab === 'unread' ? notifications.filter((n) => !n.is_read) : notifications;

  const TABS = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
  ];

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack spacing={0.25}>
            <Typography variant="h4">Notifications</Typography>
            <Typography variant="body2" color="text.secondary">
              Stay up to date on your applications.
            </Typography>
          </Stack>

          {unreadCount > 0 && (
            <Button
              size="small"
              variant="outlined"
              disabled={markingAll}
              startIcon={<Iconify icon="eva:done-all-fill" />}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )}
        </Stack>

        <Card>
          {/* Tabs */}
          <CustomTabs variant="fullWidth" value={currentTab} onChange={(_, v) => setCurrentTab(v)}>
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                iconPosition="end"
                icon={
                  <Label
                    variant={(tab.value === currentTab && 'filled') || 'soft'}
                    color={tab.value === 'unread' ? 'info' : 'default'}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </CustomTabs>

          <Divider />

          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Stack divider={<Divider />}>
                {[1, 2, 3, 4].map((i) => <NotificationSkeleton key={i} />)}
              </Stack>
            ) : displayed.length === 0 ? (
              <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
                <Iconify icon="solar:bell-bold-duotone" width={48} color="text.disabled" />
                <Typography variant="h6" color="text.secondary">
                  {currentTab === 'unread' ? 'All caught up!' : 'No notifications yet'}
                </Typography>
                <Typography variant="body2" color="text.disabled" align="center">
                  {currentTab === 'unread'
                    ? 'You have no unread notifications.'
                    : 'Notifications about your applications will appear here.'}
                </Typography>
              </Stack>
            ) : (
              <Stack divider={<Divider />}>
                {displayed.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
