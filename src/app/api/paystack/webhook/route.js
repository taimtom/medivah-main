import crypto from 'crypto';
import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';

function verifySignature(rawBody, signature) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const hash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');
  return hash === signature;
}

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const reference = payload?.data?.reference;
    const eventType = payload?.event || 'unknown';

    if (!reference) {
      return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
    }

    const supabase = createServerClient();

    await supabase.from('payment_events').upsert(
      [
        {
          provider: 'paystack',
          event_type: eventType,
          provider_reference: reference,
          payload,
          status: 'processed',
          processed_at: new Date().toISOString(),
        },
      ],
      { onConflict: 'provider,provider_reference,event_type' }
    );

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to process webhook' },
      { status: 500 }
    );
  }
}
