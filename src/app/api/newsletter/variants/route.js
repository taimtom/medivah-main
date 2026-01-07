import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Get variants for a newsletter
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const newsletterId = searchParams.get('newsletter_id');

    if (!newsletterId) {
      return NextResponse.json({ error: 'Newsletter ID required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('newsletter_variants')
      .select('*')
      .eq('newsletter_id', newsletterId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ variants: data || [] }, { status: 200 });
  } catch (error) {
    console.error('Get variants error:', error);
    return NextResponse.json({ error: 'Failed to fetch variants' }, { status: 500 });
  }
}

// Create variant
export async function POST(request) {
  try {
    const { newsletter_id, variant_type, variant_name, subject, content_html, preview_text } = await request.json();

    if (!newsletter_id || !variant_type || !variant_name) {
      return NextResponse.json(
        { error: 'Newsletter ID, variant type, and variant name are required' },
        { status: 400 }
      );
    }

    if (variant_type === 'subject' && !subject) {
      return NextResponse.json({ error: 'Subject required for subject variant' }, { status: 400 });
    }

    if (variant_type === 'content' && !content_html) {
      return NextResponse.json({ error: 'Content HTML required for content variant' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('newsletter_variants')
      .insert([
        {
          newsletter_id,
          variant_type,
          variant_name,
          subject: subject || null,
          content_html: content_html || null,
          preview_text: preview_text || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Update newsletter to mark as A/B test
    await supabase
      .from('newsletters')
      .update({ is_ab_test: true })
      .eq('id', newsletter_id);

    return NextResponse.json({ message: 'Variant created successfully', variant: data }, { status: 201 });
  } catch (error) {
    console.error('Create variant error:', error);
    return NextResponse.json({ error: 'Failed to create variant' }, { status: 500 });
  }
}

// Update variant
export async function PUT(request) {
  try {
    const { id, variant_name, subject, content_html, preview_text } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Variant ID required' }, { status: 400 });
    }

    const updateData = {
      updated_at: new Date().toISOString(),
    };

    if (variant_name) updateData.variant_name = variant_name;
    if (subject !== undefined) updateData.subject = subject;
    if (content_html !== undefined) updateData.content_html = content_html;
    if (preview_text !== undefined) updateData.preview_text = preview_text;

    const { data, error } = await supabase.from('newsletter_variants').update(updateData).eq('id', id).select().single();

    if (error) throw error;

    return NextResponse.json({ message: 'Variant updated successfully', variant: data }, { status: 200 });
  } catch (error) {
    console.error('Update variant error:', error);
    return NextResponse.json({ error: 'Failed to update variant' }, { status: 500 });
  }
}

// Delete variant
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Variant ID required' }, { status: 400 });
    }

    const { error } = await supabase.from('newsletter_variants').delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Variant deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete variant error:', error);
    return NextResponse.json({ error: 'Failed to delete variant' }, { status: 500 });
  }
}

