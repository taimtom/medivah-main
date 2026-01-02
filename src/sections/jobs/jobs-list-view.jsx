'use client';

import { useState, useEffect, useCallback } from 'react';

import { MainLayout } from 'src/layouts/main';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { supabase } from 'src/lib/supabase';

// ----------------------------------------------------------------------

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote'];
const EXPERIENCE_LEVELS = ['All', 'Entry Level', '1-3 years', '3-5 years', '5+ years'];

// ----------------------------------------------------------------------

export function JobsListView() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [expandedJobs, setExpandedJobs] = useState(new Set());

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      if (selectedExperience !== 'All') {
        query = query.eq('experience', selectedExperience);
      }

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedType, selectedExperience]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = (job) => {
    const subject = `Application for ${job.title}`;
    const body = `Hi,\n\nI would like to apply for the ${job.title} position at ${job.company}.\n\nBest regards,`;
    window.location.href = `mailto:${job.apply_email || CONFIG.site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const toggleExpand = (jobId) => {
    setExpandedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container>
          {/* Header */}
          <Stack spacing={3} sx={{ mb: 5 }}>
            <Typography variant="h2" sx={{ textAlign: 'center' }}>
              Job Opportunities
            </Typography>
            <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
              Explore HR and career opportunities from various organizations
            </Typography>

            {/* Search and Filters */}
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Search jobs by title, company, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  sx={{ minWidth: { sm: 200 } }}
                  label="Job Type"
                >
                  {JOB_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  value={selectedExperience}
                  onChange={(e) => setSelectedExperience(e.target.value)}
                  sx={{ minWidth: { sm: 200 } }}
                  label="Experience Level"
                >
                  {EXPERIENCE_LEVELS.map((level) => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
            </Stack>
          </Stack>

          {/* Job Listings */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : jobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No job postings found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your search filters or check back later for new opportunities
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} key={job.id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={3}>
                        {/* Job Details */}
                        <Grid item xs={12} md={8}>
                          <Stack spacing={2}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              {job.type && (
                                <Chip
                                  label={job.type}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                              )}
                              {job.experience && (
                                <Chip label={job.experience} size="small" variant="outlined" />
                              )}
                            </Stack>

                            <Typography variant="h5">{job.title}</Typography>

                            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                              {job.company && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Iconify icon="solar:buildings-2-bold-duotone" width={20} />
                                  <Typography variant="body2">{job.company}</Typography>
                                </Stack>
                              )}
                              {job.location && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Iconify icon="solar:map-point-bold-duotone" width={20} />
                                  <Typography variant="body2">{job.location}</Typography>
                                </Stack>
                              )}
                              {job.salary_range && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Iconify icon="solar:wallet-money-bold-duotone" width={20} />
                                  <Typography variant="body2">{job.salary_range}</Typography>
                                </Stack>
                              )}
                            </Stack>

                            {job.description && (
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    ...(expandedJobs.has(job.id)
                                      ? {}
                                      : {
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          display: '-webkit-box',
                                          WebkitLineClamp: 3,
                                          WebkitBoxOrient: 'vertical',
                                        }),
                                    whiteSpace: 'pre-wrap',
                                  }}
                                >
                                  {job.description}
                                </Typography>
                                {job.description.length > 150 && (
                                  <Button
                                    size="small"
                                    onClick={() => toggleExpand(job.id)}
                                    sx={{ mt: 1, textTransform: 'none' }}
                                    startIcon={
                                      <Iconify
                                        icon={
                                          expandedJobs.has(job.id)
                                            ? 'eva:arrow-up-fill'
                                            : 'eva:arrow-down-fill'
                                        }
                                      />
                                    }
                                  >
                                    {expandedJobs.has(job.id) ? 'Show Less' : 'Read More'}
                                  </Button>
                                )}
                              </Box>
                            )}

                            {expandedJobs.has(job.id) &&
                              job.requirements &&
                              Array.isArray(job.requirements) &&
                              job.requirements.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="subtitle2" gutterBottom>
                                    Requirements:
                                  </Typography>
                                  <Stack component="ul" spacing={0.5} sx={{ pl: 2, m: 0 }}>
                                    {job.requirements.map((requirement, index) => (
                                      <Typography
                                        key={index}
                                        component="li"
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ listStyleType: 'disc' }}
                                      >
                                        {requirement}
                                      </Typography>
                                    ))}
                                  </Stack>
                                </Box>
                              )}

                            {job.expires_at && (
                              <Typography variant="caption" color="text.disabled">
                                Application deadline:{' '}
                                {new Date(job.expires_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </Typography>
                            )}
                          </Stack>
                        </Grid>

                        {/* Apply Button */}
                        <Grid item xs={12} md={4}>
                          <Stack
                            spacing={2}
                            sx={{
                              height: '100%',
                              justifyContent: 'center',
                              alignItems: { md: 'flex-end' },
                            }}
                          >
                            <Button
                              variant="contained"
                              size="large"
                              fullWidth={{ xs: true, md: false }}
                              onClick={() => handleApply(job)}
                              startIcon={<Iconify icon="solar:letter-bold-duotone" />}
                            >
                              Apply Now
                            </Button>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ textAlign: { md: 'right' } }}
                            >
                              Apply via email
                            </Typography>
                          </Stack>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
}
