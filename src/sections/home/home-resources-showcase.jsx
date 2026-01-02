'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

// ----------------------------------------------------------------------

const CATEGORIES = [
  {
    title: 'Templates & Tools',
    description: 'Professional CV templates, appraisal forms, and HR documentation',
    icon: 'solar:document-text-bold-duotone',
    color: 'primary',
  },
  {
    title: 'Guides & Tips',
    description: 'Step-by-step guides for HR challenges and workplace dynamics',
    icon: 'solar:book-bold-duotone',
    color: 'secondary',
  },
  {
    title: 'Learning & Courses',
    description: 'Recommended books, online courses, and certifications',
    icon: 'solar:graduation-cap-bold-duotone',
    color: 'success',
  },
  {
    title: 'Research & Insights',
    description: 'HR trend reports, case studies, and infographics',
    icon: 'solar:chart-bold-duotone',
    color: 'warning',
  },
];

// ----------------------------------------------------------------------

export function HomeResourcesShowcase() {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        bgcolor: alpha(theme.palette.grey[500], 0.04),
      }}
    >
      <Container>
        <Stack spacing={1} sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h2">Resources for Growth</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            Practical tools and insights to help you excel in your HR career
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {CATEGORIES.map((category) => {
            const iconBgColor = alpha(theme.palette[category.color].main, 0.16);
            
            return (
              <Grid item xs={12} sm={6} md={3} key={category.title}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={2} alignItems="center" textAlign="center">
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: iconBgColor,
                          color: `${category.color}.main`,
                        }}
                      >
                        <Iconify icon={category.icon} width={32} />
                      </Box>

                      <Typography variant="h6">{category.title}</Typography>

                      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 48 }}>
                        {category.description}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box sx={{ mt: 5, textAlign: 'center' }}>
          <Button
            component={RouterLink}
            href={paths.resources.root}
            variant="contained"
            size="large"
            color="primary"
          >
            Explore All Resources
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

