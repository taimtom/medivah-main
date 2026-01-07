'use client';

import { useState, useEffect, useCallback } from 'react';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const SUBSCRIBER_STATUSES = [
  { value: 'all', label: 'All Status' },
  { value: 'subscribed', label: 'Subscribed' },
  { value: 'unsubscribed', label: 'Unsubscribed' },
  { value: 'bounced', label: 'Bounced' },
];

const ITEMS_PER_PAGE = 25;

export function NewsletterSubscribersView() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * ITEMS_PER_PAGE;
      let url = `/api/newsletter/subscribers?limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      if (statusFilter !== 'all') {
        url += `&status=${statusFilter}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        let filtered = data.subscribers || [];
        if (searchQuery) {
          filtered = filtered.filter(
            (sub) =>
              sub.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
              (sub.name && sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
          );
        }
        setSubscribers(filtered);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchQuery]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'subscribed':
        return 'success';
      case 'unsubscribed':
        return 'default';
      case 'bounced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getSourceLabel = (source) => {
    switch (source) {
      case 'purchase':
        return 'Purchase';
      case 'signup':
        return 'Signup';
      default:
        return 'Manual';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Newsletter Subscribers</Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            fullWidth
            placeholder="Search by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 200 }}
            label="Status"
          >
            {SUBSCRIBER_STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <Card>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Subscribed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscribers.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No subscribers found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscribers.map((subscriber) => (
                    <TableRow key={subscriber.id} hover>
                      <TableCell>
                        <Typography variant="body2">{subscriber.email}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{subscriber.name || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={subscriber.status}
                          size="small"
                          color={getStatusColor(subscriber.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{getSourceLabel(subscriber.source)}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {total > ITEMS_PER_PAGE && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={Math.ceil(total / ITEMS_PER_PAGE)}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </Card>
      </Stack>
    </Container>
  );
}

