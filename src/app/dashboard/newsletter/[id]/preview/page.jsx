'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import { supabase } from 'src/lib/supabase';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function Page({ params }) {
  const router = useRouter();
  const [newsletter, setNewsletter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNewsletter() {
      try {
        const { data, error } = await supabase.from('newsletters').select('*').eq('id', params.id).single();
        if (error) throw error;
        setNewsletter(data);
      } catch (error) {
        console.error('Error fetching newsletter:', error);
        alert('Failed to load newsletter');
      } finally {
        setLoading(false);
      }
    }
    fetchNewsletter();
  }, [params.id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!newsletter) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography>Newsletter not found</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h4">Preview Newsletter</Typography>
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={() => router.push(paths.dashboard.newsletter.root)}
          >
            Back
          </Button>
        </Stack>

        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Subject: {newsletter.subject}
          </Typography>
          {newsletter.preview_text && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Preview: {newsletter.preview_text}
            </Typography>
          )}
          <Box
            sx={{
              mt: 3,
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
              p: 3,
              bgcolor: 'background.paper',
              '& img': { maxWidth: '100%', height: 'auto' },
              '& a': { color: 'primary.main' },
            }}
            dangerouslySetInnerHTML={{ __html: newsletter.content_html }}
          />
        </Paper>
      </Stack>
    </Container>
  );
}

