import { CONFIG, getDefaultOgImage } from 'src/config-global';

import { ResourcesListView } from 'src/sections/resources/resources-list-view';

// ----------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
const defaultOgImage = getDefaultOgImage();

export const metadata = {
  title: `Resources - ${CONFIG.site.name}`,
  openGraph: {
    title: `Resources - ${CONFIG.site.name}`,
    description: 'Discover valuable HR resources and digital products at Mavidah.',
    url: `${siteUrl}/resources`,
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
  return <ResourcesListView />;
}


