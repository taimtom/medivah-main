import { CONFIG } from 'src/config-global';

import { BlogListView } from 'src/sections/blog/blog-list-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Blog - ${CONFIG.site.name}` };

export default function Page() {
  return <BlogListView />;
}


