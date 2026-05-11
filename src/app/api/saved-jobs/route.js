import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicant_id');

    if (!applicantId) {
      return NextResponse.json({ error: 'applicant_id is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('saved_jobs')
      .select('id, created_at, jobs:job_id(*)')
      .eq('applicant_id', applicantId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ rows: data || [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to fetch saved jobs' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    if (!payload.applicant_id || !payload.job_id) {
      return NextResponse.json({ error: 'applicant_id and job_id are required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('saved_jobs')
      .insert([{ applicant_id: payload.applicant_id, job_id: payload.job_id }])
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
    const { searchParams } = new URL(request.url);
    const applicantId = searchParams.get('applicant_id');
    const jobId = searchParams.get('job_id');
    if (!applicantId || !jobId) {
      return NextResponse.json({ error: 'applicant_id and job_id are required' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('applicant_id', applicantId)
      .eq('job_id', jobId);

    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to unsave job' }, { status: 500 });
  }
}
