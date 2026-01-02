'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const VALUES = [
  {
    title: 'Knowledge Sharing',
    description: 'Breaking down HR concepts and workplace topics in simple, actionable ways',
    icon: 'solar:book-2-bold-duotone',
    color: 'primary',
  },
  {
    title: 'Community Driven',
    description: 'Welcoming expert contributions and diverse perspectives from HR professionals',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: 'secondary',
  },
  {
    title: 'Practical Insights',
    description: 'Providing real-world solutions and tools that work in actual workplace scenarios',
    icon: 'solar:lightbulb-bolt-bold-duotone',
    color: 'success',
  },
  {
    title: 'Growth Focused',
    description: 'Inspiring personal and professional development through valuable resources',
    icon: 'solar:chart-2-bold-duotone',
    color: 'warning',
  },
];

// ----------------------------------------------------------------------

export function AboutMission() {
  const theme = useTheme();
  
  return (
    <Box sx={{ py: { xs: 8, md: 12 } }}>
      <Container>
        <Stack spacing={5}>
          {/* Mission Statement */}
          <Stack spacing={3} sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
            <Typography variant="h3">Our Mission</Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: 18 }}>
              Mavidah is designed as a "bloc"—a community where people can learn, grow, and access 
              valuable professional insights. We aim to break down HR concepts, explore career topics, 
              and discuss what truly works in the workplace.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: 18 }}>
              The platform is intentionally collaborative, welcoming expert writers, HR professionals, 
              and experienced contributors to enrich the community with diverse perspectives. Mavidah 
              aims to be more than a blog—it's a learning hub where people come to understand what 
              truly works at work, discover actionable ideas, and connect with insights that inspire 
              personal and professional growth.
            </Typography>
          </Stack>

          {/* Values */}
          <Box>
            <Typography variant="h3" sx={{ textAlign: 'center', mb: 5 }}>
              Our Values
            </Typography>

            <Grid container spacing={3}>
              {VALUES.map((value) => {
                const iconBgColor = alpha(theme.palette[value.color].main, 0.16);
                
                return (
                  <Grid item xs={12} sm={6} md={3} key={value.title}>
                    <Card
                      sx={{
                        height: '100%',
                        textAlign: 'center',
                      }}
                    >
                      <CardContent>
                        <Stack spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: iconBgColor,
                              color: `${value.color}.main`,
                            }}
                          >
                            <Iconify icon={value.icon} width={32} />
                          </Box>

                          <Typography variant="h6">{value.title}</Typography>

                          <Typography variant="body2" color="text.secondary">
                            {value.description}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}

