import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { requireAdminActorId } from 'src/lib/require-admin';

const ROLLOUT_KEY = 'applicant_rollout_control';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', ROLLOUT_KEY)
      .maybeSingle();
    if (error) throw error;

    const value = data?.value || { enabled: true, pilot_only: false, pilot_member_ids: [] };
    const isPilotUser = Array.isArray(value.pilot_member_ids) ? value.pilot_member_ids.includes(userId) : false;
    const enabled = Boolean(value.enabled) && (!value.pilot_only || isPilotUser);

    return NextResponse.json({ enabled }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to evaluate rollout' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const adminId = await requireAdminActorId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await request.json();
    const supabase = createServerClient();

    await supabase
      .from('platform_settings')
      .upsert(
        [
          {
            key: ROLLOUT_KEY,
            value: {
              enabled: payload.enabled ?? true,
              pilot_only: payload.pilot_only ?? false,
              pilot_member_ids: payload.pilot_member_ids || [],
            },
          },
        ],
        { onConflict: 'key' }
      );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update rollout control' }, { status: 500 });
  }
}
