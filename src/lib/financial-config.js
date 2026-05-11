export const FINANCIAL_CONFIG = {
  /** Anchor display price per credit (1 job post = 1 credit). Bundles are always cheaper per credit. */
  creditValueNaira: Number(process.env.NEXT_PUBLIC_CREDIT_VALUE_NAIRA || 10000),
  jobPublishCostCredits: Number(process.env.NEXT_PUBLIC_JOB_PUBLISH_COST_CREDITS || 1),
  platformCommissionRate: Number(process.env.NEXT_PUBLIC_PLATFORM_COMMISSION_RATE || 0.2),
};

/**
 * Public credit bundles (mirrors `credit_packages` seed in database_migration_billing_v2.sql).
 * UI uses this for labels; server resolves price/credits from DB by `slug`.
 */
export const CREDIT_PACKS = [
  {
    slug: 'starter',
    label: 'Starter Pack',
    credits: 3,
    nairaPrice: 25000,
    validityMonths: 6,
    highlight: false,
  },
  {
    slug: 'growth',
    label: 'Growth Pack',
    credits: 7,
    nairaPrice: 50000,
    validityMonths: 9,
    highlight: false,
  },
  {
    slug: 'business',
    label: 'Business Pack',
    credits: 15,
    nairaPrice: 100000,
    validityMonths: 12,
    highlight: true,
  },
  {
    slug: 'enterprise',
    label: 'Enterprise Pack',
    credits: 30,
    nairaPrice: 180000,
    validityMonths: 18,
    highlight: false,
  },
];

export function computeCommissionSplit(grossAmount) {
  const gross = Number(grossAmount || 0);
  const platformAmount = Number((gross * FINANCIAL_CONFIG.platformCommissionRate).toFixed(2));
  const memberAmount = Number((gross - platformAmount).toFixed(2));

  return { grossAmount: gross, platformAmount, memberAmount };
}
