import { CONFIG } from 'src/config-global';

import { ProductListView } from 'src/sections/dashboard/products';

// ----------------------------------------------------------------------

export const metadata = { title: `Product Management - ${CONFIG.site.name}` };

export default function Page() {
  return <ProductListView />;
}


