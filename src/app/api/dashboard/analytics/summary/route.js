import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'member';
    const memberId = searchParams.get('memberId');

    if (role !== 'admin' && !memberId) {
      return NextResponse.json(
        { error: 'memberId is required for non-admin role' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    const { data, error } = await supabase.rpc('get_dashboard_analytics', {
      p_role: role,
      p_member_id: memberId ?? null,
    });

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to load analytics summary' },
      { status: 500 }
    );
  }
}
