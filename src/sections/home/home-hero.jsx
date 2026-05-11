'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';

import { CONFIG } from 'src/config-global';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

const signUpHref =
  CONFIG.auth.method === 'supabase' ? paths.auth.supabase.signUp : paths.auth.jwt.signUp;

// ----------------------------------------------------------------------

export function HomeHero() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        position: 'relative',
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Container>
        <Stack
          spacing={3}
          sx={{
            textAlign: { xs: 'center', md: 'left' },
            maxWidth: { md: 720 },
          }}
        >
          <Typography variant="h1" sx={{ fontSize: { xs: 40, md: 56 } }}>
            Welcome to{' '}
            <Box component="span" sx={{ color: 'primary.main' }}>
              Mavidah
            </Box>
          </Typography>

          <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            A digital space for career knowledge, guidance, workplace insights, and resources, shared simply and practically to support growth through every phase of your professional journey.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: { xs: 'center', md: 'flex-start' } }}
          >
            <Button
              component={RouterLink}
              href={paths.blog.root}
              variant="contained"
              size="large"
              color="primary"
            >
              Explore Blog
            </Button>

            <Button
              component={RouterLink}
              href={paths.resources.root}
              variant="outlined"
              size="large"
              color="primary"
            >
              Browse Resources
            </Button>

            <Button
              component={RouterLink}
              href={signUpHref}
              variant="outlined"
              size="large"
              color="primary"
            >
              Join
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

