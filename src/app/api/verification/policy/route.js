import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { requireAdminActorId } from 'src/lib/require-admin';

const MODE_KEY = 'verification_enforcement_mode';
const DEADLINE_KEY = 'verification_grace_deadline';

export async function GET() {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('key, value')
      .in('key', [MODE_KEY, DEADLINE_KEY]);
    if (error) throw error;

    const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
    return NextResponse.json(
      {
        mode: map[MODE_KEY]?.mode || 'grace_then_gate',
        deadline: map[DEADLINE_KEY]?.iso || null,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch policy' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const adminId = await requireAdminActorId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const payload = await request.json();
    const supabase = createServerClient();

    if (payload.mode) {
      await supabase
        .from('platform_settings')
        .upsert([{ key: MODE_KEY, value: { mode: payload.mode } }], { onConflict: 'key' });
    }

    if (payload.deadline) {
      await supabase
        .from('platform_settings')
        .upsert([{ key: DEADLINE_KEY, value: { iso: payload.deadline } }], { onConflict: 'key' });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update policy' }, { status: 500 });
  }
}
