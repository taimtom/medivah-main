import { CONFIG } from 'src/config-global';

import { JobDetailView } from 'src/sections/jobs/job-detail-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Job Details - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <JobDetailView jobId={params.id} />;
}
