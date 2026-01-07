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
import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { Iconify } from 'src/components/iconify';
import { Editor } from 'src/components/editor';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function NewsletterFormView({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState('edit');
  const [formData, setFormData] = useState({
    subject: '',
    preview_text: '',
    content_html: '',
    scheduled_at: '',
  });

  useEffect(() => {
    if (id) {
      fetchNewsletter();
    }
  }, [id]);

  const fetchNewsletter = async () => {
    try {
      const { data, error } = await supabase.from('newsletters').select('*').eq('id', id).single();

      if (error) throw error;
      setFormData({
        subject: data.subject || '',
        preview_text: data.preview_text || '',
        content_html: data.content_html || '',
        scheduled_at: data.scheduled_at ? new Date(data.scheduled_at).toISOString().slice(0, 16) : '',
      });
    } catch (error) {
      console.error('Error fetching newsletter:', error);
      alert('Failed to load newsletter');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (value) => {
    setFormData((prev) => ({ ...prev, content_html: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const newsletterData = {
        subject: formData.subject,
        preview_text: formData.preview_text || null,
        content_html: formData.content_html,
        scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
        updated_at: new Date().toISOString(),
      };

      const url = id ? '/api/newsletter/create' : '/api/newsletter/create';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id ? { id, ...newsletterData } : newsletterData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(paths.dashboard.newsletter.root);
      } else {
        throw new Error(data.error || 'Failed to save newsletter');
      }
    } catch (error) {
      console.error('Error saving newsletter:', error);
      alert('Failed to save newsletter');
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
            <Typography variant="h4">{id ? 'Edit Newsletter' : 'New Newsletter'}</Typography>
            <Button
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(paths.dashboard.newsletter.root)}
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
                      <Typography variant="h6">Newsletter Details</Typography>

                      <TextField
                        name="subject"
                        label="Subject Line *"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        fullWidth
                        placeholder="Enter newsletter subject"
                        helperText="This is what recipients will see in their inbox"
                      />

                      <TextField
                        name="preview_text"
                        label="Preview Text"
                        value={formData.preview_text}
                        onChange={handleChange}
                        multiline
                        rows={2}
                        fullWidth
                        placeholder="Brief preview text (optional)"
                        helperText="Short text that appears after the subject line in many email clients"
                      />

                      <TextField
                        name="scheduled_at"
                        label="Schedule Send (Optional)"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={handleChange}
                        fullWidth
                        InputLabelProps={{
                          shrink: true,
                        }}
                        helperText="Leave empty to save as draft. Set a date/time to schedule automatic sending."
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
                          <Tab
                            label="Edit"
                            value="edit"
                            icon={<Iconify icon="solar:pen-bold" />}
                            iconPosition="start"
                          />
                          <Tab
                            label="Preview"
                            value="preview"
                            icon={<Iconify icon="solar:eye-bold" />}
                            iconPosition="start"
                          />
                        </Tabs>
                      </Box>

                      {currentTab === 'edit' ? (
                        <Box>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>
                            Content *
                          </Typography>
                          <Editor
                            value={formData.content_html}
                            onChange={handleEditorChange}
                            placeholder="Write your newsletter content here..."
                            helperText="Use the toolbar above to format your content. This will be sent as HTML email."
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
                          <Typography variant="subtitle2" gutterBottom>
                            Preview
                          </Typography>
                          <Box
                            sx={{
                              mt: 2,
                              '& img': { maxWidth: '100%', height: 'auto' },
                              '& a': { color: 'primary.main' },
                            }}
                            dangerouslySetInnerHTML={{ __html: formData.content_html || '<p>No content yet.</p>' }}
                          />
                        </Paper>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>

            {/* Right Column - Tips & Info */}
            <Grid item xs={12} md={4}>
              <Stack spacing={3}>
                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h6">Tips for Effective Newsletters</Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Subject Line:</strong> Keep it concise and compelling. 50 characters or less works best.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Preview Text:</strong> Use this to add context or create urgency. It appears after the
                        subject line.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Content:</strong> Keep paragraphs short, use headings, and include clear calls-to-action.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Images:</strong> Use images sparingly and ensure they're optimized for email.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Links:</strong> Make links descriptive and use contrasting colors.
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <Stack spacing={2}>
                      <Typography variant="h6">Best Practices</Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                          <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main', mt: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            Test on mobile devices
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                          <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main', mt: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            Send test email before sending to all
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                          <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main', mt: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            Keep content scannable
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'start', gap: 1 }}>
                          <Iconify icon="eva:checkmark-circle-2-fill" width={20} sx={{ color: 'success.main', mt: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            Include unsubscribe option (automatically added)
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </Grid>
          </Grid>

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push(paths.dashboard.newsletter.root)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={saving}
              startIcon={<Iconify icon="mingcute:save-line" />}
            >
              {id ? 'Update Newsletter' : 'Save as Draft'}
            </LoadingButton>
          </Stack>
        </Stack>
      </form>
    </Container>
  );
}

