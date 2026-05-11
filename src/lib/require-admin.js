import { createServerClient } from 'src/lib/supabase';

/**
 * Verifies that the request carries a known admin user ID.
 * Since this project uses the service-role client (no cookie auth), we verify
 * the supplied user_id against member_profiles on the server side.
 * Pass the user ID via the `x-actor-id` header.
 *
 * Returns the verified admin user ID string, or null if verification fails.
 */
export async function requireAdminActorId(request) {
  const actorId = request.headers.get('x-actor-id');
  if (!actorId) return null;

  const supabase = createServerClient();
  const { data } = await supabase
    .from('member_profiles')
    .select('user_id, business_role')
    .eq('user_id', actorId)
    .maybeSingle();

  if (data?.business_role !== 'admin') return null;
  return actorId;
}
