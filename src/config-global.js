import { paths } from 'src/routes/paths';

import packageJson from '../package.json';

// ----------------------------------------------------------------------

export const CONFIG = {
  site: {
    name: 'Mavidah',
    serverUrl: process.env.NEXT_PUBLIC_SERVER_URL ?? '',
    assetURL: process.env.NEXT_PUBLIC_ASSET_URL ?? '',
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
    version: packageJson.version,
    contactEmail: 'contact@mavidah.com',
  },
  isStaticExport: JSON.parse(`${process.env.BUILD_STATIC_EXPORT}`),
  /**
   * Auth
   * @method supabase | jwt
   */
  auth: {
    method: 'supabase',
    skip: false,
    redirectPath: paths.dashboard.root,
  },
  /**
   * Supabase
   */
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
  },
};

// Helper function to get the canonical site URL for links and auth redirects
export const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return CONFIG.site.serverUrl.replace(/\/$/, '') || 'https://www.mavidah.com';
};

export const getAuthRedirectUrl = (path) => `${getSiteUrl()}${path}`;

// Helper function to get default Open Graph image URL for social sharing
export const getDefaultOgImage = () => {
  const siteUrl = getSiteUrl() || 'https://www.mavidah.com';
  return `${siteUrl}/logo/og-image.jpeg`;
};
