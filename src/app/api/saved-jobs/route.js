import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';

export async function GET(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id, created_at, jobs:job_id(*)')
      .eq('applicant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ rows: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    if (!payload.job_id) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert([{ applicant_id: user.id, job_id: payload.job_id }])
      .select('*')
      .single();

    if (error) throw error;
    return NextResponse.json({ row: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to save job' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('job_id');
    if (!jobId) {
      return NextResponse.json({ error: 'job_id is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('applicant_id', user.id)
      .eq('job_id', jobId);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to unsave job' }, { status: 500 });
  }
}
