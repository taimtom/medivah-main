import { CONFIG } from 'src/config-global';

import { JobListView } from 'src/sections/dashboard/jobs';

// ----------------------------------------------------------------------

export const metadata = { title: `Job Management - ${CONFIG.site.name}` };

export default function Page() {
  return <JobListView />;
}


