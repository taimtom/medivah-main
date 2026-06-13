'use client';

import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Skeleton from '@mui/material/Skeleton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { supabase } from 'src/lib/supabase';

import { useAuthContext } from 'src/auth/hooks';

const NEXT_STATUSES = ['under_review', 'shortlisted', 'interview', 'offer', 'hired', 'rejected', 'closed'];

const STATUS_COLOR = {
  submitted: 'default',
  under_review: 'info',
  shortlisted: 'primary',
  interview: 'warning',
  hired: 'success',
  rejected: 'error',
  closed: 'default',
};

function ApplicationsTableSkeleton() {
  return (
    <Card>
      <CardContent sx={{ p: 0 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Job</TableCell>
              <TableCell>Applicant</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Current Status</TableCell>
              <TableCell>Applied</TableCell>
              <TableCell>Update Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((row) => (
              <TableRow key={row}>
                <TableCell><Skeleton width="80%" /></TableCell>
                <TableCell><Skeleton width="70%" /></TableCell>
                <TableCell><Skeleton width="60%" /></TableCell>
                <TableCell><Skeleton variant="rounded" width={88} height={24} /></TableCell>
                <TableCell><Skeleton width={72} /></TableCell>
                <TableCell><Skeleton variant="rounded" width={96} height={36} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function RecruiterApplicationsView() {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState(null);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchRows = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch('/api/applications?limit=200', {
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      });
      const result = await response.json();
      if (response.ok) setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const initiateStatusChange = (applicationId, newStatus) => {
    setPendingChange({ applicationId, newStatus });
    setNote('');
    setDialogOpen(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;
    setUpdating(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/applications/${pendingChange.applicationId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({
          new_status: pendingChange.newStatus,
          note: note || null,
        }),
      });
      if (response.ok) {
        setDialogOpen(false);
        fetchRows();
      }
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Applications Received</Typography>

        {loading ? (
          <ApplicationsTableSkeleton />
        ) : rows.length === 0 ? (
          <Typography color="text.secondary">No applications yet.</Typography>
        ) : (
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Job</TableCell>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Current Status</TableCell>
                    <TableCell>Applied</TableCell>
                    <TableCell>Update Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.jobs?.title || 'Unknown'}</TableCell>
                      <TableCell>
                        {row.applicant_profile?.full_name ? (
                          <Link
                            component={RouterLink}
                            href={paths.dashboard.applications.applicant(row.applicant_id)}
                            underline="hover"
                            variant="body2"
                            fontWeight={500}
                          >
                            {row.applicant_profile.full_name}
                          </Link>
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            Profile not set
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{row.applicant_profile?.location || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status.replace('_', ' ')}
                          size="small"
                          color={STATUS_COLOR[row.status] || 'default'}
                        />
                      </TableCell>
                      <TableCell>{row.applied_at ? new Date(row.applied_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Select
                          size="small"
                          value=""
                          displayEmpty
                          onChange={(event) => initiateStatusChange(row.id, event.target.value)}
                        >
                          <MenuItem value="" disabled>
                            Move to…
                          </MenuItem>
                          {NEXT_STATUSES.map((status) => (
                            <MenuItem key={status} value={status}>
                              {status.replace('_', ' ')}
                            </MenuItem>
                          ))}
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          Move to &ldquo;{pendingChange?.newStatus?.replace('_', ' ')}&rdquo;
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Note (optional)"
            multiline
            minRows={2}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmStatusChange} disabled={updating}>
            {updating ? 'Updating…' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
