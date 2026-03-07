import type { RequestFormValues } from '../types/requestFormSchema';

// ── Types ───────────────────────────────────────────────────────────────────────

export interface PriceLineItem {
  label: string;
  price: number;
}

// ── Price constants ─────────────────────────────────────────────────────────────

export const PRICES = {
  depth: {
    basic: 100,
    advanced: 250,
    strategic: 500,
  },
  objectives: {
    brandSentiment: 0,
    campaignPerformance: 75,
    competitorAnalysis: 150,
    industrySectorAnalysis: 100,
  },
} as const;

// ── Human-readable labels ───────────────────────────────────────────────────────

const DEPTH_LABELS: Record<keyof typeof PRICES.depth, string> = {
  basic: 'Basic Intelligence',
  advanced: 'Advanced Intelligence',
  strategic: 'Strategic Intelligence',
};

const OBJECTIVE_LABELS: Record<keyof typeof PRICES.objectives, string> = {
  brandSentiment: 'Brand Sentiment',
  campaignPerformance: 'Campaign Performance',
  competitorAnalysis: 'Competitor Analysis',
  industrySectorAnalysis: 'Industry / Sector Analysis',
};

// ── Calculator ──────────────────────────────────────────────────────────────────

export function calculatePrice(
  values: Partial<RequestFormValues>,
): { lineItems: PriceLineItem[]; total: number } {
  const lineItems: PriceLineItem[] = [];

  // Intelligence depth tier
  const depth = values.intelligenceDepth ?? 'basic';
  lineItems.push({
    label: DEPTH_LABELS[depth],
    price: PRICES.depth[depth],
  });

  // Selected objectives
  if (values.objectives) {
    for (const key of Object.keys(PRICES.objectives) as Array<
      keyof typeof PRICES.objectives
    >) {
      if (values.objectives[key]) {
        lineItems.push({
          label: OBJECTIVE_LABELS[key],
          price: PRICES.objectives[key],
        });
      }
    }
  }

  const total = lineItems.reduce((sum, item) => sum + item.price, 0);

  return { lineItems, total };
}
