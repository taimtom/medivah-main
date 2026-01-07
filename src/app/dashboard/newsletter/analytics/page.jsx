import { CONFIG } from 'src/config-global';

import { NewsletterAnalyticsView } from 'src/sections/dashboard/newsletter';

// ----------------------------------------------------------------------

export const metadata = { title: `Newsletter Analytics - ${CONFIG.site.name}` };

export default function Page() {
  return <NewsletterAnalyticsView />;
}

