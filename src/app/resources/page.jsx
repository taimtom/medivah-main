import { CONFIG } from 'src/config-global';

import { ResourcesListView } from 'src/sections/resources/resources-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Resources - ${CONFIG.site.name}` };

export default function Page() {
  return <ResourcesListView />;
}


