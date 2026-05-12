import { CONFIG } from 'src/config-global';

import { createServerClient } from 'src/lib/supabase/server';

import { ProductDetailView } from 'src/sections/resources/product-detail-view';

// ----------------------------------------------------------------------

export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    const supabase = createServerClient();
    const { data: product } = await supabase
      .from('products')
      .select('name, description, image_url, price, category, is_free')
      .eq('id', id)
      .eq('published', true)
      .single();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || CONFIG.site.serverUrl || 'https://www.mavidah.com';
    const defaultOgImage = `${siteUrl}/logo/og-image.jpeg`;

    if (!product) {
      return {
        title: `Product Details - ${CONFIG.site.name}`,
        description: 'Discover valuable HR resources and digital products at Mavidah.',
        openGraph: {
          title: `Product Details - ${CONFIG.site.name}`,
          description: 'Discover valuable HR resources and digital products at Mavidah.',
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

    const priceText = product.is_free ? 'Free' : `₦${parseFloat(product.price).toLocaleString('en-NG')}`;
    const title = `${product.name} - ${priceText} | ${CONFIG.site.name}`;
    const description = product.description 
      ? `${product.description.substring(0, 155)}...` 
      : `Get ${product.name} - ${product.category} resource from ${CONFIG.site.name}. ${priceText}.`;
    
    const image = product.image_url || defaultOgImage;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${siteUrl}/resources/${id}`,
        siteName: CONFIG.site.name,
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        locale: 'en_US',
        type: 'website',
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
      title: `Product Details - ${CONFIG.site.name}`,
      description: 'Discover valuable HR resources and digital products at Mavidah.',
      openGraph: {
        title: `Product Details - ${CONFIG.site.name}`,
        description: 'Discover valuable HR resources and digital products at Mavidah.',
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
  return <ProductDetailView productId={params.id} />;
}


