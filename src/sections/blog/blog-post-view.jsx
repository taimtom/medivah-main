'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { supabase } from 'src/lib/supabase';
import { MainLayout } from 'src/layouts/main';
import { BlogDisclosureSection } from 'src/sections/disclosure';
import {
  toggleBlogLike,
  getBlogLikeStats,
  getBlogComments,
  addBlogComment,
} from 'src/lib/supabase/blog-engagement';

// ----------------------------------------------------------------------

export function BlogPostView({ slug }) {
  const theme = useTheme();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Likes/Dislikes state
  const [likeStats, setLikeStats] = useState({ likesCount: 0, dislikesCount: 0, userReaction: null });
  const [likesLoading, setLikesLoading] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({
    content: '',
    authorName: '',
    authorEmail: '',
    parentCommentId: null,
  });
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState('');
  const [commentError, setCommentError] = useState('');

  useEffect(() => {
    fetchBlog();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) throw error;
      setBlog(data);
      
      // Fetch likes and comments after blog is loaded
      if (data) {
        fetchLikeStats(data.id);
        fetchComments(data.id);
      }
    } catch (error) {
      console.error('Error fetching blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStats = async (blogId) => {
    const stats = await getBlogLikeStats(blogId);
    setLikeStats(stats);
  };

  const fetchComments = async (blogId) => {
    setCommentsLoading(true);
    const data = await getBlogComments(blogId);
    setComments(data);
    setCommentsLoading(false);
  };

  const handleLike = async (isLike) => {
    if (!blog) return;
    
    setLikesLoading(true);
    const result = await toggleBlogLike(blog.id, isLike);
    
    if (result.success) {
      // Refresh like stats
      await fetchLikeStats(blog.id);
    } else {
      alert(result.error || 'Failed to update reaction');
    }
    
    setLikesLoading(false);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!blog) return;
    if (!commentForm.content.trim()) {
      setCommentError('Please enter a comment');
      return;
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    // Require name for all users
    if (!commentForm.authorName.trim()) {
      setCommentError('Please enter your name');
      return;
    }

    setCommentSubmitting(true);
    setCommentError('');
    setCommentSuccess('');

    const result = await addBlogComment({
      blogId: blog.id,
      content: commentForm.content,
      authorName: commentForm.authorName, // Use the name from the form
      authorEmail: commentForm.authorEmail || null,
      parentCommentId: commentForm.parentCommentId, // Use from form state
    });

    if (result.success) {
      const isReply = commentForm.parentCommentId !== null;
      setCommentSuccess(isReply ? 'Reply added successfully!' : 'Comment added successfully!');
      setCommentForm({
        content: '',
        authorName: '',
        authorEmail: '',
        parentCommentId: null,
      });
      
      // Refresh comments
      await fetchComments(blog.id);
      
      // Clear success message after 3 seconds
      setTimeout(() => setCommentSuccess(''), 3000);
    } else {
      setCommentError(result.error || 'Failed to add comment');
    }

    setCommentSubmitting(false);
  };

  const handleReply = (commentId) => {
    setCommentForm({ ...commentForm, parentCommentId: commentId });
    
    // Scroll to comment form smoothly
    const commentFormElement = document.getElementById('comment-form');
    if (commentFormElement) {
      commentFormElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!blog) {
    return (
      <MainLayout>
        <Container sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Blog Post Not Found
          </Typography>
          <Button
            component={RouterLink}
            href={paths.blog.root}
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to Blog
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        {/* Hero Section */}
        <Box
        sx={{
          py: { xs: 8, md: 10 },
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={3}>
            <Button
              component={RouterLink}
              href={paths.blog.root}
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              sx={{ width: 'fit-content' }}
            >
              Back to Blog
            </Button>

            {blog.category && (
              <Chip
                label={blog.category}
                color="primary"
                sx={{ width: 'fit-content' }}
              />
            )}

            <Typography variant="h2">{blog.title}</Typography>

            {blog.excerpt && (
              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                {blog.excerpt}
              </Typography>
            )}

            {blog.published_at && (
              <Typography variant="body2" color="text.disabled">
                Published on{' '}
                {new Date(blog.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            )}
          </Stack>
        </Container>
      </Box>

      {/* Featured Image */}
      {blog.featured_image && (
        <Container maxWidth="md" sx={{ mt: -8, mb: 8 }}>
          <Box
            component="img"
            src={blog.featured_image}
            alt={blog.title}
            sx={{
              width: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: (theme) => theme.customShadows.z24,
            }}
          />
        </Container>
      )}

      {/* Content */}
      <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
        <Box
          sx={{
            '& h1, & h2, & h3, & h4, & h5, & h6': {
              mt: 3,
              mb: 2,
            },
            '& p': {
              mb: 2,
              lineHeight: 1.8,
            },
            '& ul, & ol': {
              pl: 3,
              mb: 2,
            },
            '& li': {
              mb: 1,
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
              my: 3,
            },
            '& a': {
              color: 'primary.main',
              textDecoration: 'underline',
            },
          }}
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        <Divider sx={{ my: 5 }} />

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 5 }}>
            {blog.tags.map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        )}

        {/* Disclosure Section */}
        <BlogDisclosureSection />

        {/* Like/Dislike Section */}
        <Card sx={{ mb: 5 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Did you find this article helpful?
              </Typography>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant={likeStats.userReaction === 'like' ? 'contained' : 'outlined'}
                  size="small"
                  startIcon={<Iconify icon="eva:thumbs-up-fill" />}
                  onClick={() => handleLike(true)}
                  disabled={likesLoading}
                >
                  {likeStats.likesCount}
                </Button>
                
                <Button
                  variant={likeStats.userReaction === 'dislike' ? 'contained' : 'outlined'}
                  size="small"
                  color="error"
                  startIcon={<Iconify icon="eva:thumbs-down-fill" />}
                  onClick={() => handleLike(false)}
                  disabled={likesLoading}
                >
                  {likeStats.dislikesCount}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Box>
          <Typography variant="h4" gutterBottom>
            Comments ({comments.length})
          </Typography>

          {/* Comment Form */}
          <Card id="comment-form" sx={{ mb: 4 }}>
            <CardContent>
              <form onSubmit={(e) => handleCommentSubmit(e)}>
                <Stack spacing={2}>
                  {commentSuccess && <Alert severity="success">{commentSuccess}</Alert>}
                  {commentError && <Alert severity="error">{commentError}</Alert>}
                  
                  {commentForm.parentCommentId && (
                    <Alert 
                      severity="info" 
                      onClose={() => setCommentForm({ ...commentForm, parentCommentId: null })}
                    >
                      Replying to comment
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Your Comment"
                    value={commentForm.content}
                    onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                    required
                  />

                  {/* Show name/email fields for non-authenticated users */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Your Name"
                      value={commentForm.authorName}
                      onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                      placeholder="Enter your name"
                    />
                    <TextField
                      fullWidth
                      type="email"
                      label="Email (optional)"
                      value={commentForm.authorEmail}
                      onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </Stack>

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={commentSubmitting}
                    sx={{ width: 'fit-content' }}
                  >
                    {commentSubmitting ? 'Submitting...' : 'Post Comment'}
                  </Button>
                </Stack>
              </form>
            </CardContent>
          </Card>

          {/* Comments List */}
          {commentsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress />
            </Box>
          ) : comments.length === 0 ? (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No comments yet. Be the first to comment!
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Stack spacing={3}>
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                />
              ))}
            </Stack>
          )}
        </Box>
      </Container>
    </Box>
    </MainLayout>
  );
}

// Comment Item Component
function CommentItem({ comment, onReply, isReply = false }) {
  return (
    <Card sx={{ ml: isReply ? 6 : 0 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Comment Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="subtitle2">{comment.author_name}</Typography>
              <Typography variant="caption" color="text.disabled">
                {new Date(comment.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Typography>
            </Box>
            
            {comment.status === 'pending' && (
              <Chip label="Pending Approval" size="small" color="warning" />
            )}
          </Stack>

          {/* Comment Content */}
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
            {comment.content}
          </Typography>

          {/* Reply Button */}
          <Button
            size="small"
            startIcon={<Iconify icon="eva:corner-down-right-fill" />}
            onClick={() => onReply(comment.id)}
            sx={{ width: 'fit-content' }}
          >
            Reply
          </Button>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <Stack spacing={2} sx={{ mt: 2 }}>
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  onReply={onReply}
                  isReply
                />
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

