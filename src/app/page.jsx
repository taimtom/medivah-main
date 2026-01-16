import { CONFIG, getDefaultOgImage } from 'src/config-global';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
const defaultOgImage = getDefaultOgImage();

export const metadata = {
  title: `Home - ${CONFIG.site.name}`,
  openGraph: {
    title: `Home - ${CONFIG.site.name}`,
    description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
    url: siteUrl,
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
  return <HomeView />;
}
