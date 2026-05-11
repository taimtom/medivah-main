export const VERIFICATION_SETTINGS = {
  modeKey: 'verification_enforcement_mode',
  deadlineKey: 'verification_grace_deadline',
  defaultMode: 'grace_then_gate',
};

export async function getVerificationPolicy(supabaseClient) {
  const { data } = await supabaseClient
    .from('platform_settings')
    .select('key, value')
    .in('key', [VERIFICATION_SETTINGS.modeKey, VERIFICATION_SETTINGS.deadlineKey]);

  const map = Object.fromEntries((data || []).map((row) => [row.key, row.value]));
  const mode = map[VERIFICATION_SETTINGS.modeKey]?.mode || VERIFICATION_SETTINGS.defaultMode;
  const deadline = map[VERIFICATION_SETTINGS.deadlineKey]?.iso || null;

  return { mode, deadline };
}

export function shouldBlockPublishing(policy, isVerified) {
  if (isVerified) return false;
  if (!policy || policy.mode !== 'grace_then_gate') return false;
  if (!policy.deadline) return false;
  return new Date() >= new Date(policy.deadline);
}
