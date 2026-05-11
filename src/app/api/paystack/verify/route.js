import { NextResponse } from 'next/server';
import { createServerClient } from 'src/lib/supabase';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Reference is required' }, { status: 400 });
  }

  try {
    const supabase = createServerClient();
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Verification failed');
    }

    await supabase.from('payment_events').upsert(
      [
        {
          provider: 'paystack',
          event_type: 'verify',
          provider_reference: reference,
          payload: data,
          status: data?.data?.status === 'success' ? 'processed' : 'received',
          processed_at:
            data?.data?.status === 'success' ? new Date().toISOString() : null,
        },
      ],
      { onConflict: 'provider,provider_reference,event_type' }
    );

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Paystack verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}


