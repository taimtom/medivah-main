import { CONFIG } from 'src/config-global';

import { NewsletterFormView } from 'src/sections/dashboard/newsletter';

// ----------------------------------------------------------------------

export const metadata = { title: `New Newsletter - ${CONFIG.site.name}` };

export default function Page() {
  return <NewsletterFormView />;
}

