import { NextResponse } from 'next/server';

import { createServerClient } from 'src/lib/supabase';
import { FINANCIAL_CONFIG } from 'src/lib/financial-config';
import { getRequestUser } from 'src/lib/request-user';
import { getVerificationPolicy, shouldBlockPublishing } from 'src/lib/verification-policy';
import {
  getAvailableCreditUnits,
  grantMonthlyFreeCredits,
  InsufficientCreditsError,
  debitCreditsForJobPublish,
} from 'src/lib/wallet';

export async function POST(request) {
  try {
    const user = await getRequestUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const supabase = createServerClient();
    const body = await request.json();
    const { idempotency_key: idempotencyKey, ...jobPayload } = body;

    // Always derive memberId from the authenticated session — never trust the request body
    const memberId = user.id;

    const { data: verification } = await supabase
      .from('employer_verifications')
      .select('status')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const isVerified = verification?.status === 'approved';
    const policy = await getVerificationPolicy(supabase);
    const publishBlocked = shouldBlockPublishing(policy, isVerified);

    if (publishBlocked) {
      return NextResponse.json(
        {
          error: 'Employer verification is required to publish jobs after the grace deadline',
          verification_required: true,
        },
        { status: 403 }
      );
    }

    await grantMonthlyFreeCredits(supabase, memberId);

    const available = await getAvailableCreditUnits(supabase, memberId);
    if (available < FINANCIAL_CONFIG.jobPublishCostCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', insufficient_credits: true },
        { status: 402 }
      );
    }

    const { data: insertedJob, error: insertError } = await supabase
      .from('jobs')
      .insert([{ ...jobPayload, member_id: memberId, published: false }])
      .select('*')
      .single();

    if (insertError) throw insertError;

    await debitCreditsForJobPublish({
      supabaseClient: supabase,
      memberId,
      jobId: insertedJob.id,
      idempotencyKey: idempotencyKey || `job-publish-${insertedJob.id}`,
    });

    const { data: publishedJob, error: publishError } = await supabase
      .from('jobs')
      .update({ published: true, updated_at: new Date().toISOString() })
      .eq('id', insertedJob.id)
      .select('*')
      .single();

    if (publishError) throw publishError;

    return NextResponse.json(
      {
        message: 'Job published successfully',
        creditsUsed: FINANCIAL_CONFIG.jobPublishCostCredits,
        verification_warning: isVerified ? null : 'Published during grace period as unverified employer.',
        job: publishedJob,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof InsufficientCreditsError || error?.code === 'INSUFFICIENT_CREDITS') {
      return NextResponse.json(
        { error: 'Insufficient credits', insufficient_credits: true },
        { status: 402 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to publish job' },
      { status: 500 }
    );
  }
}
