'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Link from '@mui/material/Link';
import { alpha, useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function BlogDisclosureSection() {
  const theme = useTheme();

  return (
    <Card
      sx={{
        mt: 5,
        bgcolor: alpha(theme.palette.warning.main, 0.08),
        borderLeft: 4,
        borderColor: 'warning.main',
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'warning.lighter',
                color: 'warning.main',
              }}
            >
              <Iconify icon="solar:shield-warning-bold-duotone" width={24} />
            </Box>
            <Typography variant="h6" fontWeight="bold">
              Disclosure
            </Typography>
          </Stack>

          {/* Content */}
          <Typography variant="body2" color="text.secondary">
            <strong>Please note:</strong> This article may contain affiliate links. If you make a
            purchase through these links, we may earn a commission at no extra cost to you. We only
            recommend products and services we genuinely believe will add value to our readers.
          </Typography>

          <Typography variant="body2" color="text.secondary">
            The content on Mavidah is for informational and educational purposes only and should
            not be considered as professional legal, financial, or HR advice for your specific
            situation. We recommend consulting with qualified professionals before making important
            decisions.
          </Typography>

          {/* Read More Link */}
          <Box>
            <Link
              component={RouterLink}
              href={paths.disclosure}
              underline="hover"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'warning.darker',
                fontWeight: 600,
                fontSize: '0.875rem',
              }}
            >
              Read our full disclosure policy
              <Iconify icon="eva:arrow-ios-forward-fill" width={16} />
            </Link>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

