import { CONFIG } from 'src/config-global';

import { NewsletterListView } from 'src/sections/dashboard/newsletter';

// ----------------------------------------------------------------------

export const metadata = { title: `Newsletters - ${CONFIG.site.name}` };

export default function Page() {
  return <NewsletterListView />;
}

