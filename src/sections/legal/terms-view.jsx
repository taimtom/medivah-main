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
import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export function TermsView() {
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
                <Iconify icon="solar:document-bold-duotone" width={48} />
              </Box>

              <Typography variant="h2">Terms of Service</Typography>

              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Please read these terms carefully before using our website and services.
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* Content */}
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
          <Stack spacing={4}>
            {/* Acceptance of Terms */}
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
                      <Iconify icon="solar:check-circle-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Acceptance of Terms</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    By accessing and using the Mavidah website, you accept and agree to be bound by
                    the terms and provision of this agreement. If you do not agree to abide by the
                    above, please do not use this service.
                  </Typography>

                  <Typography variant="body1">
                    These Terms of Service ("Terms") govern your access to and use of our website,
                    services, and content. Your use of our services constitutes your agreement to
                    these Terms.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Use License */}
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
                      <Iconify icon="solar:license-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Use License</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    Permission is granted to temporarily access and use the materials on Mavidah's
                    website for personal, non-commercial transitory viewing only. This is the grant
                    of a license, not a transfer of title, and under this license you may not:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body1" component="span">
                        Modify or copy the materials
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Use the materials for any commercial purpose or for any public display
                        (commercial or non-commercial)
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Attempt to decompile or reverse engineer any software contained on the
                        website
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Remove any copyright or other proprietary notations from the materials
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Transfer the materials to another person or "mirror" the materials on any
                        other server
                      </Typography>
                    </li>
                  </Box>

                  <Typography variant="body1" sx={{ mt: 2 }}>
                    This license shall automatically terminate if you violate any of these
                    restrictions and may be terminated by Mavidah at any time.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* User Accounts */}
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
                      <Iconify icon="solar:user-id-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">User Accounts</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    When you create an account with us, you must provide information that is
                    accurate, complete, and current at all times. You are responsible for
                    safeguarding the password and for all activities that occur under your account.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    You agree not to disclose your password to any third party and to take sole
                    responsibility for any activities or actions under your account, whether or not
                    you have authorized such activities or actions.
                  </Typography>

                  <Typography variant="body1">
                    You must notify us immediately upon becoming aware of any breach of security or
                    unauthorized use of your account.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* User Content */}
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
                      <Iconify icon="solar:pen-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">User Content</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    Our website may allow you to post, link, store, share, and otherwise make
                    available certain information, text, graphics, or other material ("User
                    Content"). You are responsible for the User Content that you post on or through
                    the website.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    By posting User Content, you grant Mavidah a non-exclusive, worldwide,
                    royalty-free, sublicensable license to use, reproduce, modify, adapt, publish,
                    translate, and distribute such User Content in any and all media.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    You represent and warrant that:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body1" component="span">
                        You own or have the necessary licenses, rights, consents, and permissions
                        to use and authorize Mavidah to use your User Content
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Your User Content does not violate any third-party rights, including
                        intellectual property rights, privacy rights, or publicity rights
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Your User Content is not defamatory, libelous, obscene, or otherwise
                        unlawful
                      </Typography>
                    </li>
                  </Box>

                  <Typography variant="body1" sx={{ mt: 2 }}>
                    We reserve the right to remove any User Content that violates these Terms or is
                    otherwise objectionable in our sole discretion.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Prohibited Uses */}
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
                      <Iconify icon="solar:forbidden-circle-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Prohibited Uses</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    You agree not to use the website:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body1" component="span">
                        In any way that violates any applicable national or international law or
                        regulation
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To transmit, or procure the sending of, any advertising or promotional
                        material without our prior written consent
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To impersonate or attempt to impersonate the company, a company employee,
                        another user, or any other person or entity
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        In any way that infringes upon the rights of others, or in any way is
                        illegal, threatening, fraudulent, or harmful
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To engage in any other conduct that restricts or inhibits anyone's use or
                        enjoyment of the website
                      </Typography>
                    </li>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Purchases and Payments */}
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
                      <Iconify icon="solar:card-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Purchases and Payments</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    If you wish to purchase any product or service made available through the
                    website, you may be asked to supply certain information relevant to your
                    purchase, including credit card information, billing address, and shipping
                    information.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    All purchases are subject to our refund policy. Digital products are generally
                    non-refundable once downloaded or accessed, unless otherwise specified. Physical
                    products may be subject to return policies as outlined at the time of purchase.
                  </Typography>

                  <Typography variant="body1">
                    You represent and warrant that you have the legal right to use any payment
                    method(s) employed by you in connection with any purchase.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
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
                      <Iconify icon="solar:copyright-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Intellectual Property</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    The website and its original content, features, and functionality are and will
                    remain the exclusive property of Mavidah and its licensors. The website is
                    protected by copyright, trademark, and other laws.
                  </Typography>

                  <Typography variant="body1">
                    Our trademarks and trade dress may not be used in connection with any product or
                    service without our prior written consent.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Disclaimer */}
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
                      <Iconify icon="solar:shield-warning-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Disclaimer</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    The materials on Mavidah's website are provided on an 'as is' basis. Mavidah
                    makes no warranties, expressed or implied, and hereby disclaims and negates all
                    other warranties including, without limitation, implied warranties or conditions
                    of merchantability, fitness for a particular purpose, or non-infringement of
                    intellectual property or other violation of rights.
                  </Typography>

                  <Typography variant="body1" paragraph>
                    Further, Mavidah does not warrant or make any representations concerning the
                    accuracy, likely results, or reliability of the use of the materials on its
                    website or otherwise relating to such materials or on any sites linked to this
                    site.
                  </Typography>

                  <Typography variant="body1">
                    The information on this website is for general informational purposes only and
                    should not be considered as professional advice. Always seek the advice of
                    qualified professionals regarding specific situations.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
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
                      <Iconify icon="solar:danger-triangle-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Limitation of Liability</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    In no event shall Mavidah or its suppliers be liable for any damages (including,
                    without limitation, damages for loss of data or profit, or due to business
                    interruption) arising out of the use or inability to use the materials on
                    Mavidah's website, even if Mavidah or a Mavidah authorized representative has
                    been notified orally or in writing of the possibility of such damage.
                  </Typography>

                  <Typography variant="body1">
                    Because some jurisdictions do not allow limitations on implied warranties, or
                    limitations of liability for consequential or incidental damages, these
                    limitations may not apply to you.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Governing Law */}
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
                      <Iconify icon="solar:scale-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Governing Law</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1">
                    These Terms shall be interpreted and governed by the laws of the jurisdiction in
                    which Mavidah operates, without regard to its conflict of law provisions. Our
                    failure to enforce any right or provision of these Terms will not be considered
                    a waiver of those rights.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
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
                      <Iconify icon="solar:refresh-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Changes to Terms</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    We reserve the right, at our sole discretion, to modify or replace these Terms
                    at any time. If a revision is material, we will try to provide at least 30 days
                    notice prior to any new terms taking effect.
                  </Typography>

                  <Typography variant="body1">
                    What constitutes a material change will be determined at our sole discretion. By
                    continuing to access or use our website after those revisions become effective,
                    you agree to be bound by the revised terms.
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
                <Typography variant="h5">Questions About These Terms?</Typography>
                <Typography variant="body1" color="text.secondary">
                  If you have any questions about these Terms of Service, please contact us.
                </Typography>
                <Typography variant="body2">
                  Email: <strong>{CONFIG.site.contactEmail}</strong>
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

