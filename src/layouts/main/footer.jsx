'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { Logo } from 'src/components/logo';

// ----------------------------------------------------------------------

const FOOTER_LINKS = [
  {
    title: 'Company',
    links: [
      { name: 'About Us', path: paths.about },
      { name: 'Contact', path: paths.contact },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', path: paths.blog.root },
      { name: 'Products', path: paths.resources.root },
      { name: 'Jobs', path: paths.jobs },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms of Service', path: '/terms-of-service' },
      { name: 'Disclosure', path: paths.disclosure },
    ],
  },
];

// ----------------------------------------------------------------------

export function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 8,
        mt: 'auto',
        bgcolor: alpha(theme.palette.grey[500], 0.04),
        borderTop: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container>
        <Grid container spacing={4}>
          {/* Brand Section */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2}>
              <Logo />
              <Typography variant="body2" color="text.secondary">
                Your trusted hub for HR knowledge, career guidance, and workplace insights.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {CONFIG.site.contactEmail}
              </Typography>
            </Stack>
          </Grid>

          {/* Footer Links */}
          {FOOTER_LINKS.map((section) => (
            <Grid item xs={6} md={2.66} key={section.title}>
              <Typography variant="h6" gutterBottom>
                {section.title}
              </Typography>
              <Stack spacing={1}>
                {section.links.map((link) => (
                  <Link
                    key={link.name}
                    component={RouterLink}
                    href={link.path}
                    color="text.secondary"
                    underline="hover"
                    variant="body2"
                  >
                    {link.name}
                  </Link>
                ))}
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {currentYear} {CONFIG.site.name}. All rights reserved.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Built with Next.js & Material UI
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

