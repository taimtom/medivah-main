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
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Remote'];
const EXPERIENCE_LEVELS = ['Entry Level', 'Mid Level', 'Senior Level', 'Executive'];

export function JobFormView({ id }) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    type: '',
    experience: '',
    description: '',
    requirements: '',
    apply_email: CONFIG.site.contactEmail,
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
      setFormData({
        title: data.title || '',
        company: data.company || '',
        location: data.location || '',
        type: data.type || '',
        experience: data.experience || '',
        description: data.description || '',
        requirements: data.requirements || '',
        apply_email: data.apply_email || CONFIG.site.contactEmail,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const jobData = {
        ...formData,
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

                <TextField
                  name="description"
                  label="Job Description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  rows={6}
                  required
                  fullWidth
                />

                <TextField
                  name="requirements"
                  label="Requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  helperText="List the key requirements for this position"
                />

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

                <FormControlLabel
                  control={
                    <Switch
                      name="published"
                      checked={formData.published}
                      onChange={handleChange}
                    />
                  }
                  label="Published"
                />
              </Stack>
            </CardContent>
          </Card>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => router.push(paths.dashboard.jobs.root)}
            >
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


