import { CONFIG } from 'src/config-global';

import { JobsListView } from 'src/sections/jobs/jobs-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Jobs - ${CONFIG.site.name}` };

export default function Page() {
  return <JobsListView />;
}


