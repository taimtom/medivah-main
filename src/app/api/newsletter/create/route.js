import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { subject, content_html, content_text, preview_text, scheduled_at } = await request.json();

    if (!subject || !content_html) {
      return NextResponse.json(
        { error: 'Subject and HTML content are required' },
        { status: 400 }
      );
    }

    const status = scheduled_at ? 'scheduled' : 'draft';

    const { data, error } = await supabase
      .from('newsletters')
      .insert([
        {
          subject,
          content_html,
          content_text: content_text || content_html.replace(/<[^>]*>/g, '').substring(0, 500),
          preview_text: preview_text || null,
          status,
          scheduled_at: scheduled_at || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: 'Newsletter created successfully', newsletter: data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create newsletter' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { id, subject, content_html, content_text, preview_text, scheduled_at, status } = await request.json();

    if (!id || !subject || !content_html) {
      return NextResponse.json(
        { error: 'ID, subject and HTML content are required' },
        { status: 400 }
      );
    }

    const updateData = {
      subject,
      content_html,
      content_text: content_text || content_html.replace(/<[^>]*>/g, '').substring(0, 500),
      preview_text: preview_text || null,
      updated_at: new Date().toISOString(),
    };

    if (scheduled_at !== undefined) {
      updateData.scheduled_at = scheduled_at;
      updateData.status = scheduled_at ? 'scheduled' : 'draft';
    }

    if (status) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from('newsletters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      { message: 'Newsletter updated successfully', newsletter: data },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter update error:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

