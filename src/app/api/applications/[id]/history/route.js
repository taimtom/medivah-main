import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';

export async function GET(request, { params }) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('application_status_history')
      .select('*')
      .eq('application_id', params.id)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ rows: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch history' }, { status: 500 });
  }
}
