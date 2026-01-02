import { CONFIG } from 'src/config-global';

import { ContactView } from 'src/sections/contact/contact-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Contact - ${CONFIG.site.name}` };

export default function Page() {
  return <ContactView />;
}


