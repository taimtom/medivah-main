import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { product_id, customer_email, amount, paystack_reference } = await request.json();

    if (!product_id || !customer_email || !amount || !paystack_reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order in database
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          product_id,
          customer_email,
          amount,
          paystack_reference,
          status: 'completed',
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Auto-subscribe customer to newsletter
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
            source: 'purchase',
            unsubscribed_at: null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else if (existing.status === 'subscribed') {
        // Update source if already subscribed
        await supabase
          .from('newsletter_subscribers')
          .update({
            source: 'purchase',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }
    } catch (newsletterError) {
      // Don't fail order creation if newsletter subscription fails
      console.error('Newsletter auto-subscribe error:', newsletterError);
    }

    return NextResponse.json(
      { message: 'Order created successfully', order: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}


