'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { MainLayout } from 'src/layouts/main';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email');
  const [email, setEmail] = useState(emailParam || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUnsubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Successfully unsubscribed from newsletter' });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to unsubscribe. Please try again.' });
      }
    } catch (error) {
      console.error('Unsubscribe error:', error);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="sm">
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3} alignItems="center">
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: 'primary.lighter',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Iconify icon="solar:letter-bold-duotone" width={32} sx={{ color: 'primary.main' }} />
                </Box>

                <Typography variant="h4" sx={{ textAlign: 'center' }}>
                  Unsubscribe from Newsletter
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  We're sorry to see you go. Enter your email address below to unsubscribe from our newsletter.
                </Typography>

                {message.text && (
                  <Alert severity={message.type === 'success' ? 'success' : 'error'} sx={{ width: '100%' }}>
                    {message.text}
                  </Alert>
                )}

                {message.type !== 'success' && (
                  <Box component="form" onSubmit={handleUnsubscribe} sx={{ width: '100%' }}>
                    <Stack spacing={2}>
                      <TextField
                        type="email"
                        label="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        fullWidth
                        disabled={loading}
                        autoFocus
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="solar:letter-bold-duotone" />}
                      >
                        {loading ? 'Unsubscribing...' : 'Unsubscribe'}
                      </Button>
                    </Stack>
                  </Box>
                )}

                {message.type === 'success' && (
                  <Button variant="outlined" href="/" component="a" fullWidth>
                    Return to Homepage
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </MainLayout>
  );
}

