import { CONFIG, getDefaultOgImage } from 'src/config-global';

import { AboutView } from 'src/sections/about/view';

// ----------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
const defaultOgImage = getDefaultOgImage();

export const metadata = {
  title: `About - ${CONFIG.site.name}`,
  openGraph: {
    title: `About - ${CONFIG.site.name}`,
    description: 'Learn more about Mavidah - Your trusted hub for HR knowledge, career guidance, and workplace insights.',
    url: `${siteUrl}/about`,
    siteName: CONFIG.site.name,
    images: [
      {
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: 'Mavidah - HR Knowledge Hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [defaultOgImage],
  },
};

export default function Page() {
  return <AboutView />;
}


