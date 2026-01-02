'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function AboutCommunity() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: alpha(theme.palette.primary.main, 0.04),
      }}
    >
      <Container>
        <Stack spacing={4} sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
          <Typography variant="h3">
            Join the Mavidah Community
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: 18 }}>
            Whether you're an HR professional, career seeker, or workplace enthusiast, 
            Mavidah welcomes you. Explore our resources, read insightful articles, and 
            become part of a community that values growth and learning.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            <Button
              component={RouterLink}
              href={paths.blog.root}
              variant="contained"
              size="large"
              color="primary"
            >
              Read Our Blog
            </Button>

            <Button
              component={RouterLink}
              href={paths.contact}
              variant="outlined"
              size="large"
              color="primary"
            >
              Contact Us
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

