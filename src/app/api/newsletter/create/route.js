import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { requireAdminActorId } from 'src/lib/require-admin';

export async function POST(request) {
  try {
    const adminId = await requireAdminActorId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServerClient();
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
    const adminId = await requireAdminActorId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = createServerClient();
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
