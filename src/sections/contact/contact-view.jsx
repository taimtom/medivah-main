'use client';

import { useState } from 'react';

import { MainLayout } from 'src/layouts/main';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const CONTACT_INFO = [
  {
    icon: 'solar:letter-bold-duotone',
    title: 'Email',
    value: CONFIG.site.contactEmail,
    color: 'primary',
  },
  {
    icon: 'solar:map-point-bold-duotone',
    title: 'Location',
    value: 'Nigeria',
    color: 'secondary',
  },
  {
    icon: 'solar:clock-circle-bold-duotone',
    title: 'Response Time',
    value: 'Within 24-48 hours',
    color: 'success',
  },
];

// ----------------------------------------------------------------------

export function ContactView() {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      console.error('Contact form error:', err);
      setError('Failed to send message. Please try emailing us directly at ' + CONFIG.site.contactEmail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <Box>
        {/* Hero Section */}
        <Box
        sx={{
          py: { xs: 10, md: 15 },
          bgcolor: alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Container>
          <Stack spacing={3} sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
            <Typography variant="h1">Contact Us</Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Have questions or need assistance? We're here to help. Get in touch with us.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Contact Form Section */}
      <Container sx={{ py: { xs: 8, md: 10 } }}>
        <Grid container spacing={4}>
          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Typography variant="h4">Get in Touch</Typography>
              <Typography variant="body1" color="text.secondary">
                Feel free to reach out to us with any questions, suggestions, or collaboration opportunities.
              </Typography>

              <Stack spacing={2}>
                {CONTACT_INFO.map((info) => {
                  const iconBgColor = alpha(theme.palette[info.color].main, 0.16);
                  
                  return (
                    <Card key={info.title}>
                      <CardContent>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: iconBgColor,
                              color: `${info.color}.main`,
                              flexShrink: 0,
                            }}
                          >
                            <Iconify icon={info.icon} width={24} />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" color="text.secondary">
                              {info.title}
                            </Typography>
                            <Typography variant="body1" fontWeight="600">
                              {info.value}
                            </Typography>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Stack>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" gutterBottom>
                  Send us a Message
                </Typography>

                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you for contacting us! We'll get back to you soon.
                  </Alert>
                )}

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />

                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />

                    <TextField
                      fullWidth
                      label="Subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    />

                    <TextField
                      fullWidth
                      label="Message"
                      name="message"
                      multiline
                      rows={6}
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Iconify icon="solar:letter-bold-duotone" />}
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
    </MainLayout>
  );
}

