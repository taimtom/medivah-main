import { CONFIG } from 'src/config-global';

import { createServerClient } from 'src/lib/supabase/server';

import { BlogPostView } from 'src/sections/blog/blog-post-view';

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  try {
    const supabase = createServerClient();
    const { data: blog } = await supabase
      .from('blogs')
      .select('title, excerpt, featured_image')
      .eq('slug', slug)
      .eq('published', true)
      .single();

    if (!blog) {
      return {
        title: `Blog Post - ${CONFIG.site.name}`,
        description: CONFIG.site.description || 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
      };
    }

    const title = `${blog.title} | ${CONFIG.site.name}`;
    const description = blog.excerpt || 'Your trusted hub for HR knowledge, career guidance, and workplace insights.';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
    
    // Use featured image if available, otherwise use default Open Graph image
    const defaultOgImage = `${siteUrl}/logo/og-image.jpeg`;
    
    // Ensure image URL is absolute
    let image = blog.featured_image || defaultOgImage;
    if (image && !image.startsWith('http')) {
      image = image.startsWith('/') ? `${siteUrl}${image}` : `${siteUrl}/${image}`;
    }

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/blog/${slug}`,
        siteName: CONFIG.site.name,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `Blog Post - ${CONFIG.site.name}`,
      description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
    };
  }
}

export default function Page({ params }) {
  return <BlogPostView slug={params.slug} />;
}


