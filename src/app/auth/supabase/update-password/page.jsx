import { CONFIG } from 'src/config-global';

import { SupabaseUpdatePasswordView } from 'src/sections/auth/supabase/supabase-update-password-view';

export const metadata = { title: `Update Password | ${CONFIG.site.name}` };

export default function Page() {
  return <SupabaseUpdatePasswordView />;
}
