import { CONFIG } from 'src/config-global';

import { ProductFormView } from 'src/sections/dashboard/products';

// ----------------------------------------------------------------------

export const metadata = { title: `New Product - ${CONFIG.site.name}` };

export default function Page() {
  return <ProductFormView />;
}


