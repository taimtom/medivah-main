'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { supabase } from 'src/lib/supabase';

import { Iconify } from 'src/components/iconify';

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token || '';
}

async function getCvSignedUrl(filePath) {
  if (!filePath) return null;
  const { data } = await supabase.storage.from('applicant-cvs').createSignedUrl(filePath, 3600);
  return data?.signedUrl || null;
}

/** Safely coerce a value that may be a JSONB array OR a stringified JSON array. */
function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim().startsWith('[')) {
    try { return JSON.parse(value); } catch { return []; }
  }
  return [];
}

function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatMonthYear(ymStr) {
  if (!ymStr) return '';
  const [year, month] = ymStr.split('-');
  return new Date(Number(year), Number(month) - 1).toLocaleDateString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}

function dateRange(start, end, isCurrent) {
  const s = formatMonthYear(start);
  const e = isCurrent ? 'Present' : formatMonthYear(end);
  if (!s && !e) return null;
  if (!s) return e;
  if (!e) return s;
  return `${s} – ${e}`;
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeading({ icon, title }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
      <Iconify icon={icon} width={20} color="primary.main" />
      <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
        {title}
      </Typography>
    </Stack>
  );
}

// ─── Work experience timeline ─────────────────────────────────────────────────

function WorkExperienceSection({ entries }) {
  const theme = useTheme();
  if (!Array.isArray(entries) || entries.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <SectionHeading icon="solar:suitcase-bold-duotone" title="Work Experience" />
        <Stack spacing={0}>
          {entries.map((entry, index) => {
            const range = dateRange(entry.start_date, entry.end_date, entry.is_current);
            return (
              <Stack key={entry.id || index} direction="row" spacing={0}>
                {/* Timeline rail */}
                <Stack alignItems="center" sx={{ width: 32, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      mt: 0.6,
                      flexShrink: 0,
                    }}
                  />
                  {index < entries.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        flex: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                        my: 0.5,
                      }}
                    />
                  )}
                </Stack>

                {/* Content */}
                <Stack spacing={0.5} sx={{ flex: 1, pb: index < entries.length - 1 ? 3 : 0 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }}>
                    <Stack spacing={0.25}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {entry.company || '—'}
                      </Typography>
                      <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                        {entry.role || '—'}
                      </Typography>
                    </Stack>
                    {range && (
                      <Chip
                        label={range}
                        size="small"
                        variant="outlined"
                        sx={{ mt: { xs: 0.5, sm: 0 }, flexShrink: 0, fontWeight: 500, fontSize: '0.72rem' }}
                      />
                    )}
                  </Stack>
                  {entry.achievements && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, whiteSpace: 'pre-line' }}>
                      {entry.achievements}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Education timeline ───────────────────────────────────────────────────────

function EducationSection({ entries }) {
  const theme = useTheme();
  if (!Array.isArray(entries) || entries.length === 0) return null;

  return (
    <Card>
      <CardContent>
        <SectionHeading icon="solar:book-bold-duotone" title="Education" />
        <Stack spacing={0}>
          {entries.map((entry, index) => {
            const years =
              entry.start_year && entry.end_year
                ? `${entry.start_year} – ${entry.end_year}`
                : entry.start_year || entry.end_year || null;

            return (
              <Stack key={entry.id || index} direction="row" spacing={0}>
                {/* Timeline rail */}
                <Stack alignItems="center" sx={{ width: 32, flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'secondary.main',
                      mt: 0.6,
                      flexShrink: 0,
                    }}
                  />
                  {index < entries.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        flex: 1,
                        bgcolor: alpha(theme.palette.secondary.main, 0.15),
                        my: 0.5,
                      }}
                    />
                  )}
                </Stack>

                {/* Content */}
                <Stack spacing={0.5} sx={{ flex: 1, pb: index < entries.length - 1 ? 3 : 0 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-start' }}>
                    <Stack spacing={0.25}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                        {entry.institution || '—'}
                      </Typography>
                      <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600 }}>
                        {entry.course || '—'}
                      </Typography>
                    </Stack>
                    <Stack alignItems={{ sm: 'flex-end' }} spacing={0.5} sx={{ mt: { xs: 0.5, sm: 0 }, flexShrink: 0 }}>
                      {years && (
                        <Chip
                          label={years}
                          size="small"
                          variant="outlined"
                          color="secondary"
                          sx={{ fontWeight: 500, fontSize: '0.72rem' }}
                        />
                      )}
                      {entry.gpa && (
                        <Typography variant="caption" color="text.secondary">
                          GPA: {entry.gpa}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                  {entry.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, whiteSpace: 'pre-line' }}>
                      {entry.description}
                    </Typography>
                  )}
                </Stack>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Skills section ───────────────────────────────────────────────────────────

function SkillsSection({ skills }) {
  if (!skills || skills.length === 0) return null;
  const colors = ['primary', 'secondary', 'info', 'success', 'warning'];

  return (
    <Card>
      <CardContent>
        <SectionHeading icon="solar:stars-bold-duotone" title="Skills" />
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {skills.map((skill, i) => (
            <Chip
              key={skill}
              label={skill}
              size="small"
              color={colors[i % colors.length]}
              variant="soft"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Hero header card ─────────────────────────────────────────────────────────

function HeroCard({ profile, cvUrl, completion }) {
  const theme = useTheme();
  const name = profile?.full_name || 'Unnamed Applicant';
  const role = Array.isArray(profile?.work_experience) && profile.work_experience.length > 0
    ? profile.work_experience[0].role
    : null;

  return (
    <Card
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.darker || theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        color: 'common.white',
        overflow: 'visible',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ sm: 'center' }}>
          {/* Avatar */}
          <Avatar
            sx={{
              width: 88,
              height: 88,
              fontSize: 32,
              fontWeight: 700,
              bgcolor: alpha('#fff', 0.2),
              color: 'common.white',
              border: `3px solid ${alpha('#fff', 0.4)}`,
              flexShrink: 0,
            }}
          >
            {initials(name)}
          </Avatar>

          {/* Name block */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'common.white', lineHeight: 1.2 }}>
              {name}
            </Typography>
            {role && (
              <Typography variant="subtitle1" sx={{ color: alpha('#fff', 0.8), mt: 0.5 }}>
                {role}
              </Typography>
            )}
            {profile?.location && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.75 }}>
                <Iconify icon="solar:map-point-bold-duotone" width={16} sx={{ color: alpha('#fff', 0.7) }} />
                <Typography variant="body2" sx={{ color: alpha('#fff', 0.7) }}>
                  {profile.location}
                </Typography>
              </Stack>
            )}
          </Box>

          {/* CV button */}
          <Box sx={{ flexShrink: 0 }}>
            {cvUrl ? (
              <Button
                variant="contained"
                href={cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                component="a"
                startIcon={<Iconify icon="solar:file-download-bold-duotone" />}
                sx={{
                  bgcolor: 'common.white',
                  color: 'primary.main',
                  fontWeight: 700,
                  '&:hover': { bgcolor: alpha('#fff', 0.9) },
                }}
              >
                Download CV
              </Button>
            ) : (
              <Tooltip title="No CV uploaded">
                <span>
                  <Button
                    variant="outlined"
                    disabled
                    sx={{ borderColor: alpha('#fff', 0.4), color: alpha('#fff', 0.5) }}
                  >
                    No CV
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Stack>

        {/* Completion bar */}
        <Stack spacing={1} sx={{ mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.7) }}>
              Profile completion
            </Typography>
            <Typography variant="caption" sx={{ color: alpha('#fff', 0.9), fontWeight: 700 }}>
              {completion}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={completion}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: alpha('#fff', 0.2),
              '& .MuiLinearProgress-bar': { bgcolor: 'common.white', borderRadius: 3 },
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Empty section placeholder ────────────────────────────────────────────────

function EmptySection({ icon, message }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack alignItems="center" spacing={1} sx={{ py: 3 }}>
          <Iconify icon={icon} width={36} color="text.disabled" />
          <Typography variant="body2" color="text.disabled">
            {message}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ApplicantDetailView({ userId }) {
  const [profile, setProfile] = useState(null);
  const [cvUrl, setCvUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const token = await getAccessToken();
        const res = await fetch(`/api/applicant/profile?user_id=${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Failed to load profile');
        setProfile(result.profile);
        if (result.profile?.cv_file_path) {
          const url = await getCvSignedUrl(result.profile.cv_file_path);
          setCvUrl(url);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button component={RouterLink} href={paths.dashboard.applications.root} sx={{ mb: 2, pl: 0 }}>
          ← Back to Applications
        </Button>
        <Alert severity="info">This applicant has not set up a profile yet.</Alert>
      </Container>
    );
  }

  const skills = parseJsonArray(profile.skills);
  const workExp = parseJsonArray(profile.work_experience);
  const education = parseJsonArray(profile.education);
  const completion = profile.profile_completion || 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Back */}
        <Button
          component={RouterLink}
          href={paths.dashboard.applications.root}
          variant="text"
          startIcon={<Iconify icon="eva:arrow-back-fill" />}
          sx={{ alignSelf: 'flex-start', pl: 0 }}
        >
          Back to Applications
        </Button>

        {/* Hero */}
        <HeroCard profile={profile} cvUrl={cvUrl} completion={completion} />

        {/* Skills */}
        {skills.length > 0 ? (
          <SkillsSection skills={skills} />
        ) : (
          <EmptySection icon="solar:stars-bold-duotone" message="No skills listed yet." />
        )}

        {/* Divider label */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, letterSpacing: 1 }}>
            CAREER HISTORY
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>

        {/* Work Experience */}
        {workExp.length > 0 ? (
          <WorkExperienceSection entries={workExp} />
        ) : (
          <EmptySection icon="solar:suitcase-bold-duotone" message="No work experience listed yet." />
        )}

        {/* Education */}
        {education.length > 0 ? (
          <EducationSection entries={education} />
        ) : (
          <EmptySection icon="solar:book-bold-duotone" message="No education listed yet." />
        )}
      </Stack>
    </Container>
  );
}
