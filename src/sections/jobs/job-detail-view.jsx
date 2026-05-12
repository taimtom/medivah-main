'use client';

import { useState, useEffect } from 'react';

import { MainLayout } from 'src/layouts/main';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { CONFIG } from 'src/config-global';
import { supabase } from 'src/lib/supabase';
import { ShareButtons } from 'src/components/share-buttons';
import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function JobDetailView({ jobId }) {
  const { user } = useAuthContext();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [submittingInternal, setSubmittingInternal] = useState(false);
  const [isEmployerVerified, setIsEmployerVerified] = useState(false);

  useEffect(() => {
    fetchJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  // Update document title when job is loaded
  useEffect(() => {
    if (job && job.title) {
      document.title = `${job.title} - ${CONFIG.site.name}`;
    }
  }, [job]);

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .eq('published', true)
        .single();

      if (error) throw error;
      setJob(data);

      if (data?.member_id) {
        const { data: verif } = await supabase
          .from('employer_verifications')
          .select('status')
          .eq('member_id', data.member_id)
          .eq('status', 'approved')
          .maybeSingle();
        setIsEmployerVerified(Boolean(verif));
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!job) return;
    
    if (job.apply_method === 'link' && job.apply_link) {
      window.open(job.apply_link, '_blank', 'noopener,noreferrer');
    } else {
      const subject = `Application for ${job.title}`;
      const body = `Hi,\n\nI would like to apply for the ${job.title} position at ${job.company}.\n\nBest regards,`;
      window.location.href = `mailto:${job.apply_email || CONFIG.site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
  };

  const handleInternalApply = async () => {
    if (!job || !user?.id) return;

    if (job.requires_verification_for_internal_only && !isEmployerVerified) {
      alert('This employer requires verified status to accept internal applications. Please use the external apply option.');
      return;
    }

    const coverLetter = window.prompt('Optional: add a short cover letter');
    try {
      setSubmittingInternal(true);
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
      if (!response.ok) throw new Error(result.error || 'Failed to submit application');
      alert('Application submitted successfully');
    } catch (error) {
      alert(error.message || 'Could not submit application');
    } finally {
      setSubmittingInternal(false);
    }
  };

  const handleSaveJob = async () => {
    if (!job || !user?.id) return;
    const response = await fetch('/api/saved-jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicant_id: user.id, job_id: job.id }),
    });
    if (response.ok) {
      alert('Job saved');
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

  if (fetchError) {
    return (
      <MainLayout>
        <Container sx={{ py: 15, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3, maxWidth: 480, mx: 'auto' }}>
            Something went wrong. Please try again.
          </Alert>
          <Button
            component={RouterLink}
            href={paths.jobs.root}
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to Jobs
          </Button>
        </Container>
      </MainLayout>
    );
  }

  if (!job) {
    return (
      <MainLayout>
        <Container sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Job Not Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            The job posting you&apos;re looking for doesn&apos;t exist or has been removed.
          </Typography>
          <Button
            component={RouterLink}
            href={paths.jobs.root}
            variant="contained"
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to Jobs
          </Button>
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container>
          <Button
            component={RouterLink}
            href={paths.jobs.root}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            sx={{ mb: 3 }}
          >
            Back to Jobs
          </Button>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Stack spacing={3}>
                {/* Header Section */}
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
                    {isEmployerVerified && (
                      <Chip
                        label="Verified Employer"
                        size="small"
                        color="success"
                        icon={<Iconify icon="solar:verified-check-bold-duotone" width={14} />}
                      />
                    )}
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" spacing={2}>
                    <Typography variant="h3" sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                      {job.title}
                    </Typography>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      <ShareButtons 
                        title={`${job.title}${job.company ? ` at ${job.company}` : ''} | ${CONFIG.site.name}`}
                        description={job.description ? job.description.substring(0, 155) : `Apply for ${job.title} at ${CONFIG.site.name}`}
                      />
                    </Box>
                  </Stack>

                  <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
                    <ShareButtons 
                      title={`${job.title}${job.company ? ` at ${job.company}` : ''} | ${CONFIG.site.name}`}
                      description={job.description ? job.description.substring(0, 155) : `Apply for ${job.title} at ${CONFIG.site.name}`}
                    />
                  </Box>

                  <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    {job.company && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:buildings-2-bold-duotone" width={24} />
                        <Typography variant="body1" fontWeight="medium">
                          {job.company}
                        </Typography>
                      </Stack>
                    )}
                    {job.location && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:map-point-bold-duotone" width={24} />
                        <Typography variant="body1">{job.location}</Typography>
                      </Stack>
                    )}
                    {job.salary_range && (
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Iconify icon="solar:wallet-money-bold-duotone" width={24} />
                        <Typography variant="body1" fontWeight="medium" color="primary.main">
                          {job.salary_range}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  {job.expires_at && (
                    <Typography variant="body2" color="text.secondary">
                      <Iconify icon="solar:calendar-bold-duotone" width={18} sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      Application deadline:{' '}
                      {new Date(job.expires_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Typography>
                  )}
                </Stack>

                <Divider />

                {/* Description Section */}
                {job.description && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Job Description
                    </Typography>
                    <Box
                      sx={{
                        '& h1, & h2, & h3, & h4, & h5, & h6': {
                          mt: 3,
                          mb: 2,
                          fontWeight: 600,
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
                          '&:hover': {
                            textDecoration: 'none',
                          },
                        },
                        '& blockquote': {
                          borderLeft: 4,
                          borderColor: 'primary.main',
                          pl: 2,
                          py: 1,
                          my: 2,
                          fontStyle: 'italic',
                          bgcolor: 'background.neutral',
                          borderRadius: 1,
                        },
                        '& pre': {
                          p: 2,
                          borderRadius: 1,
                          bgcolor: 'grey.900',
                          color: 'common.white',
                          overflow: 'auto',
                          my: 2,
                        },
                        '& code': {
                          px: 0.5,
                          py: 0.25,
                          borderRadius: 0.5,
                          bgcolor: 'grey.200',
                          fontFamily: 'monospace',
                          fontSize: '0.9em',
                        },
                        '& pre code': {
                          bgcolor: 'transparent',
                          color: 'inherit',
                        },
                        '& table': {
                          width: '100%',
                          borderCollapse: 'collapse',
                          my: 2,
                          '& th, & td': {
                            border: 1,
                            borderColor: 'divider',
                            p: 1,
                          },
                          '& th': {
                            bgcolor: 'background.neutral',
                            fontWeight: 600,
                          },
                        },
                        '& strong': {
                          fontWeight: 600,
                        },
                        '& em': {
                          fontStyle: 'italic',
                        },
                      }}
                      dangerouslySetInnerHTML={{ __html: job.description }}
                    />
                  </Box>
                )}

                {/* Requirements Section */}
                {job.requirements && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Requirements
                      </Typography>
                      <Box
                        sx={{
                          '& h1, & h2, & h3, & h4, & h5, & h6': {
                            mt: 3,
                            mb: 2,
                            fontWeight: 600,
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
                            mb: 1.5,
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
                            '&:hover': {
                              textDecoration: 'none',
                            },
                          },
                          '& blockquote': {
                            borderLeft: 4,
                            borderColor: 'primary.main',
                            pl: 2,
                            py: 1,
                            my: 2,
                            fontStyle: 'italic',
                            bgcolor: 'background.neutral',
                            borderRadius: 1,
                          },
                          '& pre': {
                            p: 2,
                            borderRadius: 1,
                            bgcolor: 'grey.900',
                            color: 'common.white',
                            overflow: 'auto',
                            my: 2,
                          },
                          '& code': {
                            px: 0.5,
                            py: 0.25,
                            borderRadius: 0.5,
                            bgcolor: 'grey.200',
                            fontFamily: 'monospace',
                            fontSize: '0.9em',
                          },
                          '& pre code': {
                            bgcolor: 'transparent',
                            color: 'inherit',
                          },
                          '& table': {
                            width: '100%',
                            borderCollapse: 'collapse',
                            my: 2,
                            '& th, & td': {
                              border: 1,
                              borderColor: 'divider',
                              p: 1,
                            },
                            '& th': {
                              bgcolor: 'background.neutral',
                              fontWeight: 600,
                            },
                          },
                          '& strong': {
                            fontWeight: 600,
                          },
                          '& em': {
                            fontStyle: 'italic',
                          },
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            typeof job.requirements === 'string'
                              ? job.requirements
                              : Array.isArray(job.requirements)
                              ? `<ul>${job.requirements.map((req) => `<li>${req}</li>`).join('')}</ul>`
                              : '',
                        }}
                      />
                    </Box>
                  </>
                )}

                <Divider />

                {/* Apply Section */}
                <Stack spacing={2} sx={{ pt: 2 }}>
                  {user?.role === 'applicant' ? (
                    <Button variant="text" onClick={handleSaveJob} startIcon={<Iconify icon="solar:bookmark-bold-duotone" />}>
                      Save Job
                    </Button>
                  ) : null}

                  {user?.role === 'applicant' && job.apply_method === 'internal' ? (
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleInternalApply}
                      disabled={submittingInternal}
                      startIcon={<Iconify icon="solar:document-add-bold-duotone" />}
                    >
                      {submittingInternal
                        ? 'Submitting...'
                        : job.apply_method === 'internal'
                        ? 'Apply via Mavidah'
                        : 'Apply In Platform'}
                    </Button>
                  ) : null}

                  {job.apply_method !== 'internal' && (
                    <>
                      <Button
                        variant={user?.role === 'applicant' && job.accept_internal_applications ? 'outlined' : 'contained'}
                        size="large"
                        fullWidth
                        onClick={handleApply}
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
                      <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
                        {job.apply_method === 'link' ? 'Apply via link' : 'Apply via email'}
                      </Typography>
                    </>
                  )}

                  {job.apply_method === 'internal' && !user?.id && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                      <RouterLink
                        href={`${paths.auth.supabase.signIn}?returnTo=${encodeURIComponent(`/jobs/${job.id}`)}`}
                        style={{ color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                      >
                        Sign in as a job seeker to apply via Mavidah.
                      </RouterLink>
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayout>
  );
}
