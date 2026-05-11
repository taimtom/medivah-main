'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import MenuItem from '@mui/material/MenuItem';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { supabase } from 'src/lib/supabase';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from 'src/auth/hooks';

// ─── Pipeline definition ────────────────────────────────────────────────────

const PIPELINE_STAGES = [
  { key: 'submitted', label: 'Applied' },
  { key: 'under_review', label: 'Viewed by Recruiter' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
];

const TERMINAL_STATUSES = ['rejected', 'closed'];

const STATUS_FILTER_OPTIONS = [
  'all',
  'submitted',
  'under_review',
  'shortlisted',
  'interview',
  'offer',
  'hired',
  'rejected',
  'closed',
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Given a full history array and the applied_at timestamp, build a map of
 * { [status_key]: ISO timestamp } for each stage that was reached.
 */
function buildStageTimestampMap(appliedAt, historyRows) {
  const map = { submitted: appliedAt };
  (historyRows || []).forEach((entry) => {
    if (entry.new_status && !map[entry.new_status]) {
      map[entry.new_status] = entry.changed_at;
    }
  });
  return map;
}

// ─── Stage dot / connector ───────────────────────────────────────────────────

function StageDot({ completed, active, rejected }) {
  const theme = useTheme();

  let bg = theme.vars.palette.action.disabledBackground;
  let iconColor = theme.vars.palette.text.disabled;

  if (rejected) {
    bg = theme.vars.palette.error.lighter;
    iconColor = theme.vars.palette.error.main;
  } else if (completed) {
    bg = theme.vars.palette.success.main;
    iconColor = theme.vars.palette.common.white;
  } else if (active) {
    bg = theme.vars.palette.primary.main;
    iconColor = theme.vars.palette.common.white;
  }

  return (
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: bg,
        flexShrink: 0,
        transition: 'background-color 0.2s',
      }}
    >
      <Iconify
        icon={
          rejected
            ? 'eva:close-fill'
            : completed
              ? 'eva:checkmark-fill'
              : active
                ? 'eva:radio-button-on-fill'
                : 'eva:radio-button-off-fill'
        }
        width={16}
        color={iconColor}
      />
    </Box>
  );
}

// ─── Inline stepper for one application ─────────────────────────────────────

