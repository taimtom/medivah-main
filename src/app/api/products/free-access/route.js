import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from 'src/lib/email/resend';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { product_id, customer_email, customer_name } = await request.json();

    if (!product_id || !customer_email) {
      return NextResponse.json(
        { error: 'Product ID and email are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get product
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('published', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (!product.is_free) {
      return NextResponse.json(
        { error: 'This product is not free' },
        { status: 400 }
      );
    }

    // Subscribe user to newsletter
    try {
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, status')
        .eq('email', customer_email.toLowerCase())
        .single();

      if (!existing) {
        // Create new subscriber
        await supabase.from('newsletter_subscribers').insert([
          {
            email: customer_email.toLowerCase(),
            name: customer_name || null,
            status: 'subscribed',
            source: 'purchase',
          },
        ]);
      } else if (existing.status === 'unsubscribed') {
        // Re-subscribe if previously unsubscribed
        await supabase
          .from('newsletter_subscribers')
          .update({
            status: 'subscribed',
            name: customer_name || existing.name || null,
            source: 'purchase',
            unsubscribed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else if (existing.status === 'subscribed') {
        // Update name and source if already subscribed
        await supabase
          .from('newsletter_subscribers')
          .update({
            name: customer_name || existing.name || null,
            source: 'purchase',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }
    } catch (newsletterError) {
      // Don't fail if newsletter subscription fails
      console.error('Newsletter subscription error:', newsletterError);
    }

    // Create a free order record (for tracking)
    try {
      await supabase.from('orders').insert([
        {
          product_id,
          customer_email: customer_email.toLowerCase(),
          customer_name: customer_name || null,
          amount: 0,
          paystack_reference: `FREE-${Date.now()}`,
          status: 'completed',
        },
      ]);
    } catch (orderError) {
      // Don't fail if order creation fails
      console.error('Order creation error:', orderError);
    }

    // Send email with download link
    if (product.file_url) {
      const emailResult = await sendOrderConfirmationEmail({
        customerEmail: customer_email,
        customerName: customer_name || 'Valued Customer',
        productName: product.name,
        amount: 0,
        downloadLink: product.file_url,
      });

      if (!emailResult.success) {
        console.error('Email sending error:', emailResult.error);
        // Still return success, but log the error
      }
    }

    return NextResponse.json(
      {
        message: 'Free access granted successfully',
        download_url: product.file_url || null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Free access error:', error);
    return NextResponse.json(
      { error: 'Failed to process free access' },
      { status: 500 }
    );
  }
}

