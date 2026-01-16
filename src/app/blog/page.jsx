import { CONFIG, getDefaultOgImage } from 'src/config-global';

import { BlogListView } from 'src/sections/blog/blog-list-view';

// ----------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
const defaultOgImage = getDefaultOgImage();

export const metadata = {
  title: `Blog - ${CONFIG.site.name}`,
  openGraph: {
    title: `Blog - ${CONFIG.site.name}`,
    description: 'Read the latest HR insights, career tips, and workplace guidance from Mavidah.',
    url: `${siteUrl}/blog`,
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
  return <BlogListView />;
}


