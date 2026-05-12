import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';
import { grantCreditAllotment } from 'src/lib/wallet';

async function verifyPaystackAmount(reference, expectedAmountKobo) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) {
    throw new Error('Paystack is not configured');
  }
  const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
    },
  });
  const data = await res.json();
  if (!res.ok || data?.data?.status !== 'success') {
    throw new Error(data?.message || 'Paystack verification failed');
  }
  const paidKobo = Number(data?.data?.amount);
  if (Number.isFinite(expectedAmountKobo) && paidKobo !== expectedAmountKobo) {
    throw new Error('Payment amount does not match selected pack');
  }
  return data;
}

function addValidityMonths(isoStart, months) {
  const d = new Date(isoStart);
  d.setUTCMonth(d.getUTCMonth() + Number(months || 0));
  return d.toISOString();
}

export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const body = await request.json();
    const {
      package_id: packageId,
      slug: packageSlug,
      paystack_reference: paystackReference,
      idempotency_key: idempotencyKey,
    } = body;

    if (!paystackReference) {
      return NextResponse.json(
        { error: 'paystack_reference is required' },
        { status: 400 }
      );
    }

    if (!packageId && !packageSlug) {
      return NextResponse.json({ error: 'package_id or slug is required' }, { status: 400 });
    }

    let query = supabase.from('credit_packages').select('*').eq('active', true);
    query = packageId ? query.eq('id', packageId) : query.eq('slug', packageSlug);
    const { data: pack, error: packError } = await query.maybeSingle();

    if (packError) throw packError;
    if (!pack) {
      return NextResponse.json({ error: 'Unknown or inactive credit pack' }, { status: 400 });
    }

    const nairaPrice = Number(pack.naira_price);
    const expectedKobo = Math.round(nairaPrice * 100);
    await verifyPaystackAmount(paystackReference, expectedKobo);

    const memberId = user.id;

    const { data: paymentEvent } = await supabase
      .from('payment_events')
      .upsert(
        {
          provider: 'paystack',
          event_type: 'credit_purchase',
          provider_reference: paystackReference,
          payload: {
            package_id: pack.id,
            slug: pack.slug,
            credits: pack.credits,
            amount: nairaPrice,
            memberId,
          },
          status: 'received',
        },
        { onConflict: 'provider,provider_reference,event_type' }
      )
      .select('*')
      .single();

    const grantKey = idempotencyKey || `pack-purchase-${paystackReference}`;
    const expiresAt = addValidityMonths(new Date().toISOString(), pack.validity_months);

    const result = await grantCreditAllotment({
      supabaseClient: supabase,
      memberId,
      allotmentType: 'pack_purchase',
      packageId: pack.id,
      credits: Number(pack.credits),
      expiresAt,
      idempotencyKey: grantKey,
      metadata: {
        paystack_reference: paystackReference,
        package_slug: pack.slug,
        naira_price: nairaPrice,
      },
    });

    await supabase
      .from('payment_events')
      .update({ status: 'processed', processed_at: new Date().toISOString() })
      .eq('id', paymentEvent?.id);

    return NextResponse.json(
      {
        message: 'Credits purchased successfully',
        wallet: result.wallet,
        allotment: result.allotment,
        transaction: result.transaction,
        alreadyGranted: result.alreadyGranted,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to purchase credits' },
      { status: 500 }
    );
  }
}
