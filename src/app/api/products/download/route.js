import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/**
 * Generate a signed URL for product file download
 * POST /api/products/download
 * Body: { file_path: "products/filename.zip", expires_in: 3600 (optional, default 7 days) }
 */
export async function POST(request) {
  try {
    const { file_path, expires_in } = await request.json();

    if (!file_path) {
      return NextResponse.json(
        { error: 'File path is required' },
        { status: 400 }
      );
    }

    // Validate file path format (should start with 'products/')
    if (!file_path.startsWith('products/')) {
      return NextResponse.json(
        { error: 'Invalid file path format. Must start with "products/"' },
        { status: 400 }
      );
    }

    // Default to 7 days (604800 seconds)
    const expiration = expires_in || 60 * 60 * 24 * 7;

    // Generate signed URL
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
