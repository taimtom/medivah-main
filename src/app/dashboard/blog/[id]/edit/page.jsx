import { CONFIG } from 'src/config-global';

import { BlogFormView } from 'src/sections/dashboard/blog';

// ----------------------------------------------------------------------

export const metadata = { title: `Edit Blog - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <BlogFormView id={params.id} />;
}


