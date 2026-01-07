import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendNewsletterEmail } from 'src/lib/email/resend';
import { replaceLinksWithTracking, createTrackingPixel } from 'src/lib/newsletter/utils';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { newsletter_id, test_email, source_filter, variant_id } = await request.json();

    if (!newsletter_id) {
      return NextResponse.json(
        { error: 'Newsletter ID is required' },
        { status: 400 }
      );
    }

    // Get newsletter
    const { data: newsletter, error: newsletterError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletter_id)
      .single();

    if (newsletterError || !newsletter) {
      return NextResponse.json(
        { error: 'Newsletter not found' },
        { status: 404 }
      );
    }

    // If test email, send to single address
    if (test_email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(test_email)) {
        return NextResponse.json(
          { error: 'Invalid test email format' },
          { status: 400 }
        );
      }

      const result = await sendNewsletterEmail({
        to: test_email,
        subject: `[TEST] ${newsletter.subject}`,
        html: newsletter.content_html,
        preview_text: newsletter.preview_text,
        unsubscribeToken: null, // No unsubscribe for test emails
      });

      if (!result.success) {
        return NextResponse.json(
          { error: result.error || 'Failed to send test email' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Test email sent successfully' },
        { status: 200 }
      );
    }

    // Handle A/B testing - get variant if specified
    let contentHtml = newsletter.content_html;
    let subject = newsletter.subject;
    let previewText = newsletter.preview_text;

    if (variant_id) {
      const { data: variant } = await supabase
        .from('newsletter_variants')
        .select('*')
        .eq('id', variant_id)
        .single();

      if (variant) {
        if (variant.variant_type === 'subject') {
          subject = variant.subject;
        } else if (variant.variant_type === 'content') {
          contentHtml = variant.content_html;
          previewText = variant.preview_text;
        }
      }
    }

    // Get active subscribers with optional source filter
    let subscribersQuery = supabase
      .from('newsletter_subscribers')
      .select('id, email, name')
      .eq('status', 'subscribed');

    if (source_filter && source_filter !== 'all') {
      subscribersQuery = subscribersQuery.eq('source', source_filter);
    }

    const { data: subscribers, error: subscribersError } = await subscribersQuery;

    if (subscribersError) throw subscribersError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        { error: 'No active subscribers found' },
        { status: 400 }
      );
    }

    // Update newsletter status to 'sending'
    await supabase
      .from('newsletters')
      .update({
        status: 'sending',
        recipients_count: subscribers.length,
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsletter_id);

    // Create send records and send emails
    let sentCount = 0;
    let failedCount = 0;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3030';

    for (const subscriber of subscribers) {
      try {
        // Create send record
        const { data: sendRecord } = await supabase
          .from('newsletter_sends')
          .insert([
            {
              newsletter_id,
              subscriber_id: subscriber.id,
              email: subscriber.email,
              status: 'pending',
            },
          ])
          .select()
          .single();

        // Prepare unsubscribe URL
        const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

        // Replace links with tracking URLs
        let processedHtml = contentHtml;
        if (!test_email) {
          processedHtml = await replaceLinksWithTracking(contentHtml, newsletter_id, supabase);
        }

        // Create tracking pixel URL
        const trackingPixelUrl = createTrackingPixel(sendRecord.id, subscriber.email);

        // Send email
        const result = await sendNewsletterEmail({
          to: subscriber.email,
          subject,
          html: processedHtml,
          preview_text: previewText,
          unsubscribeUrl,
          trackingPixelUrl,
        });

        if (result.success) {
          // Update send record
          await supabase
            .from('newsletter_sends')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString(),
            })
            .eq('id', sendRecord.id);

          sentCount++;
        } else {
          await supabase
            .from('newsletter_sends')
            .update({
              status: 'failed',
              bounce_reason: result.error,
            })
            .eq('id', sendRecord.id);

          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    // Update newsletter with final status
    const finalStatus = failedCount === 0 ? 'sent' : sentCount > 0 ? 'sent' : 'failed';
    await supabase
      .from('newsletters')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        failed_count: failedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', newsletter_id);

    return NextResponse.json(
      {
        message: `Newsletter sent to ${sentCount} subscribers${failedCount > 0 ? ` (${failedCount} failed)` : ''}`,
        sent: sentCount,
        failed: failedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter send error:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}

