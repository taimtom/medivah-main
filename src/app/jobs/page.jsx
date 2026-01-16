import { CONFIG, getDefaultOgImage } from 'src/config-global';

import { JobsListView } from 'src/sections/jobs/jobs-list-view';

// ----------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
const defaultOgImage = getDefaultOgImage();

export const metadata = {
  title: `Jobs - ${CONFIG.site.name}`,
  openGraph: {
    title: `Jobs - ${CONFIG.site.name}`,
    description: 'Find the best HR and career opportunities at Mavidah.',
    url: `${siteUrl}/jobs`,
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
  return <JobsListView />;
}


