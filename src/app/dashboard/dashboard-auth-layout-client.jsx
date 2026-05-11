'use client';

import { useState, useEffect } from 'react';

import { supabase } from 'src/lib/supabase';
import { DashboardLayout } from 'src/layouts/dashboard';
import { getDashboardNavDataByRole } from 'src/layouts/config-nav-dashboard';

import { useAuthContext } from 'src/auth/hooks';
import { RoleBasedGuard } from 'src/auth/guard/role-based-guard';

export function DashboardAuthLayoutClient({ children }) {
  const { user } = useAuthContext();
  const role = user?.role || 'member';
  const nav = getDashboardNavDataByRole(role);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.id || role === 'admin') return;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      const res = await fetch('/api/notifications?limit=20', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const result = await res.json().catch(() => ({}));
      if (res.ok) {
        setNotifications(result.notifications || []);
        setUnreadCount(result.unreadCount || 0);
      }
    };

    fetchNotifications();
  }, [user?.id, role]);

  const markNotificationRead = async (notificationId) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
      },
      body: JSON.stringify({ id: notificationId }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const liveNotifications = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    description: n.body,
    avatarUrl: null,
    type: n.type || 'application_update',
    category: n.metadata?.new_status?.replace(/_/g, ' ') || 'update',
    isUnRead: !n.is_read,
    createdAt: n.created_at,
    onRead: () => markNotificationRead(n.id),
  }));

  return (
    <RoleBasedGuard currentRole={role} acceptRoles={['admin', 'recruiter', 'member', 'applicant']} hasContent>
      <DashboardLayout
        data={{
          nav,
          notifications: liveNotifications,
          notificationsUnreadCount: unreadCount,
          showNotificationsBell: role !== 'admin',
        }}
      >
        {children}
      </DashboardLayout>
    </RoleBasedGuard>
  );
}
