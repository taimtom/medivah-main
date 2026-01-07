import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * This endpoint should be called by a cron job service (e.g., Vercel Cron, GitHub Actions, etc.)
 * to check for scheduled newsletters and send them
 */
export async function GET(request) {
  try {
    // Verify cron secret if provided
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all newsletters scheduled for now or in the past
    const now = new Date().toISOString();
    const { data: scheduledNewsletters, error } = await supabase
      .from('newsletters')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now);

    if (error) throw error;

    if (!scheduledNewsletters || scheduledNewsletters.length === 0) {
      return NextResponse.json({ message: 'No newsletters to send', count: 0 });
    }

    const results = [];

    // Process each scheduled newsletter
    for (const newsletter of scheduledNewsletters) {
      try {
        // Trigger send by calling the send endpoint
        const sendResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030'}/api/newsletter/send`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            newsletter_id: newsletter.id,
          }),
        });

        const sendData = await sendResponse.json();

        results.push({
          newsletter_id: newsletter.id,
          subject: newsletter.subject,
          success: sendResponse.ok,
          result: sendData,
        });
      } catch (error) {
        console.error(`Error sending scheduled newsletter ${newsletter.id}:`, error);
        results.push({
          newsletter_id: newsletter.id,
          subject: newsletter.subject,
          success: false,
          error: error.message,
        });
      }
    }

    return NextResponse.json({
      message: `Processed ${scheduledNewsletters.length} scheduled newsletters`,
      count: scheduledNewsletters.length,
      results,
    });
  } catch (error) {
    console.error('Schedule check error:', error);
    return NextResponse.json({ error: 'Failed to check scheduled newsletters' }, { status: 500 });
  }
}

