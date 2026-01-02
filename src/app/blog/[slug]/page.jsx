import { CONFIG } from 'src/config-global';

import { BlogPostView } from 'src/sections/blog/blog-post-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Blog Post - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <BlogPostView slug={params.slug} />;
}


