'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

export function HomeCTA() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: alpha(theme.palette.primary.main, 0.08),
      }}
    >
      <Container>
        <Stack spacing={3} sx={{ textAlign: 'center', maxWidth: 640, mx: 'auto' }}>
          <Typography variant="h3">
            Ready to Grow Your HR Career?
          </Typography>

          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Join our community and get access to expert insights, practical tools, 
            and resources that will help you excel in your professional journey.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'center' }}
          >
            <Button
              component={RouterLink}
              href={paths.contact}
              variant="contained"
              size="large"
              color="primary"
            >
              Get In Touch
            </Button>

            <Button
              component={RouterLink}
              href={paths.about}
              variant="outlined"
              size="large"
              color="primary"
            >
              Learn More About Us
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

