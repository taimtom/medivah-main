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
    description: 'Breaking down HR concepts, career topics, and workplace realities into clear, accessible, and actionable ideas.',
    icon: 'solar:book-2-bold-duotone',
    color: 'primary',
  },
  {
    title: 'Community-Driven',
    description: 'Welcoming expert contributors, practitioners, and diverse perspectives to enrich learning through shared experience.',
    icon: 'solar:users-group-rounded-bold-duotone',
    color: 'secondary',
  },
  {
    title: 'Practical Insights',
    description: 'Focusing on real-world tools, examples, and solutions that work in everyday workplace situations.',
    icon: 'solar:lightbulb-bolt-bold-duotone',
    color: 'success',
  },
  {
    title: 'Growth-Focused',
    description: 'Supporting personal and professional development at every stage of the professional journey through thoughtful, valuable resources.',
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
              Mavidah is a collaborative digital space built to share career knowledge, guidance, and workplace insights in a simple, relatable, and practical way.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: 18 }}>
              We exist to help people learn, grow, and make sense of work at every stage of their professional journey by breaking down real career questions, exploring workplace dynamics, and examining what truly works in the modern world of work.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: 18 }}>
              Mavidah is intentionally community-driven, welcoming expert writers, HR professionals, and experienced practitioners to contribute diverse, grounded perspectives. More than a blog, Mavidah is a learning hub where people come to understand work beyond titles, discover actionable ideas, and engage with insights that support meaningful personal and professional growth.
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

