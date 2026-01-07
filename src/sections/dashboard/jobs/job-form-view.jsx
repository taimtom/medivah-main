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

import { Iconify } from 'src/components/iconify';
import { Editor } from 'src/components/editor';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';

// ----------------------------------------------------------------------

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', '1-3 years', '3-5 years', '5+ years'];

export function JobFormView({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [descriptionTab, setDescriptionTab] = useState('edit');
  const [requirementsTab, setRequirementsTab] = useState('edit');
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    experience: '',
    description: '',
    requirements: '',
    apply_method: 'email',
    apply_email: CONFIG.site.contactEmail,
    apply_link: '',
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
      const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();

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
        requirements: requirements,
        apply_method: data.apply_method || 'email',
        apply_email: data.apply_email || CONFIG.site.contactEmail,
        apply_link: data.apply_link || '',
        published: data.published || false,
      });
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
      const jobData = {
        ...formData,
        requirements: formData.requirements || '', // Store as HTML string
        updated_at: new Date().toISOString(),
      };

      if (id) {
        const { error } = await supabase.from('jobs').update(jobData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('jobs').insert([jobData]);
        if (error) throw error;
      }

      router.push(paths.dashboard.jobs.root);
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Failed to save job');
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
                  <MenuItem value="email">Via Email</MenuItem>
                  <MenuItem value="link">Via Link</MenuItem>
                </TextField>

                {formData.apply_method === 'email' ? (
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
                ) : (
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
    </Container>
  );
}
