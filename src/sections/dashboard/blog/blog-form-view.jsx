'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';

import { Iconify } from 'src/components/iconify';
import { Editor } from 'src/components/editor';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const CATEGORIES = ['HR Basics', 'Career Growth', 'Leadership', 'Workplace Culture', 'Employee Relations'];

export function BlogFormView({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState('edit');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    featured_image: '',
    tags: '',
    published: false,
  });

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBlog = async () => {
    try {
      const { data, error } = await supabase.from('blogs').select('*').eq('id', id).single();

      if (error) throw error;
      setFormData({
        title: data.title || '',
        slug: data.slug || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
        category: data.category || '',
        featured_image: data.featured_image || '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        published: data.published || false,
      });
    } catch (error) {
      console.error('Error fetching blog:', error);
      alert('Failed to load blog');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'published' ? checked : value,
    }));

    // Auto-generate slug from title
    if (name === 'title' && !id) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleEditorChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const blogData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((tag) => tag.trim()) : [],
        updated_at: new Date().toISOString(),
      };

      if (id) {
        // Update existing blog
        const { error } = await supabase.from('blogs').update(blogData).eq('id', id);
        if (error) throw error;
      } else {
        // Create new blog
        const { error } = await supabase.from('blogs').insert([blogData]);
        if (error) throw error;
      }

      router.push(paths.dashboard.blog.root);
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{id ? 'Edit Blog Post' : 'New Blog Post'}</Typography>
            <Button
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(paths.dashboard.blog.root)}
            >
              Back
            </Button>
          </Stack>

          <Grid container spacing={3}>
            {/* Left Column - Form Fields */}
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                {/* Basic Information Card */}
                <Card>
                  <CardContent>
                    <Stack spacing={3}>
                      <Typography variant="h6">Basic Information</Typography>

                      <TextField
                        name="title"
                        label="Title *"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Enter blog post title"
                      />

                      <TextField
                        name="slug"
                        label="Slug *"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        fullWidth
                        helperText="URL-friendly version of the title (auto-generated)"
                      />

                      <TextField
                        name="excerpt"
                        label="Excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        fullWidth
                        placeholder="Brief summary of the blog post (shown in listings)"
                        helperText="Short description (optional, but recommended for SEO)"
                      />
                    </Stack>
                  </CardContent>
                </Card>

                {/* Content Editor Card */}
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                          <Tab label="Edit" value="edit" icon={<Iconify icon="solar:pen-bold" />} iconPosition="start" />
                          <Tab label="Preview" value="preview" icon={<Iconify icon="solar:eye-bold" />} iconPosition="start" />
                        </Tabs>
                      </Box>

                      {currentTab === 'edit' ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Content *
                          </Typography>
                          <Editor
                            value={formData.content}
                            onChange={handleEditorChange}
                            placeholder="Write your blog post content here..."
                            helperText="Use the toolbar above to format your content"
                          />
                        </Box>
                      ) : (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 3,
                            minHeight: 400,
                            bgcolor: 'background.neutral',
                          }}
                        >
                          {formData.content ? (
                            <Box
                              sx={{
                                '& h1, & h2, & h3, & h4, & h5, & h6': {
                                  mt: 3,
                                  mb: 2,
                                  fontWeight: 'bold',
                                },
                                '& h1': { fontSize: '2rem' },
                                '& h2': { fontSize: '1.5rem' },
                                '& h3': { fontSize: '1.25rem' },
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
                                '& blockquote': {
                                  borderLeft: 4,
                                  borderColor: 'primary.main',
                                  pl: 2,
                                  py: 1,
                                  my: 2,
                                  fontStyle: 'italic',
                                },
                                '& pre': {
                                  p: 2,
                                  borderRadius: 1,
                                  bgcolor: 'grey.900',
                                  color: 'common.white',
                                  overflow: 'auto',
                                },
                                '& code': {
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  bgcolor: 'grey.200',
                                  fontFamily: 'monospace',
                                },
                              }}
                              dangerouslySetInnerHTML={{ __html: formData.content }}
                            />
                          ) : (
                            <Typography color="text.secondary" align="center">
                              No content to preview. Start writing in the Edit tab.
                            </Typography>
                          )}
                        </Paper>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Right Column - Settings & Meta */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                {/* Publish Settings Card */}
                <Card>
                  <CardContent>
                    <Stack spacing={3}>
                      <Typography variant="h6">Publish Settings</Typography>

                      <FormControlLabel
                        control={
                          <Switch
                            name="published"
                            checked={formData.published}
                            onChange={handleChange}
                            color="success"
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="subtitle2">
                              {formData.published ? 'Published' : 'Draft'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formData.published
                                ? 'This post is visible to everyone'
                                : 'This post is only visible to you'}
                            </Typography>
                          </Box>
                        }
                      />

                      {formData.published && (
                        <Alert severity="success" icon={<Iconify icon="solar:check-circle-bold" />}>
                          This post will be published immediately
                        </Alert>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Category & Tags Card */}
                <Card>
                  <CardContent>
                    <Stack spacing={3}>
                      <Typography variant="h6">Category & Tags</Typography>

                      <TextField
                        name="category"
                        label="Category"
                        value={formData.category}
                        onChange={handleChange}
                        select
                        fullWidth
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        {CATEGORIES.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        name="tags"
                        label="Tags"
                        value={formData.tags}
                        onChange={handleChange}
                        fullWidth
                        placeholder="career, leadership, hr"
                        helperText="Comma-separated tags for better discoverability"
                      />

                      {formData.tags && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {formData.tags.split(',').map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag.trim()}
                              size="small"
                              variant="outlined"
                              color="primary"
                            />
                          ))}
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Featured Image Card */}
                <Card>
                  <CardContent>
                    <Stack spacing={3}>
                      <Typography variant="h6">Featured Image</Typography>

                      <TextField
                        name="featured_image"
                        label="Image URL"
                        value={formData.featured_image}
                        onChange={handleChange}
                        fullWidth
                        placeholder="https://example.com/image.jpg"
                        helperText="Enter the URL of your featured image"
                      />

                      {formData.featured_image && (
                        <Box
                          component="img"
                          src={formData.featured_image}
                          alt="Featured"
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 1,
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      )}

                      <Alert severity="info" icon={<Iconify icon="solar:info-circle-bold" />}>
                        Recommended size: 1200x630px
                      </Alert>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>

          {/* Actions */}
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => router.push(paths.dashboard.blog.root)}
                  startIcon={<Iconify icon="solar:arrow-left-bold" />}
                >
                  Cancel
                </Button>

                <Stack direction="row" spacing={2}>
                  {formData.published && (
                    <Button
                      variant="outlined"
                      onClick={() => setFormData((prev) => ({ ...prev, published: false }))}
                    >
                      Save as Draft
                    </Button>
                  )}
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={saving}
                    startIcon={<Iconify icon="mingcute:save-line" />}
                    size="large"
                  >
                    {id ? 'Update Blog' : formData.published ? 'Publish Blog' : 'Save Draft'}
                  </LoadingButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </form>
    </Container>
  );
}


