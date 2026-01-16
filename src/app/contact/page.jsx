import { CONFIG, getDefaultOgImage } from 'src/config-global';

import { ContactView } from 'src/sections/contact/contact-view';

// ----------------------------------------------------------------------

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
const defaultOgImage = getDefaultOgImage();

export const metadata = {
  title: `Contact - ${CONFIG.site.name}`,
  openGraph: {
    title: `Contact - ${CONFIG.site.name}`,
    description: 'Get in touch with Mavidah - Your trusted hub for HR knowledge, career guidance, and workplace insights.',
    url: `${siteUrl}/contact`,
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
  return <ContactView />;
}


