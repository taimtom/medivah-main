import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread_only') === 'true';
    const limit = Number(searchParams.get('limit') || 50);

    const supabase = createServerClient();
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;
    if (error) throw error;

    const unreadCount = (data || []).filter((n) => !n.is_read).length;

    return NextResponse.json({ notifications: data || [], unreadCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const markAll = searchParams.get('mark_all') === 'true';

    const supabase = createServerClient();

    if (markAll) {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);
      if (error) throw error;
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const payload = await request.json().catch(() => ({}));
    if (!payload.id) {
      return NextResponse.json({ error: 'id or mark_all=true is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', payload.id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update notification' }, { status: 500 });
  }
}
