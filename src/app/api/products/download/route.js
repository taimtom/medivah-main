import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';

/**
 * Generate a signed URL for product file download.
 * POST /api/products/download
 * Body: { file_path: "products/filename.zip", product_id: "uuid", expires_in?: number }
 * Requires: authenticated user who has a completed order for this product.
 */
export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_path, product_id, expires_in } = await request.json();

    if (!file_path || !product_id) {
      return NextResponse.json(
        { error: 'file_path and product_id are required' },
        { status: 400 }
      );
    }

    if (!file_path.startsWith('products/')) {
      return NextResponse.json(
        { error: 'Invalid file path format. Must start with "products/"' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify the user has a completed order for this product
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('product_id', product_id)
      .eq('customer_email', user.email)
      .eq('status', 'completed')
      .maybeSingle();

    if (!order) {
      return NextResponse.json(
        { error: 'No completed order found for this product' },
        { status: 403 }
      );
    }

    const expiration = expires_in || 60 * 60 * 24 * 7;

    const { data, error } = await supabase.storage
      .from('products')
      .createSignedUrl(file_path, expiration);

    if (error) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: 'Failed to generate download link' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        signed_url: data.signedUrl,
        expires_in: expiration,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Download URL generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate download URL' },
      { status: 500 }
    );
  }
}
