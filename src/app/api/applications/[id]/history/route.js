import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';

export async function GET(_request, { params }) {
  try {
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
