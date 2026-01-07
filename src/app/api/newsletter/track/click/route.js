import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const linkId = searchParams.get('link');
    const email = searchParams.get('email');
    const sendId = searchParams.get('send');

    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 });
    }

    // Get the original URL by link ID (UUID)
    const { data: link, error: linkError } = await supabase
      .from('newsletter_links')
      .select('id, original_url, newsletter_id')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    // Record the click
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || '';
    const forwarded = headersList.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : headersList.get('x-real-ip') || '';

    // Get subscriber ID if email provided
    let subscriberId = null;
    if (email) {
      const { data: subscriber } = await supabase
        .from('newsletter_subscribers')
        .select('id')
        .eq('email', email.toLowerCase())
        .single();
      subscriberId = subscriber?.id || null;
    }

    // Check if this is a unique click
    const { data: existingClick } = await supabase
      .from('newsletter_link_clicks')
      .select('id')
      .eq('link_id', linkId)
      .eq('email', email || '')
      .single();

    const isUniqueClick = !existingClick;

    // Insert click record
    const { error: clickError } = await supabase.from('newsletter_link_clicks').insert([
      {
        link_id: linkId,
        send_id: sendId || null,
        subscriber_id: subscriberId,
        email: email || null,
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    ]);

    if (!clickError) {
      // Get current counts and increment
      const { data: currentLink } = await supabase
        .from('newsletter_links')
        .select('click_count, unique_click_count')
        .eq('id', linkId)
        .single();

      if (currentLink) {
        await supabase
          .from('newsletter_links')
          .update({ click_count: (currentLink.click_count || 0) + 1 })
          .eq('id', linkId);

        if (isUniqueClick) {
          await supabase
            .from('newsletter_links')
            .update({ unique_click_count: (currentLink.unique_click_count || 0) + 1 })
            .eq('id', linkId);
        }
      }

      // Update newsletter clicked_count if sendId provided
      if (sendId) {
        const { data: sendRecord } = await supabase
          .from('newsletter_sends')
          .select('newsletter_id, status')
          .eq('id', sendId)
          .single();

        if (sendRecord && sendRecord.status !== 'clicked') {
          await supabase
            .from('newsletter_sends')
            .update({ status: 'clicked', clicked_at: new Date().toISOString() })
            .eq('id', sendId);

          // Get and update newsletter clicked_count
          const { data: newsletter } = await supabase
            .from('newsletters')
            .select('clicked_count')
            .eq('id', sendRecord.newsletter_id)
            .single();

          if (newsletter) {
            await supabase
              .from('newsletters')
              .update({ clicked_count: (newsletter.clicked_count || 0) + 1 })
              .eq('id', sendRecord.newsletter_id);
          }
        }
      }
    }

    // Redirect to original URL
    return NextResponse.redirect(link.original_url);
  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 });
  }
}

