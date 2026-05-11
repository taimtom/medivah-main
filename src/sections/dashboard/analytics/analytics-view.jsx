'use client';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';
import { AnalyticsWidgetSummary } from './analytics-widget-summary';

// ----------------------------------------------------------------------

const EMPTY_STATS = {
  totalBlogs: 0,
  publishedBlogs: 0,
  totalProducts: 0,
  publishedProducts: 0,
  totalJobs: 0,
  activeJobs: 0,
  totalOrders: 0,
  totalRevenue: 0,
  creditsPurchased: 0,
  creditsUsed: 0,
  netEarnings: 0,
  applicationsSubmitted: 0,
  profileCompletionRate: 0,
  applicationsPerApplicant: 0,
  applicationConversionRate: 0,
};

const EMPTY_ENGAGEMENT = {
  totalLikes: 0,
  totalDislikes: 0,
  totalComments: 0,
  pendingComments: 0,
  topLikedBlogs: [],
  topLikers: [],
};

export function AnalyticsView() {
  const { user, loading: authLoading } = useAuthContext();
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    totalProducts: 0,
    publishedProducts: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalOrders: 0,
    totalRevenue: 0,
    creditsPurchased: 0,
    creditsUsed: 0,
    netEarnings: 0,
    applicationsSubmitted: 0,
    profileCompletionRate: 0,
    applicationsPerApplicant: 0,
    applicationConversionRate: 0,
  });
  const [engagementStats, setEngagementStats] = useState({
    totalLikes: 0,
    totalDislikes: 0,
    totalComments: 0,
    pendingComments: 0,
    topLikedBlogs: [],
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    if (authLoading) return undefined;

    if (!user?.id) {
      setStats(EMPTY_STATS);
      setEngagementStats(EMPTY_ENGAGEMENT);
      setRecentActivity([]);
      setLoading(false);
      return undefined;
    }

    const ac = new AbortController();

    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          role: user.role || 'member',
          memberId: user.id,
        });
        const response = await fetch(`/api/dashboard/analytics/summary?${params.toString()}`, {
          signal: ac.signal,
        });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Failed to load analytics');

        setStats(body.stats);
        setRecentActivity(body.recentActivity || []);
        setEngagementStats({
          ...EMPTY_ENGAGEMENT,
          ...body.engagement,
          topLikedBlogs: body.engagement?.topLikedBlogs || [],
        });
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Error fetching analytics:', error);
        setStats(EMPTY_STATS);
        setEngagementStats(EMPTY_ENGAGEMENT);
        setRecentActivity([]);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();

    return () => ac.abort();
  }, [authLoading, user?.id, user?.role]);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'blog':
        return 'solar:document-text-bold-duotone';
      case 'product':
        return 'solar:cart-large-4-bold-duotone';
      case 'job':
        return 'solar:case-minimalistic-bold-duotone';
      default:
        return 'solar:file-bold-duotone';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'blog':
        return 'info';
      case 'product':
        return 'success';
      case 'job':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (authLoading || loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ width: '100%' }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isApplicant = user?.role === 'applicant';

  if (isApplicant) {
    const breakdown = stats.applicationStatusBreakdown || {};
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4">My Dashboard</Typography>
          {!isSupabaseConfigured && (
            <Alert severity="warning">
              <AlertTitle>Database Not Configured</AlertTitle>
              Supabase is not configured. Add credentials to .env.local.
            </Alert>
          )}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Applications Submitted"
                total={stats.applicationsSubmitted}
                icon="solar:document-add-bold-duotone"
                color="info"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Saved Jobs"
                total={stats.savedJobs || 0}
                icon="solar:bookmark-bold-duotone"
                color="warning"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Profile Completion"
                total={stats.profileCompletionRate}
                icon="solar:user-check-bold-duotone"
                color={stats.profileCompletionRate >= 70 ? 'success' : 'error'}
                subtitle={stats.profileCompletionRate < 50 ? 'Complete profile to apply' : undefined}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <AnalyticsWidgetSummary
                title="Shortlisted / Interviews"
                total={(breakdown.shortlisted || 0) + (breakdown.interview || 0)}
                icon="solar:star-bold-duotone"
                color="success"
              />
            </Grid>
          </Grid>
          {Object.keys(breakdown).length > 0 && (
            <Card>
              <CardHeader title="Applications by Status" />
              <CardContent>
                <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                  {Object.entries(breakdown).map(([status, count]) => (
                    <Chip key={status} label={`${status}: ${count}`} size="small" variant="outlined" />
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Typography variant="h4">Analytics Dashboard</Typography>

        {/* Configuration Warning */}
        {!isSupabaseConfigured && (
          <Alert severity="warning">
            <AlertTitle>Database Not Configured</AlertTitle>
            Supabase is not configured yet. Please add your Supabase URL and API key to the <code>.env.local</code> file.
            <br />
            See <code>ENV_ADDITIONS.md</code> for setup instructions.
          </Alert>
        )}

        {/* Content Stats Grid */}
        <Grid container spacing={3}>
          {/* Blog Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Blogs"
              total={stats.totalBlogs}
              icon="solar:document-text-bold-duotone"
              color="info"
              subtitle={`${stats.publishedBlogs} published`}
            />
          </Grid>

          {/* Product Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Products"
              total={stats.totalProducts}
              icon="solar:cart-large-4-bold-duotone"
              color="success"
              subtitle={`${stats.publishedProducts} published`}
            />
          </Grid>

          {/* Job Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Jobs"
              total={stats.totalJobs}
              icon="solar:case-minimalistic-bold-duotone"
              color="warning"
              subtitle={`${stats.activeJobs} active`}
            />
          </Grid>

          {/* Order Stats */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Orders"
              total={stats.totalOrders}
              icon="solar:dollar-minimalistic-bold-duotone"
              color="error"
              subtitle={formatCurrency(stats.totalRevenue)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Credits Purchased"
              total={stats.creditsPurchased}
              icon="solar:ticket-bold-duotone"
              color="primary"
              subtitle={`${stats.creditsUsed} used`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Net Earnings"
              total={stats.netEarnings}
              icon="solar:wallet-money-bold-duotone"
              color="success"
              subtitle={formatCurrency(stats.netEarnings)}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Applications Submitted"
              total={stats.applicationsSubmitted}
              icon="solar:document-add-bold-duotone"
              color="info"
              subtitle={`${stats.applicationConversionRate}% conversion`}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Profile Completion Rate"
              total={stats.profileCompletionRate}
              icon="solar:user-check-bold-duotone"
              color="secondary"
              subtitle={`${stats.applicationsPerApplicant} apps/applicant`}
            />
          </Grid>
        </Grid>

        {/* Engagement Stats Section */}
        <Typography variant="h5" sx={{ mt: 2 }}>Engagement Metrics</Typography>
        
        <Grid container spacing={3}>
          {/* Total Likes */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Likes"
              total={engagementStats.totalLikes}
              icon="eva:heart-fill"
              color="error"
            />
          </Grid>

          {/* Total Dislikes */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Dislikes"
              total={engagementStats.totalDislikes}
              icon="eva:heart-outline"
              color="secondary"
            />
          </Grid>

          {/* Total Comments */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Total Comments"
              total={engagementStats.totalComments}
              icon="eva:message-circle-fill"
              color="info"
              subtitle={`${engagementStats.pendingComments} pending approval`}
            />
          </Grid>

          {/* Engagement Rate */}
          <Grid item xs={12} sm={6} md={3}>
            <AnalyticsWidgetSummary
              title="Net Engagement"
              total={engagementStats.totalLikes - engagementStats.totalDislikes}
              icon="eva:trending-up-fill"
              color="success"
            />
          </Grid>
        </Grid>

        {/* Top Liked Blogs and Recent Activity */}
        <Grid container spacing={3}>
          {/* Top Liked Blogs */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Most Liked Blog Posts" />
              <CardContent>
                {engagementStats.topLikedBlogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No blogs with likes yet
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {engagementStats.topLikedBlogs.map((blog, index) => (
                      <Stack
                        key={blog.id}
                        direction="row"
                        alignItems="center"
                        spacing={2}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'error.lighter',
                            color: 'error.main',
                            fontWeight: 'bold',
                          }}
                        >
                          #{index + 1}
                        </Box>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>
                            {blog.title}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Iconify icon="eva:heart-fill" width={14} color="error.main" />
                            <Typography variant="caption" color="text.disabled">
                              {blog.likesCount} likes, {blog.dislikesCount} dislikes
                            </Typography>
                          </Stack>
                        </Box>

                        <Chip
                          label={`+${blog.netLikes}`}
                          size="small"
                          color="error"
                          variant="soft"
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Activity" />
              <CardContent>
                {recentActivity.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity
                  </Typography>
                ) : (
                  <Stack spacing={2}>
                    {recentActivity.map((item) => (
                      <Stack
                        key={`${item.type}-${item.id}`}
                        direction="row"
                        alignItems="center"
                        spacing={2}
                      >
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: `${getActivityColor(item.type)}.lighter`,
                            color: `${getActivityColor(item.type)}.main`,
                          }}
                        >
                          <Iconify icon={getActivityIcon(item.type)} width={24} />
                        </Box>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Typography variant="subtitle2" noWrap>
                            {item.title || item.name}
                          </Typography>
                          <Typography variant="caption" color="text.disabled">
                            {new Date(item.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>

                        <Chip
                          label={item.type}
                          size="small"
                          color={getActivityColor(item.type)}
                          variant="soft"
                        />
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Google Analytics Info */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Google Analytics" />
              <CardContent>
                <Stack spacing={2}>
                  <Typography variant="body2" color="text.secondary">
                    Track your website traffic and user behavior with Google Analytics 4.
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 1,
                      bgcolor: 'primary.lighter',
                      color: 'primary.darker',
                    }}
                  >
                    <Typography variant="body2">
                      To view detailed analytics, visit your{' '}
                      <a
                        href="https://analytics.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'underline' }}
                      >
                        Google Analytics Dashboard
                      </a>
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.disabled">
                    Tracking ID: {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'Not configured'}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    </Container>
  );
}

