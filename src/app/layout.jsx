import 'src/global.css';

// ----------------------------------------------------------------------

import { CONFIG } from 'src/config-global';
import { primary } from 'src/theme/core/palette';
import { ThemeProvider } from 'src/theme/theme-provider';
import { getInitColorSchemeScript } from 'src/theme/color-scheme-script';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { detectSettings } from 'src/components/settings/server';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';
import { GoogleAnalyticsScript } from 'src/components/analytics/google-analytics-script';

import { AuthProvider as JwtAuthProvider } from 'src/auth/context/jwt';
import { AuthProvider as SupabaseAuthProvider } from 'src/auth/context/supabase';

// ----------------------------------------------------------------------

export const metadata = {
  title: {
    default: 'Mavidah - HR Knowledge Hub',
    template: '%s | Mavidah',
  },
  description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo/mavidah-logo.png', type: 'image/png' },
      { url: '/logo/mavidah-logo.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: '/logo/mavidah-logo.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mavidah.com',
    siteName: CONFIG.site.name,
    images: [
      {
        url: '/logo/mavidah-logo.png',
        width: 1200,
        height: 630,
        alt: 'Mavidah Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/logo/mavidah-logo.png'],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: primary.main,
};

export default async function RootLayout({ children }) {
  const settings = CONFIG.isStaticExport ? defaultSettings : await detectSettings();

  // Select auth provider based on config
  const AuthProvider = CONFIG.auth.method === 'supabase' ? SupabaseAuthProvider : JwtAuthProvider;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://js.paystack.co/v1/inline.js" async></script>
        {/* Favicon links for Google Search */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/logo/mavidah-logo.png" type="image/png" />
        <link rel="icon" href="/logo/mavidah-logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logo/mavidah-logo.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
        {/* Additional favicon formats for better compatibility */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body>
        {getInitColorSchemeScript}
        <GoogleAnalyticsScript />

        <AuthProvider>
          <SettingsProvider
            settings={settings}
            caches={CONFIG.isStaticExport ? 'localStorage' : 'cookie'}
          >
            <ThemeProvider>
              <MotionLazy>
                <ProgressBar />
                <SettingsDrawer />
                {children}
              </MotionLazy>
            </ThemeProvider>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
