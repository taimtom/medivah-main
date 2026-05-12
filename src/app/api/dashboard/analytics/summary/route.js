import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();

    const { data: profile } = await supabase
      .from('member_profiles')
      .select('business_role')
      .eq('user_id', user.id)
      .maybeSingle();

    const role = profile?.business_role || 'member';
    const memberId = role === 'admin' ? null : user.id;

    const { data, error } = await supabase.rpc('get_dashboard_analytics', {
      p_role: role,
      p_member_id: memberId,
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
