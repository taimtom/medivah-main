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

export function PrivacyView() {
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
                <Iconify icon="solar:shield-check-bold-duotone" width={48} />
              </Box>

              <Typography variant="h2">Privacy Policy</Typography>

              <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                Your privacy is important to us. This policy explains how we collect, use, and protect
                your personal information.
              </Typography>
            </Stack>
          </Container>
        </Box>

        {/* Content */}
        <Container maxWidth="md" sx={{ py: { xs: 5, md: 8 } }}>
          <Stack spacing={4}>
            {/* Introduction */}
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
                      <Iconify icon="solar:document-text-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Introduction</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    At Mavidah, we are committed to protecting your privacy and ensuring the security
                    of your personal information. This Privacy Policy explains how we collect, use,
                    disclose, and safeguard your information when you visit our website or use our
                    services.
                  </Typography>

                  <Typography variant="body1">
                    By using our website, you consent to the data practices described in this policy.
                    If you do not agree with the practices described in this policy, please do not
                    use our website.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Information We Collect */}
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
                      <Iconify icon="solar:database-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Information We Collect</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="h6" sx={{ mt: 1 }}>Personal Information</Typography>
                  <Typography variant="body1" paragraph>
                    We may collect personal information that you voluntarily provide to us when you:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body1" component="span">
                        Register for an account or create a profile
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Subscribe to our newsletter or mailing list
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Make a purchase or transaction
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Contact us through our contact form or email
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Post comments or engage with our content
                      </Typography>
                    </li>
                  </Box>

                  <Typography variant="h6" sx={{ mt: 2 }}>Automatically Collected Information</Typography>
                  <Typography variant="body1" paragraph>
                    When you visit our website, we may automatically collect certain information
                    about your device and browsing behavior, including:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body1" component="span">
                        IP address and location data
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Browser type and version
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Pages visited and time spent on pages
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Referring website addresses
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        Cookies and similar tracking technologies
                      </Typography>
                    </li>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
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
                      <Iconify icon="solar:settings-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">How We Use Your Information</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    We use the information we collect for various purposes, including:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body1" component="span">
                        To provide, maintain, and improve our services
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To process transactions and send related information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To send you newsletters, marketing communications, and updates (with your
                        consent)
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To respond to your comments, questions, and requests
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To monitor and analyze usage patterns and trends
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To detect, prevent, and address technical issues and security threats
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        To comply with legal obligations and enforce our terms of service
                      </Typography>
                    </li>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Information Sharing and Disclosure */}
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
                      <Iconify icon="solar:users-group-rounded-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Information Sharing and Disclosure</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    We do not sell, trade, or rent your personal information to third parties.
                    However, we may share your information in the following circumstances:
                  </Typography>

                  <Typography variant="h6">Service Providers</Typography>
                  <Typography variant="body1" paragraph>
                    We may share your information with third-party service providers who perform
                    services on our behalf, such as payment processing, email delivery, hosting, and
                    analytics. These service providers are contractually obligated to protect your
                    information and use it only for the purposes we specify.
                  </Typography>

                  <Typography variant="h6">Legal Requirements</Typography>
                  <Typography variant="body1" paragraph>
                    We may disclose your information if required by law or in response to valid
                    requests by public authorities (e.g., a court or government agency).
                  </Typography>

                  <Typography variant="h6">Business Transfers</Typography>
                  <Typography variant="body1">
                    In the event of a merger, acquisition, or sale of assets, your information may be
                    transferred to the acquiring entity.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Data Security */}
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
                      <Iconify icon="solar:lock-password-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Data Security</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    We implement appropriate technical and organizational security measures to protect
                    your personal information against unauthorized access, alteration, disclosure, or
                    destruction. However, no method of transmission over the Internet or electronic
                    storage is 100% secure, and we cannot guarantee absolute security.
                  </Typography>

                  <Typography variant="body1">
                    We use industry-standard encryption technologies and secure servers to protect
                    your data. You are responsible for maintaining the confidentiality of your
                    account credentials.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Your Rights */}
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
                      <Iconify icon="solar:user-check-rounded-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Your Rights</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    Depending on your location, you may have certain rights regarding your personal
                    information, including:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    <li>
                      <Typography variant="body1" component="span">
                        The right to access and receive a copy of your personal data
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        The right to rectify inaccurate or incomplete information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        The right to request deletion of your personal data
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        The right to object to or restrict processing of your data
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        The right to data portability
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" component="span">
                        The right to withdraw consent at any time
                      </Typography>
                    </li>
                  </Box>

                  <Typography variant="body1" sx={{ mt: 2 }}>
                    To exercise these rights, please contact us at{' '}
                    <strong>{CONFIG.site.contactEmail}</strong>.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Cookies */}
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
                      <Iconify icon="solar:cookie-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Cookies and Tracking Technologies</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    We use cookies and similar tracking technologies to track activity on our website
                    and store certain information. Cookies are small data files stored on your device.
                    You can instruct your browser to refuse all cookies or to indicate when a cookie
                    is being sent.
                  </Typography>

                  <Typography variant="body1">
                    We use cookies for essential website functions, analytics, and to improve your
                    user experience. You can manage your cookie preferences through your browser
                    settings.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
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
                      <Iconify icon="solar:heart-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Children's Privacy</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1">
                    Our website is not intended for children under the age of 13. We do not
                    knowingly collect personal information from children under 13. If you believe
                    we have collected information from a child under 13, please contact us
                    immediately, and we will take steps to delete such information.
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* Changes to This Policy */}
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
                      <Iconify icon="solar:refresh-bold-duotone" width={28} />
                    </Box>
                    <Typography variant="h4">Changes to This Privacy Policy</Typography>
                  </Stack>

                  <Divider />

                  <Typography variant="body1" paragraph>
                    We may update this Privacy Policy from time to time. We will notify you of any
                    changes by posting the new Privacy Policy on this page and updating the "Last
                    Updated" date.
                  </Typography>

                  <Typography variant="body1">
                    You are advised to review this Privacy Policy periodically for any changes.
                    Changes to this Privacy Policy are effective when they are posted on this page.
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
                <Typography variant="h5">Questions About Our Privacy Policy?</Typography>
                <Typography variant="body1" color="text.secondary">
                  If you have any questions about this Privacy Policy or our data practices, please
                  contact us.
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

