'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { Iconify } from 'src/components/iconify';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function NewsletterAnalyticsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const newsletterId = searchParams.get('id');

  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    if (newsletterId) {
      fetchAnalytics();
    }
  }, [newsletterId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/newsletter/analytics?newsletter_id=${newsletterId}`);
      const data = await response.json();

      if (response.ok) {
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (!analytics) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Typography>No analytics data found</Typography>
      </Container>
    );
  }

  const { newsletter, metrics, top_links, opens_over_time } = analytics;

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Newsletter Analytics</Typography>
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(paths.dashboard.newsletter.root)}
          >
            Back
          </Button>
        </Stack>

        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {newsletter.subject}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sent: {newsletter.sent_at ? new Date(newsletter.sent_at).toLocaleString() : 'Not sent yet'}
            </Typography>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4">{metrics.sent.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Sent
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4">{metrics.opened.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Opens ({metrics.open_rate}%)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4">{metrics.clicked.toLocaleString()}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Clicks ({metrics.click_rate}%)
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="h4">{metrics.click_to_open_rate}%</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click-to-Open Rate
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Engagement Rates */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Engagement Rates
            </Typography>
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Open Rate
                  </Typography>
                  <Typography variant="h4">{metrics.open_rate}%</Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={metrics.open_rate} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Click Rate
                  </Typography>
                  <Typography variant="h4">{metrics.click_rate}%</Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={metrics.click_rate} />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Click-to-Open Rate
                  </Typography>
                  <Typography variant="h4">{metrics.click_to_open_rate}%</Typography>
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress variant="determinate" value={metrics.click_to_open_rate} />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Top Links */}
        {top_links && top_links.length > 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Top Clicked Links
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Link</TableCell>
                      <TableCell align="right">Total Clicks</TableCell>
                      <TableCell align="right">Unique Clicks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {top_links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {link.original_url}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{link.click_count || 0}</TableCell>
                        <TableCell align="right">{link.unique_click_count || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}

