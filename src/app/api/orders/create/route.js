import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from 'src/lib/email/resend';
import { computeCommissionSplit } from 'src/lib/financial-config';
import { createServerClient } from 'src/lib/supabase';

async function verifyPaystackTransaction(reference, expectedAmountNaira) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error('Paystack is not configured');

  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await res.json();

  if (!res.ok || data?.data?.status !== 'success') {
    throw new Error(data?.message || 'Paystack verification failed');
  }

  const paidKobo = Number(data?.data?.amount);
  const expectedKobo = Math.round(Number(expectedAmountNaira) * 100);
  if (paidKobo !== expectedKobo) {
    throw new Error('Payment amount does not match product price');
  }

  return data;
}

export async function POST(request) {
  const supabase = createServerClient();
  try {
    const { product_id, customer_email, amount, paystack_reference } = await request.json();

    if (!product_id || !customer_email || !amount || !paystack_reference) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: productMeta, error: productError } = await supabase
      .from('products')
      .select('id, name, file_url, member_id, price')
      .eq('id', product_id)
      .single();

    if (productError || !productMeta) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await verifyPaystackTransaction(paystack_reference, productMeta.price);

    const split = computeCommissionSplit(amount);

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          product_id,
          customer_email,
          amount,
          paystack_reference,
          status: 'completed',
          order_type: 'resource_purchase',
          resource_member_id: productMeta?.member_id || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    if (productMeta?.member_id) {
      const { data: splitRow, error: splitError } = await supabase
        .from('order_commission_splits')
        .insert([
          {
            order_id: data.id,
            member_id: productMeta.member_id,
            gross_amount: split.grossAmount,
            platform_commission_rate: Number(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_RATE || 0.2),
            platform_amount: split.platformAmount,
            member_amount: split.memberAmount,
            currency: 'NGN',
          },
        ])
        .select('*')
        .single();

      if (!splitError && splitRow) {
        await supabase.from('member_earnings_ledger').insert([
          {
            member_id: productMeta.member_id,
            order_id: data.id,
            commission_split_id: splitRow.id,
            amount: split.memberAmount,
            status: 'pending',
          },
        ]);
      }
    }

    // Auto-subscribe customer to newsletter
    try {
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, status')
        .eq('email', customer_email.toLowerCase())
        .single();

      if (!existing) {
        await supabase.from('newsletter_subscribers').insert([
          {
            email: customer_email.toLowerCase(),
            status: 'subscribed',
            source: 'purchase',
          },
        ]);
      } else if (existing.status === 'unsubscribed') {
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
        await supabase
          .from('newsletter_subscribers')
          .update({
            source: 'purchase',
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }
    } catch (newsletterError) {
      console.error('Newsletter auto-subscribe error:', newsletterError);
    }

    // Generate signed download URL and send confirmation email
    let downloadUrl = null;
    try {
      if (productMeta.file_url) {
        if (productMeta.file_url.startsWith('products/')) {
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('products')
            .createSignedUrl(productMeta.file_url, 60 * 60 * 24 * 7);

          if (!urlError && signedUrlData) {
            downloadUrl = signedUrlData.signedUrl;
          }
        } else {
          downloadUrl = productMeta.file_url;
        }
      }

      if (downloadUrl) {
        const emailResult = await sendOrderConfirmationEmail({
          customerEmail: customer_email,
          customerName: customer_email.split('@')[0],
          productName: productMeta.name,
          amount,
          downloadLink: downloadUrl,
        });

        if (!emailResult.success) {
          console.error('Email sending error:', emailResult.error);
        }
      }
    } catch (downloadError) {
      console.error('Download URL generation error:', downloadError);
    }

    return NextResponse.json(
      { message: 'Order created successfully', order: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
