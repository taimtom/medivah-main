'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { Iconify } from 'src/components/iconify';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';
import { scopeOwnedQuery } from 'src/lib/ownership';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

// ----------------------------------------------------------------------

export function JobListView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      const query = scopeOwnedQuery(
        supabase.from('jobs').select('*', { count: 'exact' }),
        user?.role,
        user?.id
      )
        .order('created_at', { ascending: false })
        .range(from, to);
      const { data, error, count } = await query;

      if (error) throw error;
      setJobs(data || []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, page, rowsPerPage]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleMenuOpen = (event, job) => {
    setAnchorEl(event.currentTarget);
    setSelectedJob(job);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedJob) {
      router.push(paths.dashboard.jobs.edit(selectedJob.id));
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedJob) return;

    setDeleting(true);
    try {
      const { error } = await scopeOwnedQuery(
        supabase.from('jobs').delete(),
        user?.role,
        user?.id
      ).eq('id', selectedJob.id);

      if (error) throw error;

      const nextTotal = Math.max(0, totalCount - 1);
      const maxPage = Math.max(0, Math.ceil(nextTotal / rowsPerPage) - 1);
      setDeleteDialogOpen(false);
      setSelectedJob(null);
      setTotalCount(nextTotal);
      if (page > maxPage) {
        setPage(maxPage);
      } else {
        await fetchJobs();
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (job) => {
    try {
      const { error } = await scopeOwnedQuery(
        supabase.from('jobs').update({ published: !job.published }),
        user?.role,
        user?.id
      ).eq('id', job.id);

      if (error) throw error;

      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, published: !j.published } : j))
      );
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update job status');
    }
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Job Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.jobs.new)}
          >
            New Job
          </Button>
        </Stack>

        {/* Table */}
        <Card>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && totalCount === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No job postings yet. Create your first one!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job) => (
                    <TableRow key={job.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{job.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{job.company}</Typography>
                      </TableCell>
                      <TableCell>
                        {job.type && (
                          <Chip label={job.type} size="small" variant="soft" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{job.location}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={job.published ? 'Published' : 'Draft'}
                          size="small"
                          color={job.published ? 'success' : 'default'}
                          onClick={() => handleTogglePublish(job)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(job.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, job)}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
          />
        </Card>
      </Stack>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" sx={{ mr: 2 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => !deleting && setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Job?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedJob?.title}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}


