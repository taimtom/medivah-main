'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

export function AboutHero() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Container>
        <Stack spacing={3} sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
          <Typography variant="h1">About Mavidah</Typography>

          <Typography variant="h5" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            A digital space built to share HR knowledge, career guidance, and workplace insights 
            in a simple, relatable, and practical way.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

