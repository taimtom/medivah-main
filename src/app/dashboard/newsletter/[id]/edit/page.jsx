import { CONFIG } from 'src/config-global';

import { NewsletterFormView } from 'src/sections/dashboard/newsletter';

// ----------------------------------------------------------------------

export const metadata = { title: `Edit Newsletter - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <NewsletterFormView id={params.id} />;
}

