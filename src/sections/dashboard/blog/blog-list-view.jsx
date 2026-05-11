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
import { scopeOwnedQuery } from 'src/lib/ownership';
import { useAuthContext } from 'src/auth/hooks';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

// ----------------------------------------------------------------------

export function BlogListView() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [blogs, setBlogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      const baseQuery = supabase.from('blogs').select('*', { count: 'exact' });
      const query = scopeOwnedQuery(baseQuery, user?.role, user?.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      const { data: rows, error, count } = await query;

      if (error) throw error;
      setBlogs(rows || []);
      setTotalCount(count ?? 0);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role, page, rowsPerPage]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  const handleMenuOpen = (event, blog) => {
    setAnchorEl(event.currentTarget);
    setSelectedBlog(blog);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (selectedBlog) {
      router.push(paths.dashboard.blog.edit(selectedBlog.id));
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBlog) return;

    setDeleting(true);
    try {
      const deleteQuery = scopeOwnedQuery(
        supabase.from('blogs').delete(),
        user?.role,
        user?.id
      ).eq('id', selectedBlog.id);
      const { error } = await deleteQuery;

      if (error) throw error;

      const nextTotal = Math.max(0, totalCount - 1);
      const maxPage = Math.max(0, Math.ceil(nextTotal / rowsPerPage) - 1);
      setDeleteDialogOpen(false);
      setSelectedBlog(null);
      setTotalCount(nextTotal);
      if (page > maxPage) {
        setPage(maxPage);
      } else {
        await fetchBlogs();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const publishQuery = scopeOwnedQuery(
        supabase.from('blogs').update({ published: !blog.published }),
        user?.role,
        user?.id
      ).eq('id', blog.id);
      const { error } = await publishQuery;

      if (error) throw error;

      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, published: !b.published } : b))
      );
    } catch (error) {
      console.error('Error toggling publish status:', error);
      alert('Failed to update blog status');
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
          <Typography variant="h4">Blog Management</Typography>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => router.push(paths.dashboard.blog.new)}
          >
            New Blog Post
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
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && totalCount === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Box sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No blog posts yet. Create your first one!
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  blogs.map((blog) => (
                    <TableRow key={blog.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{blog.title}</Typography>
                        {blog.excerpt && (
                          <Typography variant="caption" color="text.secondary" noWrap>
                            {blog.excerpt.substring(0, 60)}...
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {blog.category && (
                          <Chip label={blog.category} size="small" variant="soft" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={blog.published ? 'Published' : 'Draft'}
                          size="small"
                          color={blog.published ? 'success' : 'default'}
                          onClick={() => handleTogglePublish(blog)}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {new Date(blog.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={(e) => handleMenuOpen(e, blog)}>
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
        <DialogTitle>Delete Blog Post?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedBlog?.title}? This action cannot be undone.
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


