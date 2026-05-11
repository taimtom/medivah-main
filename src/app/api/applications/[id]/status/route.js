import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { getRequestUser } from 'src/lib/request-user';

const allowedTransitions = {
  submitted: ['under_review', 'rejected', 'closed'],
  under_review: ['shortlisted', 'interview', 'rejected', 'closed'],
  shortlisted: ['interview', 'rejected', 'closed'],
  interview: ['offer', 'rejected', 'closed'],
  offer: ['hired', 'rejected', 'closed'],
  hired: ['closed'],
  rejected: ['closed'],
  closed: [],
};

export async function PATCH(request, { params }) {
  try {
    const supabase = createServerClient();
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const payload = await request.json();
    const { id } = params;

    if (!payload.new_status) {
      return NextResponse.json({ error: 'new_status is required' }, { status: 400 });
    }

    const { data: current, error: fetchError } = await supabase
      .from('job_applications')
      .select('*, jobs:job_id(title, company)')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const { data: memberProfile, error: profileError } = await supabase
      .from('member_profiles')
      .select('business_role')
      .eq('user_id', user.id)
      .maybeSingle();
    if (profileError) throw profileError;

    const isAdmin = memberProfile?.business_role === 'admin';
    if (!isAdmin && current.employer_member_id !== user.id) {
      return NextResponse.json({ error: 'You can only update applications for your jobs' }, { status: 403 });
    }

    const currentStatus = current.status;
    const nextStatus = payload.new_status;
    const transitions = allowedTransitions[currentStatus] || [];
    if (!transitions.includes(nextStatus)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentStatus} to ${nextStatus}` },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('job_applications')
      .update({
        status: nextStatus,
        last_status_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;

    await supabase.from('application_status_history').insert([
      {
        application_id: id,
        old_status: currentStatus,
        new_status: nextStatus,
        changed_by_user_id: user.id,
        note: payload.note || null,
      },
    ]);

    await supabase.from('application_audit_logs').insert([
      {
        actor_id: user.id,
        action_type: 'application_status_changed',
        entity_type: 'job_application',
        entity_id: id,
        metadata: { old_status: currentStatus, new_status: nextStatus, note: payload.note || null },
      },
    ]);

    const jobTitle = current.jobs?.title || 'a role';
    const company = current.jobs?.company ? ` at ${current.jobs.company}` : '';
    const humanStatus = nextStatus.replace(/_/g, ' ');

    const notificationTitleMap = {
      under_review: `Your application is being reviewed`,
      shortlisted: `Great news — you've been shortlisted`,
      interview: `You've been invited to an interview`,
      offer: `You've received a job offer`,
      hired: `Congratulations — you've been hired`,
      rejected: `Application update`,
      closed: `Application closed`,
    };

    await supabase.from('notifications').insert([
      {
        user_id: current.applicant_id,
        type: 'application_update',
        title: notificationTitleMap[nextStatus] || `Application update: ${humanStatus}`,
        body: `Your application for "${jobTitle}"${company} has been moved to ${humanStatus}.`,
        metadata: { application_id: id, new_status: nextStatus, job_id: current.job_id },
      },
    ]);

    return NextResponse.json({ application: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to update status' }, { status: 500 });
  }
}
