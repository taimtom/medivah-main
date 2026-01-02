'use client';

import { useState, useEffect, useCallback } from 'react';

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
import CircularProgress from '@mui/material/CircularProgress';
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

// ----------------------------------------------------------------------

export function CommentsListView() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedComment, setSelectedComment] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('blog_comments')
        .select(`
          *,
          blogs:blog_id (
            id,
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setErrorMessage('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      const result = await updateBlogComment(commentId, { status: newStatus });

      if (result.success) {
        setSuccessMessage(`Comment ${newStatus} successfully!`);
        await fetchComments();
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
        await fetchComments();
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

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

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
                {comments.length === 0 ? (
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

