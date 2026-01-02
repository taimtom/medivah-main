import { CONFIG } from 'src/config-global';

import { BlogFormView } from 'src/sections/dashboard/blog';

// ----------------------------------------------------------------------

export const metadata = { title: `New Blog - ${CONFIG.site.name}` };

export default function Page() {
  return <BlogFormView />;
}


