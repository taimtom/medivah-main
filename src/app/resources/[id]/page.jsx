import { CONFIG } from 'src/config-global';

import { ProductDetailView } from 'src/sections/resources/product-detail-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Product Details - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <ProductDetailView productId={params.id} />;
}


