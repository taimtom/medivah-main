'use client';

import { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useAuthContext } from 'src/auth/hooks';

function SavedJobSkeleton() {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
          <Stack spacing={0.75} sx={{ flex: 1 }}>
            <Skeleton variant="text" width="45%" height={28} />
            <Skeleton variant="text" width="30%" height={20} />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Skeleton variant="rounded" width={72} height={36} />
            <Skeleton variant="rounded" width={80} height={36} />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function SavedJobsView() {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRows = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/saved-jobs?applicant_id=${user.id}`);
      const result = await response.json();
      if (response.ok) setRows(result.rows || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const unsave = async (jobId) => {
    if (!user?.id) return;
    await fetch(`/api/saved-jobs?applicant_id=${user.id}&job_id=${jobId}`, { method: 'DELETE' });
    fetchRows();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Typography variant="h4">Saved Jobs</Typography>

        {loading ? (
          <>
            <SavedJobSkeleton />
            <SavedJobSkeleton />
            <SavedJobSkeleton />
          </>
        ) : (
          <>
            {rows.map((row) => (
              <Card key={row.id}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                    <Stack spacing={0.5}>
                      <Typography variant="h6">{row.jobs?.title || 'Unknown job'}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {row.jobs?.company || '-'} {row.jobs?.location ? `- ${row.jobs.location}` : ''}
                      </Typography>
                      {row.jobs?.published ? null : <Chip size="small" color="warning" label="No longer published" />}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Button component={RouterLink} href={paths.jobs.detail(row.jobs?.id)} variant="outlined">
                        View
                      </Button>
                      <Button color="error" onClick={() => unsave(row.jobs?.id)}>
                        Remove
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            {rows.length === 0 && (
              <Typography color="text.secondary">No saved jobs yet.</Typography>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
