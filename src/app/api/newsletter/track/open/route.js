import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const sendId = searchParams.get('send');

    if (!email || !sendId) {
      // Return transparent 1x1 pixel
      const pixel = Buffer.from(
        'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        'base64'
      );
      return new NextResponse(pixel, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }

    // Update send record to 'opened'
    const { data: sendRecord } = await supabase
      .from('newsletter_sends')
      .select('newsletter_id, status')
      .eq('id', sendId)
      .single();

    if (sendRecord && sendRecord.status !== 'opened' && sendRecord.status !== 'clicked') {
      await supabase
        .from('newsletter_sends')
        .update({ status: 'opened', opened_at: new Date().toISOString() })
        .eq('id', sendId);

      // Update newsletter opened_count
      const { data: newsletter } = await supabase
        .from('newsletters')
        .select('opened_count')
        .eq('id', sendRecord.newsletter_id)
        .single();

      if (newsletter) {
        await supabase
          .from('newsletters')
          .update({ opened_count: (newsletter.opened_count || 0) + 1 })
          .eq('id', sendRecord.newsletter_id);
      }
    }

    // Return transparent 1x1 pixel
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Open tracking error:', error);
    // Still return pixel even on error
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );
    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  }
}

