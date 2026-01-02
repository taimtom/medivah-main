import { CONFIG } from 'src/config-global';

import { ProductFormView } from 'src/sections/dashboard/products';

// ----------------------------------------------------------------------

export const metadata = { title: `Edit Product - ${CONFIG.site.name}` };

export default function Page({ params }) {
  return <ProductFormView id={params.id} />;
}


