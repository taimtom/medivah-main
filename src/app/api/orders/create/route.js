import { NextResponse } from 'next/server';
import { sendOrderConfirmationEmail } from 'src/lib/email/resend';
import { computeCommissionSplit } from 'src/lib/financial-config';
import { createServerClient } from 'src/lib/supabase';

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

    const { data: productMeta } = await supabase
      .from('products')
      .select('id, name, file_url, member_id')
      .eq('id', product_id)
      .single();

    const split = computeCommissionSplit(amount);

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

    // Get product details and generate signed URL for download
    let downloadUrl = null;
    try {
        const product = productMeta;
      const productError = null;

      if (!productError && product && product.file_url) {
        if (product.file_url.startsWith('products/')) {
          // Generate signed URL valid for 7 days
          const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('products')
            .createSignedUrl(product.file_url, 60 * 60 * 24 * 7);

          if (!urlError && signedUrlData) {
            downloadUrl = signedUrlData.signedUrl;
          }
        } else {
          // Legacy support: if it's already a full URL, use it as-is
          downloadUrl = product.file_url;
        }
      }

      // Send order confirmation email with download link
      if (product && downloadUrl) {
        const emailResult = await sendOrderConfirmationEmail({
          customerEmail: customer_email,
          customerName: customer_email.split('@')[0], // Use email username as fallback
          productName: product.name,
          amount,
          downloadLink: downloadUrl,
        });

        if (!emailResult.success) {
          console.error('Email sending error:', emailResult.error);
          // Don't fail order creation if email fails
        }
      }
    } catch (downloadError) {
      // Don't fail order creation if download URL generation fails
      console.error('Download URL generation error:', downloadError);
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


