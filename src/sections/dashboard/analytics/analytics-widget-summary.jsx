'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function AnalyticsWidgetSummary({ title, total, icon, color = 'primary', subtitle }) {
  const theme = useTheme();

  // Handle colors safely - use grey as fallback if color doesn't exist in palette
  const getColorValue = () => {
    if (theme.palette[color]?.main) {
      return theme.palette[color].main;
    }
    return theme.palette.grey[600]; // Fallback to grey
  };

  const colorValue = getColorValue();

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(colorValue, 0.16),
                color: theme.palette[color]?.main ? `${color}.main` : 'grey.600',
              }}
            >
              <Iconify icon={icon} width={32} />
            </Box>

            <Typography variant="h3">{total}</Typography>
          </Stack>

          <Stack spacing={0.5}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}


