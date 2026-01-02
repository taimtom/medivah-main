import { CONFIG } from 'src/config-global';

import { OrdersListView } from 'src/sections/dashboard/orders';

// ----------------------------------------------------------------------

export const metadata = { title: `Orders Management - ${CONFIG.site.name}` };

export default function Page() {
  return <OrdersListView />;
}