function ApplicationStepper({ application, history, historyLoading }) {
  const theme = useTheme();
  const isTerminal = TERMINAL_STATUSES.includes(application.status);
  const isRejected = application.status === 'rejected';
  const stageMap = useMemo(
    () => buildStageTimestampMap(application.applied_at, history),
    [application.applied_at, history]
  );

  const activeIndex = PIPELINE_STAGES.findIndex((s) => s.key === application.status);

  return (
    <Box>
      {/* Horizontal stepper */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${PIPELINE_STAGES.length}, 1fr)`,
          gap: 0,
          position: 'relative',
          mt: 1,
        }}
      >
        {/* Connector line behind dots */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            left: '8.33%',
            right: '8.33%',
            height: 2,
            bgcolor: theme.vars.palette.divider,
            zIndex: 0,
          }}
        />

        {PIPELINE_STAGES.map((stage, index) => {
          const completed = stageMap[stage.key] && !isTerminal
            ? true
            : stageMap[stage.key] && isTerminal && index < activeIndex;
          const active = !isTerminal && application.status === stage.key;
          const ts = stageMap[stage.key];

          return (
            <Stack key={stage.key} alignItems="center" spacing={0.5} sx={{ position: 'relative', zIndex: 1 }}>
              <StageDot completed={Boolean(completed)} active={active} rejected={false} />
              <Typography
                variant="caption"
                align="center"
                sx={{
                  fontWeight: active || completed ? 600 : 400,
                  color: active
                    ? 'primary.main'
                    : completed
                      ? 'text.primary'
                      : 'text.disabled',
                  lineHeight: 1.3,
                  px: 0.5,
                }}
              >
                {stage.label}
              </Typography>
              {ts ? (
                <Typography variant="caption" color="text.disabled" align="center" sx={{ fontSize: '0.65rem' }}>
                  {formatDate(ts)}
                </Typography>
              ) : (
                <Box sx={{ height: 14 }} />
              )}
            </Stack>
          );
        })}
      </Box>

      {/* Terminal state banners */}
      {isRejected && (
        <Alert severity="error" sx={{ mt: 2 }} icon={<Iconify icon="solar:close-circle-bold-duotone" />}>
          This application was not progressed. Date: {formatDateTime(application.last_status_at)}
        </Alert>
      )}
      {application.status === 'closed' && (
        <Alert severity="warning" sx={{ mt: 2 }} icon={<Iconify icon="solar:archive-bold-duotone" />}>
          This position has been closed. Date: {formatDateTime(application.last_status_at)}
        </Alert>
      )}

      {/* Detailed history timeline */}
      {historyLoading ? (
        <Stack spacing={1} sx={{ mt: 2 }}>
          {[1, 2].map((i) => <Skeleton key={i} height={20} />)}
        </Stack>
      ) : history && history.length > 0 ? (
        <Stack spacing={0} sx={{ mt: 2 }} divider={<Divider flexItem />}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600 }}>
            Status history
          </Typography>
          {[...history].reverse().map((entry) => (
            <Stack key={entry.id} direction="row" spacing={1.5} alignItems="flex-start" sx={{ py: 1 }}>
              <Iconify icon="solar:clock-circle-bold-duotone" width={16} color="text.disabled" sx={{ mt: 0.25 }} />
              <Stack spacing={0.25}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  {entry.old_status && (
                    <>
                      <Chip
                        label={entry.old_status.replace(/_/g, ' ')}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                      <Iconify icon="eva:arrow-right-fill" width={14} />
                    </>
                  )}
                  <Chip
                    label={entry.new_status.replace(/_/g, ' ')}
                    size="small"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.65rem' }}
                  />
                </Stack>
                {entry.note && (
                  <Typography variant="caption" color="text.secondary">
                    {entry.note}
                  </Typography>
                )}
                <Typography variant="caption" color="text.disabled">
                  {formatDateTime(entry.changed_at)}
                </Typography>
              </Stack>
            </Stack>
          ))}
        </Stack>
      ) : null}
    </Box>
  );
}

// ─── Single application card ─────────────────────────────────────────────────

function ApplicationCard({ application }) {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleToggle = useCallback(async () => {
    const next = !expanded;
    setExpanded(next);

    if (next && history === null) {
      setHistoryLoading(true);
      try {
        const res = await fetch(`/api/applications/${application.id}/history`);
        const result = await res.json();
        if (res.ok) setHistory(result.rows || []);
        else setHistory([]);
      } catch {
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    }
  }, [application.id, expanded, history]);

  const isTerminal = TERMINAL_STATUSES.includes(application.status);

  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ pb: '12px !important' }}>
        {/* Header row */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" noWrap>
              {application.jobs?.title || 'Unknown role'}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {application.jobs?.company && (
                <Typography variant="body2" color="text.secondary">
                  {application.jobs.company}
                </Typography>
              )}
              {application.jobs?.location && (
                <Typography variant="body2" color="text.disabled">
                  · {application.jobs.location}
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
            <Chip
              size="small"
              label={application.status.replace(/_/g, ' ')}
              color={
                application.status === 'hired'
                  ? 'success'
                  : application.status === 'offer'
                    ? 'primary'
                    : application.status === 'rejected' || application.status === 'closed'
                      ? 'error'
                      : isTerminal
                        ? 'default'
                        : 'info'
              }
            />
            <Typography variant="caption" color="text.disabled">
              Applied {formatDate(application.applied_at)}
            </Typography>
          </Stack>
        </Stack>

        {/* Stepper (always visible, collapsed by default) */}
        <Divider sx={{ my: 1.5 }} />

        <ApplicationStepper
          application={application}
          history={expanded ? history : null}
          historyLoading={historyLoading}
        />

        {/* Expand toggle */}
        <Button
          size="small"
          variant="text"
          onClick={handleToggle}
          endIcon={
            <Iconify icon={expanded ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
          }
          sx={{ mt: 1, color: 'text.secondary', px: 0 }}
        >
          {expanded ? 'Hide history' : 'Show history'}
        </Button>

        <Collapse in={expanded} timeout="auto" unmountOnExit={false} />
      </CardContent>
    </Card>
  );
}

// ─── Loading skeleton ────────────────────────────────────────────────────────

function ApplicationSkeleton() {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Stack spacing={0.75}>
            <Skeleton width={220} height={22} />
            <Skeleton width={140} height={18} />
          </Stack>
          <Skeleton variant="rounded" width={90} height={24} />
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Stack direction="row" spacing={2} justifyContent="space-between">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Stack key={i} alignItems="center" spacing={0.5} sx={{ flex: 1 }}>
              <Skeleton variant="circular" width={32} height={32} />
              <Skeleton width={60} height={14} />
            </Stack>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ─── Main view ───────────────────────────────────────────────────────────────

export function ApplicantApplicationsView() {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchRows = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const params = statusFilter !== 'all' ? `&status=${statusFilter}` : '';
        const response = await fetch(`/api/applications?limit=100${params}`, {
          headers: { Authorization: `Bearer ${session?.access_token || ''}` },
        });
        const result = await response.json();
        if (response.ok) setRows(result.rows || []);
      } finally {
        setLoading(false);
      }
    };
    fetchRows();
  }, [statusFilter, user?.id]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
          <Stack spacing={0.25}>
            <Typography variant="h4">My Applications</Typography>
            {!loading && (
              <Typography variant="body2" color="text.secondary">
                {rows.length} application{rows.length !== 1 ? 's' : ''}
                {statusFilter !== 'all' ? ` · filtered by "${statusFilter.replace(/_/g, ' ')}"` : ''}
              </Typography>
            )}
          </Stack>

          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 180 }}
            label="Filter by status"
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt === 'all' ? 'All statuses' : opt.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Pipeline legend */}
        <Card variant="outlined" sx={{ bgcolor: 'background.neutral', borderRadius: 2 }}>
          <CardContent sx={{ py: '12px !important' }}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, mr: 0.5 }}>
                Progress stages:
              </Typography>
              {PIPELINE_STAGES.map((stage, i) => (
                <Stack key={stage.key} direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    {stage.label}
                  </Typography>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <Iconify icon="eva:arrow-right-fill" width={12} color="text.disabled" />
                  )}
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Application cards */}
        {loading ? (
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => <ApplicationSkeleton key={i} />)}
          </Stack>
        ) : rows.length === 0 ? (
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Stack alignItems="center" spacing={1.5} sx={{ py: 4 }}>
                <Iconify icon="solar:document-bold-duotone" width={48} color="text.disabled" />
                <Typography variant="h6" color="text.secondary">
                  No applications yet
                </Typography>
                <Typography variant="body2" color="text.disabled" align="center">
                  When you apply for jobs your progress will be tracked here — stage by stage, with timestamps.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Stack spacing={2}>
            {rows.map((row) => (
              <ApplicationCard key={row.id} application={row} />
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
