import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { requireAdminActorId } from 'src/lib/require-admin';

export async function PATCH(request) {
  try {
    const adminId = await requireAdminActorId(request);
    if (!adminId) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const payload = await request.json();
    if (!payload.id || !payload.status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 });
    }

    const allowed = ['pending', 'in_review', 'approved', 'rejected', 'suspended'];
    if (!allowed.includes(payload.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('employer_verifications')
      .update({
        status: payload.status,
        review_notes: payload.review_notes || null,
        reviewed_by: adminId,
        reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', payload.id)
      .select('*')
      .single();

    if (error) throw error;

    if (data?.member_id) {
      const now = new Date().toISOString();
      await supabase.from('member_role_capabilities').upsert(
        [
          {
            user_id: data.member_id,
            role: 'recruiter',
            status: payload.status === 'approved' ? 'active' : 'in_progress',
            onboarding_started_at: data.created_at || now,
            activated_at: payload.status === 'approved' ? now : null,
            updated_at: now,
          },
        ],
        { onConflict: 'user_id,role' }
      );
    }

    await supabase.from('application_audit_logs').insert([
      {
        actor_id: adminId,
        action_type: 'verification_reviewed',
        entity_type: 'employer_verification',
        entity_id: payload.id,
        metadata: { status: payload.status, review_notes: payload.review_notes || null },
      },
    ]);

    return NextResponse.json({ verification: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Failed to review verification' }, { status: 500 });
  }
}
