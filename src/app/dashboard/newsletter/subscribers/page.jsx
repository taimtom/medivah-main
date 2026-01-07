import { CONFIG } from 'src/config-global';

import { NewsletterSubscribersView } from 'src/sections/dashboard/newsletter';

// ----------------------------------------------------------------------

export const metadata = { title: `Newsletter Subscribers - ${CONFIG.site.name}` };

export default function Page() {
  return <NewsletterSubscribersView />;
}

