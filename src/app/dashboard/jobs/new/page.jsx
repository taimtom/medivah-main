import { CONFIG } from 'src/config-global';

import { JobFormView } from 'src/sections/dashboard/jobs';

// ----------------------------------------------------------------------

export const metadata = { title: `New Job - ${CONFIG.site.name}` };

export default function Page() {
  return <JobFormView />;
}


