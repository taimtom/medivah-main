import { CONFIG } from 'src/config-global';

import { BlogListView } from 'src/sections/dashboard/blog/blog-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Blog Management - ${CONFIG.site.name}` };

export default function Page() {
  return <BlogListView />;
}


