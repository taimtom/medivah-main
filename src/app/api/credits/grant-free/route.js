import { NextResponse } from 'next/server';

import { getRequestUser } from 'src/lib/request-user';
import { createServerClient } from 'src/lib/supabase';
import { grantSignupFreeCredits, grantMonthlyFreeCredits } from 'src/lib/wallet';

export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await request.json();
    if (type !== 'signup' && type !== 'monthly') {
      return NextResponse.json({ error: 'type must be signup or monthly' }, { status: 400 });
    }

    const supabase = createServerClient();

    if (type === 'signup') {
      const { data: profile } = await supabase
        .from('member_profiles')
        .select('business_role')
        .eq('user_id', user.id)
        .maybeSingle();

      const role = profile?.business_role || user.user_metadata?.business_role;
      if (role === 'applicant') {
        return NextResponse.json({ skipped: true, reason: 'applicants_do_not_receive_job_post_credits' });
      }

      const result = await grantSignupFreeCredits(supabase, user.id);
      return NextResponse.json(result);
    }

    const result = await grantMonthlyFreeCredits(supabase, user.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to grant credits' }, { status: 500 });
  }
}
