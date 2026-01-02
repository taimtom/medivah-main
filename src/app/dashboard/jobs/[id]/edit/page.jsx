import { CONFIG } from 'src/config-global';

import { JobFormView } from 'src/sections/dashboard/jobs';

// ----------------------------------------------------------------------

export const metadata = { title: `Edit Job - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <JobFormView id={params.id} />;
}


