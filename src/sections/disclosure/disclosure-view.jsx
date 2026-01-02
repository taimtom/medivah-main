'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';

import { MainLayout } from 'src/layouts/main';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function DisclosureView() {
  const theme = useTheme();

  return (
    <MainLayout>
      <Box>
        {/* Hero Section */}
        <Box
          sx={{
            py: { xs: 8, md: 10 },
            bgcolor: alpha(theme.palette.primary.main, 0.04),
          }}
        >
          <Container maxWidth="md">
            <Stack spacing={3} alignItems="center" textAlign="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                }}
              >
                <Iconify icon="solar:document-text-bold-duotone" width={48} />
              </Box>

              <Typography variant="h2">Disclosure Policy</Typography>

              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Transparency and honesty are core values at Mavidah. This page outlines our
                disclosure policies and practices.
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* Content */}
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
          <Stack spacing={4}>
            {/* Affiliate Disclosure */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'info.lighter',
                        color: 'info.main',
                      }}
                    >
                      <Iconify icon="solar:link-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Affiliate Disclosure</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    Mavidah participates in various affiliate marketing programs, which means we may
                    earn commissions on purchases made through links on our website. These affiliate
                    partnerships help us maintain and improve our content at no extra cost to you.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    When you click on an affiliate link and make a purchase, we may receive a
                    commission from the merchant. This does not affect the price you pay and helps
                    support our mission to provide valuable HR content and resources.
                  </Typography>

                  <Typography variant="body1">
                    We only recommend products, services, and resources that we genuinely believe
                    will add value to our readers. Our recommendations are based on personal
                    experience, research, and professional judgment, not on commission rates.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Sponsored Content */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'success.lighter',
                        color: 'success.main',
                      }}
                    >
                      <Iconify icon="solar:star-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Sponsored Content</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    From time to time, we may publish sponsored content or paid partnerships. All
                    sponsored posts, reviews, or articles will be clearly marked as "Sponsored,"
                    "Paid Partnership," or "In Partnership With [Brand Name]."
                  </Typography>

                  <Typography variant="body1" paragraph>
                    Sponsored content is created with the same standards of quality and integrity as
                    our regular content. We maintain editorial independence and will only work with
                    brands and companies that align with our values and serve our audience's
                    interests.
                  </Typography>

                  <Typography variant="body1">
                    Sponsored partnerships do not influence our editorial decisions or the honest
                    opinions expressed in our content.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Product Reviews */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'warning.lighter',
                        color: 'warning.main',
                      }}
                    >
                      <Iconify icon="solar:star-bold" width={28} />
                    </Box>
                    <Typography variant="h4">Product Reviews & Recommendations</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    When we review products, services, or resources on Mavidah, we strive to provide
                    honest, unbiased opinions based on our experience and research. Some products
                    may be provided to us free of charge for review purposes, while others are
                    purchased by us independently.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    Receiving a free product does not guarantee a positive review. We maintain
                    editorial independence and will always share our honest assessment, including
                    both strengths and limitations.
                  </Typography>

                  <Typography variant="body1">
                    Our goal is to help you make informed decisions, and we take this responsibility
                    seriously.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Professional Advice Disclaimer */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'error.lighter',
                        color: 'error.main',
                      }}
                    >
                      <Iconify icon="solar:shield-warning-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Professional Advice Disclaimer</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    The content on Mavidah is for informational and educational purposes only. It
                    should not be considered as professional legal, financial, or HR advice for your
                    specific situation.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    While we aim to provide accurate and helpful information, every workplace and
                    situation is unique. We strongly recommend consulting with qualified
                    professionals (such as HR consultants, employment lawyers, or certified
                    advisors) before making important decisions.
                  </Typography>

                  <Typography variant="body1">
                    Mavidah and its contributors are not liable for any actions taken based on the
                    information provided on this website.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Digital Products */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'primary.lighter',
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon="solar:cart-large-4-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Digital Products & Resources</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    Mavidah offers digital products such as templates, guides, and e-books for
                    purchase. These products are created by our team and contributors based on
                    professional experience and best practices in HR and career development.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    All sales are final for digital products. Due to the nature of digital goods, we
                    cannot offer refunds once a product has been downloaded or accessed.
                  </Typography>

                  <Typography variant="body1">
                    If you experience technical issues accessing your purchase, please contact us at{' '}
                    <strong>contact@mavidah.com</strong> and we'll be happy to assist you.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Guest Contributors */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'secondary.lighter',
                        color: 'secondary.main',
                      }}
                    >
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Guest Contributors</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    Mavidah welcomes expert contributions from HR professionals, career coaches, and
                    workplace specialists. Guest posts will be clearly attributed to their authors,
                    and any potential conflicts of interest will be disclosed.
                  </Typography>

                  <Typography variant="body1">
                    Guest contributors' opinions are their own and do not necessarily reflect the
                    views of Mavidah or its team.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Updates and Changes */}
            <Card>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.300',
                        color: 'grey.800',
                      }}
                    >
                      <Iconify icon="solar:refresh-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Updates and Changes</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    We may update this disclosure policy from time to time to reflect changes in our
                    practices or legal requirements. The updated version will be posted on this page
                    with the revision date.
                  </Typography>

                  <Typography variant="body1">
                    We encourage you to review this page periodically to stay informed about how we
                    maintain transparency with our readers.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Contact Section */}
            <Box
              sx={{
                p: 4,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                textAlign: 'center',
              }}
            >
              <Stack spacing={2}>
                <Typography variant="h5">Questions About Our Disclosures?</Typography>
                <Typography variant="body1" color="text.secondary">
                  If you have any questions about our disclosure policies or practices, please don't
                  hesitate to contact us.
                </Typography>
                <Typography variant="body2">
                  Email: <strong>contact@mavidah.com</strong>
                </Typography>
              </Stack>
            </Box>

            {/* Last Updated */}
            <Typography variant="caption" color="text.disabled" textAlign="center">
              Last Updated: January 2, 2026
            </Typography>
          </Stack>
        </Container>
      </Box>
    </MainLayout>
  );
}
