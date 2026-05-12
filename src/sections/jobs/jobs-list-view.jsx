'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

import { MainLayout } from 'src/layouts/main';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';

import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { supabase } from 'src/lib/supabase';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const JOB_TYPES = ['All', 'Full-time', 'Part-time', 'Contract', 'Remote'];
const EXPERIENCE_LEVELS = ['All', 'Entry Level', '1-3 years', '3-5 years', '5+ years'];
const ITEMS_PER_PAGE = 9;

// ----------------------------------------------------------------------

export function JobsListView() {
  const { user } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verifiedMemberIds, setVerifiedMemberIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const rawPageParam = searchParams.get('page');
  const pageParam = Number(rawPageParam || '1');
  const hasInvalidPageParam = rawPageParam !== null && (Number.isNaN(pageParam) || pageParam < 1);
  const currentPage = hasInvalidPageParam ? 1 : pageParam;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const updatePageInUrl = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams.toString());

      if (page <= 1) {
        params.delete('page');
      } else {
        params.set('page', String(page));
      }

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      const end = start + ITEMS_PER_PAGE - 1;

      let query = supabase
        .from('jobs')
        .select('id, title, company, location, type, experience, created_at, member_id', { count: 'exact' })
        .eq('published', true)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (selectedType !== 'All') {
        query = query.eq('type', selectedType);
      }

      if (selectedExperience !== 'All') {
        query = query.eq('experience', selectedExperience);
      }

      if (debouncedSearchQuery) {
        query = query.or(
          `title.ilike.%${debouncedSearchQuery}%,company.ilike.%${debouncedSearchQuery}%,location.ilike.%${debouncedSearchQuery}%`
        );
      }

      const { data, count, error } = await query;

      if (error) throw error;

      const safeTotalCount = count ?? 0;
      const safeTotalPages = Math.max(1, Math.ceil(safeTotalCount / ITEMS_PER_PAGE));

      if (safeTotalCount > 0 && currentPage > safeTotalPages) {
        updatePageInUrl(safeTotalPages);
        return;
      }

      if (safeTotalCount === 0 && currentPage !== 1) {
        updatePageInUrl(1);
        return;
      }

      setJobs(data || []);
      setTotalCount(safeTotalCount);

      if (data && data.length > 0) {
        const memberIds = [...new Set(data.map((j) => j.member_id).filter(Boolean))];
        if (memberIds.length > 0) {
          const { data: verifications } = await supabase
            .from('employer_verifications')
            .select('member_id')
            .in('member_id', memberIds)
            .eq('status', 'approved');
          setVerifiedMemberIds(new Set((verifications || []).map((v) => v.member_id)));
        }
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchQuery, selectedType, selectedExperience, updatePageInUrl]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    if (hasInvalidPageParam) {
      updatePageInUrl(1);
    }
  }, [hasInvalidPageParam, updatePageInUrl]);

  const handleSearchChange = useCallback(
    (event) => {
      setSearchQuery(event.target.value);
      if (currentPage !== 1) {
        updatePageInUrl(1);
      }
    },
    [currentPage, updatePageInUrl]
  );

  const handleTypeChange = useCallback(
    (event) => {
      setSelectedType(event.target.value);
      if (currentPage !== 1) {
        updatePageInUrl(1);
      }
    },
    [currentPage, updatePageInUrl]
  );

  const handleExperienceChange = useCallback(
    (event) => {
      setSelectedExperience(event.target.value);
      if (currentPage !== 1) {
        updatePageInUrl(1);
      }
    },
    [currentPage, updatePageInUrl]
  );

  const handleApply = (job) => {
    if (job.apply_method === 'link' && job.apply_link) {
      window.open(job.apply_link, '_blank', 'noopener,noreferrer');
    } else {
      const subject = `Application for ${job.title}`;
      const body = `Hi,\n\nI would like to apply for the ${job.title} position at ${job.company}.\n\nBest regards,`;
      window.location.href = `mailto:${job.apply_email || CONFIG.site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleInternalApply = async (job) => {
    if (!user?.id) return;

    if (job.requires_verification_for_internal_only && !verifiedMemberIds.has(job.member_id)) {
      alert('This employer requires verified status to accept internal applications. Please use the external apply option.');
      return;
    }

    const coverLetter = window.prompt('Optional: add a short cover letter');
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.id,
          applicant_id: user.id,
          employer_member_id: job.member_id,
          cover_letter: coverLetter || null,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to apply');
      alert('Application submitted');
    } catch (error) {
      alert(error.message || 'Application failed');
    }
  };

  const handleSaveJob = async (job) => {
    if (!user?.id) return;
    const response = await fetch('/api/saved-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicant_id: user.id, job_id: job.id }),
    });
    if (response.ok) {
      alert('Job saved');
    }
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
              Explore career opportunities from organizations across different industries.
            </Typography>

            {/* Search and Filters */}
            <Stack spacing={2}>
              <TextField
                fullWidth
                placeholder="Search jobs by title, company, or location..."
                value={searchQuery}
                onChange={handleSearchChange}
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
                  onChange={handleTypeChange}
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
                  onChange={handleExperienceChange}
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
            <Stack spacing={4}>
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
                              {verifiedMemberIds.has(job.member_id) && (
                                <Chip
                                  label="Verified Employer"
                                  size="small"
                                  color="success"
                                  icon={<Iconify icon="solar:verified-check-bold-duotone" width={14} />}
                                />
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
                                <Box
                                  sx={{
                                    '& p': {
                                      mb: 1,
                                    },
                                    '& ul, & ol': {
                                      pl: 3,
                                      mb: 1,
                                    },
                                    '& li': {
                                      mb: 0.5,
                                    },
                                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                                      mt: 2,
                                      mb: 1,
                                    },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: 'vertical',
                                    maxHeight: '4.5em',
                                  }}
                                  dangerouslySetInnerHTML={{ __html: job.description }}
                                />
                                {(job.description && job.description.replace(/<[^>]*>/g, '').length > 150) && (
                                  <Button
                                    component={RouterLink}
                                    href={paths.jobs.detail(job.id)}
                                    size="small"
                                    sx={{ mt: 1, textTransform: 'none' }}
                                    startIcon={
                                      <Iconify icon="eva:arrow-right-fill" />
                                    }
                                  >
                                    Read More
                                  </Button>
                                )}
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
                            {user?.role === 'applicant' && job.apply_method === 'internal' ? (
                              <Button
                                variant="contained"
                                size="large"
                                fullWidth={{ xs: true, md: false }}
                                onClick={() => handleInternalApply(job)}
                                startIcon={<Iconify icon="solar:document-add-bold-duotone" />}
                              >
                                {job.apply_method === 'internal' ? 'Apply via Mavidah' : 'Apply In Platform'}
                              </Button>
                            ) : null}
                            {user?.role === 'applicant' ? (
                              <Button
                                variant="text"
                                fullWidth={{ xs: true, md: false }}
                                onClick={() => handleSaveJob(job)}
                                startIcon={<Iconify icon="solar:bookmark-bold-duotone" />}
                              >
                                Save Job
                              </Button>
                            ) : null}
                            {job.apply_method !== 'internal' && (
                              <>
                                <Button
                                  variant={user?.role === 'applicant' && job.accept_internal_applications ? 'outlined' : 'contained'}
                                  size="large"
                                  fullWidth={{ xs: true, md: false }}
                                  onClick={() => handleApply(job)}
                                  startIcon={
                                    <Iconify
                                      icon={
                                        job.apply_method === 'link'
                                          ? 'solar:link-bold-duotone'
                                          : 'solar:letter-bold-duotone'
                                      }
                                    />
                                  }
                                >
                                  Apply Now
                                </Button>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ textAlign: { md: 'right' } }}
                                >
                                  {job.apply_method === 'link' ? 'Apply via link' : 'Apply via email'}
                                </Typography>
                              </>
                            )}
                            {job.apply_method === 'internal' && !user?.id && (
                              <Typography variant="caption" color="text.secondary" sx={{ textAlign: { md: 'right' } }}>
                                Sign in to apply
                              </Typography>
                            )}
                          </Stack>
                        </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Stack alignItems="center">
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, page) => updatePageInUrl(page)}
                    color="primary"
                  />
                </Stack>
              )}
            </Stack>
          )}
        </Container>
      </Box>
    </MainLayout>
  );
}
