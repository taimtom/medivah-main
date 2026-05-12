'use client';

import { useState, useEffect, useRef } from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Editor } from 'src/components/editor';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { useAuthContext } from 'src/auth/hooks';
import { buildRecordOwnership, scopeOwnedQuery } from 'src/lib/ownership';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';

// ----------------------------------------------------------------------

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', '1-3 years', '3-5 years', '5+ years'];

function createInsufficientCreditsError(message) {
  const err = new Error(message);
  err.insufficientCredits = true;
  return err;
}

export function JobFormView({ id }) {
  const router = useRouter();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const wasPublishedRef = useRef(false);
  const [descriptionTab, setDescriptionTab] = useState('edit');
  const [requirementsTab, setRequirementsTab] = useState('edit');
  const [saveErrorDialog, setSaveErrorDialog] = useState({
    open: false,
    title: '',
    message: '',
    showBillingLink: false,
  });
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    experience: '',
    description: '',
    requirements: '',
    apply_method: 'internal',
    apply_email: CONFIG.site.contactEmail,
    apply_link: '',
    accept_internal_applications: true,
    requires_verification_for_internal_only: false,
    published: false,
  });

  useEffect(() => {
    if (id) {
      fetchJob();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchJob = async () => {
    try {
      const { data, error } = await scopeOwnedQuery(
        supabase.from('jobs').select('*'),
        user?.role,
        user?.id
      )
        .eq('id', id)
        .single();

      if (error) throw error;
      // Handle requirements - could be array (old format) or HTML string (new format)
      let requirements = '';
      if (Array.isArray(data.requirements)) {
        // Convert old array format to HTML list
        requirements = `<ul>${data.requirements.map((req) => `<li>${req}</li>`).join('')}</ul>`;
      } else {
        requirements = data.requirements || '';
      }

      setFormData({
        title: data.title || '',
        company: data.company || '',
        location: data.location || '',
        type: data.type || '',
        experience: data.experience || '',
        description: data.description || '',
        requirements,
        apply_method: data.apply_method || 'internal',
        apply_email: data.apply_email || CONFIG.site.contactEmail,
        apply_link: data.apply_link || '',
        accept_internal_applications: data.accept_internal_applications ?? true,
        requires_verification_for_internal_only:
          data.requires_verification_for_internal_only ?? false,
        published: data.published || false,
      });
      wasPublishedRef.current = data.published || false;
    } catch (error) {
      console.error('Error fetching job:', error);
      alert('Failed to load job');
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
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleRequirementsChange = (value) => {
    setFormData((prev) => ({ ...prev, requirements: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Save requirements as HTML text instead of array
      const jobData = buildRecordOwnership(user?.role, user?.id, {
        ...formData,
        requirements: formData.requirements || '',
        accept_internal_applications:
          formData.apply_method === 'internal' ? true : formData.accept_internal_applications,
        updated_at: new Date().toISOString(),
      });

      // Admins are exempt from buildRecordOwnership setting member_id,
      // but we always need an owner recorded so applicants can reference the employer.
      if (!jobData.member_id && user?.id) {
        jobData.member_id = user.id;
      }

      if (id && jobData.published && !wasPublishedRef.current && user?.role !== 'admin') {
        // Draft being published for the first time — must go through credit-gated publish route
        const response = await fetch('/api/jobs/publish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...jobData,
            job_id: id,
            member_id: user?.id,
            idempotency_key: `job-publish-${id}`,
          }),
        });
        const result = await response.json();
        if (!response.ok) {
          if (response.status === 402 && result.insufficient_credits) {
            throw createInsufficientCreditsError(
              'Publishing a job costs 1 credit. You do not have enough credits right now. You can buy a credit pack or use a free monthly post when you are eligible.'
            );
          }
          throw new Error(result.error || 'Failed to publish job');
        }
      } else if (id) {
        const { error } = await scopeOwnedQuery(
          supabase.from('jobs').update(jobData),
          user?.role,
          user?.id
        ).eq('id', id);
        if (error) throw error;
      } else if (jobData.published && user?.role !== 'admin') {
          const response = await fetch('/api/jobs/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...jobData,
              member_id: user?.id,
              idempotency_key: `job-publish-${Date.now()}`,
            }),
          });
          const result = await response.json();
          if (!response.ok) {
            if (response.status === 402 && result.insufficient_credits) {
              throw createInsufficientCreditsError(
                'Publishing a job costs 1 credit. You do not have enough credits right now. You can buy a credit pack or use a free monthly post when you are eligible.'
              );
            }
            throw new Error(result.error || 'Failed to publish job');
          }
      } else {
        const { error } = await supabase.from('jobs').insert([jobData]);
        if (error) throw error;
      }

      router.push(paths.dashboard.jobs.root);
    } catch (error) {
      console.error('Error saving job:', error);
      const insufficientCredits = error?.insufficientCredits === true;
      setSaveErrorDialog({
        open: true,
        title: insufficientCredits ? 'Not enough credits to publish' : 'Could not save job',
        message:
          error?.message ||
          'Something went wrong while saving. Please try again, or contact support if the problem continues.',
        showBillingLink: insufficientCredits,
      });
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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h4">{id ? 'Edit Job' : 'New Job'}</Typography>
            <Button
              startIcon={<Iconify icon="eva:arrow-back-fill" />}
              onClick={() => router.push(paths.dashboard.jobs.root)}
            >
              Back
            </Button>
          </Stack>

          <Card>
            <CardContent>
              <Stack spacing={3}>
                <TextField
                  name="title"
                  label="Job Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  name="company"
                  label="Company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  name="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <TextField
                  name="type"
                  label="Job Type"
                  value={formData.type}
                  onChange={handleChange}
                  select
                  required
                  fullWidth
                >
                  {JOB_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="experience"
                  label="Experience Level"
                  value={formData.experience}
                  onChange={handleChange}
                  select
                  required
                  fullWidth
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Job Description with Rich Text Editor */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Job Description *
                  </Typography>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                      value={descriptionTab}
                      onChange={(e, newValue) => setDescriptionTab(newValue)}
                    >
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
                  {descriptionTab === 'edit' ? (
                    <Editor
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Enter the job description here..."
                    />
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        minHeight: 200,
                        bgcolor: 'background.neutral',
                        '& img': { maxWidth: '100%', height: 'auto' },
                        '& a': { color: 'primary.main' },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formData.description || '<p>No description yet.</p>',
                      }}
                    />
                  )}
                </Box>

                {/* Requirements with Rich Text Editor */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Requirements
                  </Typography>
                  <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs
                      value={requirementsTab}
                      onChange={(e, newValue) => setRequirementsTab(newValue)}
                    >
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
                  {requirementsTab === 'edit' ? (
                    <Editor
                      value={formData.requirements}
                      onChange={handleRequirementsChange}
                      placeholder="Enter the job requirements here. Format them however you like - use lists, paragraphs, headings, etc."
                    />
                  ) : (
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 3,
                        minHeight: 200,
                        bgcolor: 'background.neutral',
                        '& img': { maxWidth: '100%', height: 'auto' },
                        '& a': { color: 'primary.main' },
                      }}
                      dangerouslySetInnerHTML={{
                        __html: formData.requirements || '<p>No requirements yet.</p>',
                      }}
                    />
                  )}
                </Box>

                <TextField
                  name="apply_method"
                  label="Application Method"
                  value={formData.apply_method}
                  onChange={handleChange}
                  select
                  required
                  fullWidth
                  helperText="Choose how applicants will apply for this job"
                >
                  <MenuItem value="internal">Apply via Mavidah (in-platform)</MenuItem>
                  <MenuItem value="email">Via Email</MenuItem>
                  <MenuItem value="link">Via Link</MenuItem>
                </TextField>

                {formData.apply_method === 'email' && (
                  <TextField
                    name="apply_email"
                    label="Application Email"
                    type="email"
                    value={formData.apply_email}
                    onChange={handleChange}
                    required
                    fullWidth
                    helperText="Email where applications will be sent"
                  />
                )}

                {formData.apply_method === 'link' && (
                  <TextField
                    name="apply_link"
                    label="Application Link"
                    type="url"
                    value={formData.apply_link}
                    onChange={handleChange}
                    required
                    fullWidth
                    helperText="URL where applicants will be redirected to apply"
                    placeholder="https://example.com/apply"
                  />
                )}

                <FormControlLabel
                  control={
                    <Switch name="published" checked={formData.published} onChange={handleChange} />
                  }
                  label="Published"
                />

                {formData.apply_method !== 'internal' && (
                  <FormControlLabel
                    control={
                      <Switch
                        name="accept_internal_applications"
                        checked={formData.accept_internal_applications}
                        onChange={handleChange}
                      />
                    }
                    label="Also accept in-platform applications"
                  />
                )}

                {(formData.apply_method === 'internal' || formData.accept_internal_applications) && (
                  <FormControlLabel
                    control={
                      <Switch
                        name="requires_verification_for_internal_only"
                        checked={formData.requires_verification_for_internal_only}
                        onChange={handleChange}
                      />
                    }
                    label="Require employer verification for internal-only applications"
                  />
                )}
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={() => router.push(paths.dashboard.jobs.root)}>
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={saving}
              startIcon={<Iconify icon="mingcute:save-line" />}
            >
              {id ? 'Update Job' : 'Create Job'}
            </LoadingButton>
          </Stack>
        </Stack>
      </form>

      <Dialog
        open={saveErrorDialog.open}
        onClose={() => setSaveErrorDialog((s) => ({ ...s, open: false }))}
        aria-labelledby="job-save-error-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="job-save-error-dialog-title">{saveErrorDialog.title}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {saveErrorDialog.message}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSaveErrorDialog((s) => ({ ...s, open: false }))}>Close</Button>
          {saveErrorDialog.showBillingLink && (
            <Button
              component={RouterLink}
              href={paths.dashboard.billing}
              variant="contained"
              onClick={() => setSaveErrorDialog((s) => ({ ...s, open: false }))}
            >
              Credits & Billing
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
}
