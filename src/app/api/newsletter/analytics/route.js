import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { requireAdminActorId } from 'src/lib/require-admin';

export async function GET(request) {
  try {
    const adminId = await requireAdminActorId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    const newsletterId = searchParams.get('newsletter_id');

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID required' }, { status: 400 });
    }

    const { data: newsletter } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single();

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    const { data: sends } = await supabase
      .from('newsletter_sends')
      .select('status', { count: 'exact' })
      .eq('newsletter_id', newsletterId);

    const statusCounts = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
    };

    sends?.forEach((send) => {
      if (statusCounts[send.status] !== undefined) {
        statusCounts[send.status]++;
      }
    });

    const { data: links } = await supabase
      .from('newsletter_links')
      .select('id, original_url, click_count, unique_click_count')
      .eq('newsletter_id', newsletterId)
      .order('click_count', { ascending: false })
      .limit(10);

    const sentCount = newsletter.recipients_count || 0;
    const openRate = sentCount > 0 ? ((newsletter.opened_count || 0) / sentCount) * 100 : 0;
    const clickRate = sentCount > 0 ? ((newsletter.clicked_count || 0) / sentCount) * 100 : 0;
    const clickToOpenRate =
      newsletter.opened_count > 0 ? ((newsletter.clicked_count || 0) / newsletter.opened_count) * 100 : 0;

    const { data: opensByDay } = await supabase
      .from('newsletter_sends')
      .select('opened_at')
      .eq('newsletter_id', newsletterId)
      .not('opened_at', 'is', null);

    const opensByDayMap = {};
    opensByDay?.forEach((send) => {
      const date = new Date(send.opened_at).toISOString().split('T')[0];
      opensByDayMap[date] = (opensByDayMap[date] || 0) + 1;
    });

    return NextResponse.json({
      newsletter: {
        id: newsletter.id,
        subject: newsletter.subject,
        sent_at: newsletter.sent_at,
        recipients_count: sentCount,
      },
      metrics: {
        sent: sentCount,
        opened: newsletter.opened_count || 0,
        clicked: newsletter.clicked_count || 0,
        bounced: newsletter.failed_count || 0,
        open_rate: Math.round(openRate * 100) / 100,
        click_rate: Math.round(clickRate * 100) / 100,
        click_to_open_rate: Math.round(clickToOpenRate * 100) / 100,
      },
      top_links: links || [],
      opens_over_time: opensByDayMap,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
