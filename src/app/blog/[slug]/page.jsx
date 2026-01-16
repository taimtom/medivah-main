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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
    const defaultOgImage = `${siteUrl}/logo/og-image.jpeg`;

    if (!blog) {
      return {
        title: `Blog Post - ${CONFIG.site.name}`,
        description: CONFIG.site.description || 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
        openGraph: {
          title: `Blog Post - ${CONFIG.site.name}`,
          description: CONFIG.site.description || 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
          images: [
            {
              url: defaultOgImage,
              width: 1200,
              height: 630,
              alt: 'Mavidah - HR Knowledge Hub',
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          images: [defaultOgImage],
        },
      };
    }

    const title = `${blog.title} | ${CONFIG.site.name}`;
    const description = blog.excerpt || 'Your trusted hub for HR knowledge, career guidance, and workplace insights.';
    
    // Always use the default Open Graph image for consistent social sharing
    const image = defaultOgImage;

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
    const defaultOgImage = `${siteUrl}/logo/og-image.jpeg`;
    return {
      title: `Blog Post - ${CONFIG.site.name}`,
      description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
      openGraph: {
        title: `Blog Post - ${CONFIG.site.name}`,
        description: 'Your trusted hub for HR knowledge, career guidance, and workplace insights.',
        images: [
          {
            url: defaultOgImage,
            width: 1200,
            height: 630,
            alt: 'Mavidah - HR Knowledge Hub',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        images: [defaultOgImage],
      },
    };
  }
}

export default function Page({ params }) {
  return <BlogPostView slug={params.slug} />;
}


