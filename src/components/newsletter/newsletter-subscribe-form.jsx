'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function NewsletterSubscribeForm({ variant = 'default', onSuccess }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || null }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Successfully subscribed!' });
        setEmail('');
        setName('');
        if (onSuccess) onSuccess();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to subscribe. Please try again.' });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  if (variant === 'compact') {
    return (
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          {message.text && (
            <Alert severity={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
          )}
          <TextField
            type="email"
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            size="small"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="solar:letter-bold-duotone" />}
          >
            Subscribe
          </Button>
        </Stack>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {message.text && (
          <Alert severity={message.type === 'success' ? 'success' : 'error'}>{message.text}</Alert>
        )}
        <Typography variant="h6">Stay Updated</Typography>
        <Typography variant="body2" color="text.secondary">
          Subscribe to our newsletter to get the latest HR insights, career tips, and job opportunities.
        </Typography>
        <TextField
          type="text"
          label="Name (Optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          disabled={loading}
        />
        <TextField
          type="email"
          label="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          disabled={loading}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : <Iconify icon="solar:letter-bold-duotone" />}
        >
          {loading ? 'Subscribing...' : 'Subscribe to Newsletter'}
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
          We respect your privacy. Unsubscribe at any time.
        </Typography>
      </Stack>
    </Box>
  );
}

