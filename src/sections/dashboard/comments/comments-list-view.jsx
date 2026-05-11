'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { supabase } from 'src/lib/supabase';
import { updateBlogComment, deleteBlogComment } from 'src/lib/supabase/blog-engagement';
import { useAuthContext } from 'src/auth/hooks';

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

// ----------------------------------------------------------------------

export function CommentsListView() {
  const { user } = useAuthContext();
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComment, setSelectedComment] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const ownedBlogIdsCache = useRef({ userId: null, ids: null });

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const from = page * rowsPerPage;
      const to = from + rowsPerPage - 1;
      const isAdmin = user?.role === 'admin';

      let ownedBlogIds = null;
      if (!isAdmin) {
        if (!user?.id) {
          setComments([]);
          setTotalCount(0);
          return 0;
        }
        if (ownedBlogIdsCache.current.userId === user.id) {
          ownedBlogIds = ownedBlogIdsCache.current.ids;
        } else {
          const { data: blogsRows, error: blogsError } = await supabase
            .from('blogs')
            .select('id')
            .eq('member_id', user.id);
          if (blogsError) throw blogsError;
          ownedBlogIds = (blogsRows || []).map((b) => b.id);
          ownedBlogIdsCache.current = { userId: user.id, ids: ownedBlogIds };
        }
        if (ownedBlogIds.length === 0) {
          setComments([]);
          setTotalCount(0);
          return 0;
        }
      }

      let query = supabase
        .from('blog_comments')
        .select(
          `
          *,
          blogs:blog_id (
            id,
            title,
            slug,
            member_id
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false });

      if (ownedBlogIds) {
        query = query.in('blog_id', ownedBlogIds);
      }

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setComments(data || []);
      const next = count ?? 0;
      setTotalCount(next);
      return next;
    } catch (error) {
      console.error('Error fetching comments:', error);
      setErrorMessage('Failed to load comments');
      setComments([]);
      setTotalCount(0);
      return 0;
    } finally {
      setLoading(false);
    }
  }, [filterStatus, user?.id, user?.role, page, rowsPerPage]);

  useEffect(() => {
    setPage(0);
  }, [filterStatus]);

  useEffect(() => {
    ownedBlogIdsCache.current = { userId: null, ids: null };
  }, [user?.id, user?.role]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      const result = await updateBlogComment(commentId, { status: newStatus });

      if (result.success) {
        setSuccessMessage(`Comment ${newStatus} successfully!`);
        const count = await fetchComments();
        const maxPage = Math.max(0, Math.ceil(Math.max(0, count) / rowsPerPage) - 1);
        if (page > maxPage) {
          setPage(maxPage);
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to update comment');
      }
    } catch (error) {
      setErrorMessage('Failed to update comment status');
      console.error(error);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const result = await deleteBlogComment(commentId);

      if (result.success) {
        setSuccessMessage('Comment deleted successfully!');
        const nextTotal = Math.max(0, totalCount - 1);
        const maxPage = Math.max(0, Math.ceil(nextTotal / rowsPerPage) - 1);
        if (page > maxPage) {
          setPage(maxPage);
        } else {
          await fetchComments();
        }
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage(result.error || 'Failed to delete comment');
      }
    } catch (error) {
      setErrorMessage('Failed to delete comment');
      console.error(error);
    }
  };

  const handleViewComment = (comment) => {
    setSelectedComment(comment);
    setViewDialogOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'spam':
        return 'error';
      case 'rejected':
        return 'default';
      default:
        return 'default';
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
          <Typography variant="h4">Comments Management</Typography>

          <TextField
            select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 150 }}
            size="small"
          >
            <MenuItem value="all">All Comments</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="spam">Spam</MenuItem>
          </TextField>
        </Stack>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage('')}>
            {errorMessage}
          </Alert>
        )}

        {/* Comments Table */}
        <Card>
          {loading && <LinearProgress />}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Author</TableCell>
                  <TableCell>Comment</TableCell>
                  <TableCell>Blog Post</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!loading && totalCount === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography variant="body2" color="text.secondary">
                        No comments found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  comments.map((comment) => (
                    <TableRow key={comment.id} hover>
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2">{comment.author_name}</Typography>
                          {comment.author_email && (
                            <Typography variant="caption" color="text.disabled">
                              {comment.author_email}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {comment.content}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {comment.blogs?.title || 'Unknown'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={comment.status}
                          color={getStatusColor(comment.status)}
                          size="small"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="caption">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            onClick={() => handleViewComment(comment)}
                            title="View details"
                          >
                            <Iconify icon="solar:eye-bold" />
                          </IconButton>

                          {comment.status !== 'approved' && (
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleStatusChange(comment.id, 'approved')}
                              title="Approve"
                            >
                              <Iconify icon="solar:check-circle-bold" />
                            </IconButton>
                          )}

                          {comment.status !== 'rejected' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleStatusChange(comment.id, 'rejected')}
                              title="Reject"
                            >
                              <Iconify icon="solar:close-circle-bold" />
                            </IconButton>
                          )}

                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleStatusChange(comment.id, 'spam')}
                            title="Mark as spam"
                          >
                            <Iconify icon="solar:shield-warning-bold" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(comment.id)}
                            title="Delete"
                          >
                            <Iconify icon="solar:trash-bin-trash-bold" />
                          </IconButton>
                        </Stack>
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

        {/* View Comment Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {selectedComment && (
            <>
              <DialogTitle>Comment Details</DialogTitle>
              <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Author
                    </Typography>
                    <Typography variant="body2">
                      {selectedComment.author_name}
                      {selectedComment.author_email && ` (${selectedComment.author_email})`}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Blog Post
                    </Typography>
                    <Typography variant="body2">
                      {selectedComment.blogs?.title || 'Unknown'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Comment
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {selectedComment.content}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Status
                    </Typography>
                    <Chip
                      label={selectedComment.status}
                      color={getStatusColor(selectedComment.status)}
                      size="small"
                    />
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Posted On
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedComment.created_at).toLocaleString()}
                    </Typography>
                  </Box>

                  {selectedComment.parent_comment_id && (
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Reply Type
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        This is a reply to another comment
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
                {selectedComment.status !== 'approved' && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                      handleStatusChange(selectedComment.id, 'approved');
                      setViewDialogOpen(false);
                    }}
                  >
                    Approve
                  </Button>
                )}
                {selectedComment.status !== 'rejected' && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                      handleStatusChange(selectedComment.id, 'rejected');
                      setViewDialogOpen(false);
                    }}
                  >
                    Reject
                  </Button>
                )}
              </DialogActions>
            </>
          )}
        </Dialog>
      </Stack>
    </Container>
  );
}
