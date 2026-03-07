import { z } from 'zod';

// ── Enums ──────────────────────────────────────────────────────────────────────

export const departmentEnum = z.enum([
  'corporate_affairs',
  'pr_communications',
  'marketing',
  'research_academic',
  'other',
]);

export const campaignMetricEnum = z.enum([
  'reach',
  'engagement',
  'conversions',
  'brand_lift',
]);

export const compareAspectEnum = z.enum([
  'sentiment',
  'share_of_voice',
  'messaging_strategy',
]);

export const focusAreaEnum = z.enum([
  'market_trends',
  'regulatory_sentiment',
  'public_perception',
]);

export const timeRangeEnum = z.enum([
  'last_24h',
  'last_7d',
  'last_30d',
  'custom',
]);

export const previousPeriodTypeEnum = z.enum(['same_length', 'custom']);

export const intelligenceDepthEnum = z.enum([
  'basic',
  'advanced',
  'strategic',
]);

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const objectivesSchema = z.object({
  brandSentiment: z.boolean(),
  campaignPerformance: z.boolean(),
  competitorAnalysis: z.boolean(),
  industrySectorAnalysis: z.boolean(),
  other: z.boolean(),
  otherText: z.string().optional(),
});

const campaignDetailsSchema = z.object({
  campaignName: z.string().min(1, 'Campaign name is required'),
  launchDate: z.string().optional(),
  metrics: z.array(campaignMetricEnum),
});

const competitorDetailsSchema = z.object({
  competitorNames: z
    .array(z.string().min(1))
    .min(1, 'At least one competitor name is required'),
  compareAspects: z.array(compareAspectEnum),
});

const industryDetailsSchema = z.object({
  sector: z.string().min(1, 'Sector is required'),
  focusAreas: z.array(focusAreaEnum),
});

// ── Main schema (before refinement) ────────────────────────────────────────────

const baseSchema = z.object({
  // Your Details
  organizationName: z.string().min(1, 'Organization name is required'),
  department: departmentEnum,
  departmentOther: z.string().optional(),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('A valid email is required'),
  contactPhone: z.string().optional(),
  projectName: z.string().optional(),
  additionalContext: z.string().optional(),

  // Analysis Configuration
  objectives: objectivesSchema,
  campaignDetails: campaignDetailsSchema.optional(),
  competitorDetails: competitorDetailsSchema.optional(),
  industryDetails: industryDetailsSchema.optional(),
  keyQuestion: z.string().min(1, 'Key question is required'),
  keywords: z
    .array(z.string().min(1))
    .min(1, 'At least one keyword is required'),
  country: z.string().min(1, 'Country is required'),
  timeRange: timeRangeEnum,
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  comparePreviousPeriod: z.boolean(),
  previousPeriodType: previousPeriodTypeEnum.optional(),
  previousPeriodStartDate: z.string().optional(),
  previousPeriodEndDate: z.string().optional(),
  intelligenceDepth: intelligenceDepthEnum,
});

// ── Cross-field validations ────────────────────────────────────────────────────

export const requestFormSchema = baseSchema.superRefine((data, ctx) => {
  // department === 'other' requires departmentOther
  if (data.department === 'other' && (!data.departmentOther || data.departmentOther.trim() === '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please specify your department',
      path: ['departmentOther'],
    });
  }

  // At least one objective must be selected
  const { objectives } = data;
  const hasObjective =
    objectives.brandSentiment ||
    objectives.campaignPerformance ||
    objectives.competitorAnalysis ||
    objectives.industrySectorAnalysis ||
    objectives.other;

  if (!hasObjective) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'At least one objective must be selected',
      path: ['objectives'],
    });
  }

  // campaignPerformance requires campaignDetails
  if (objectives.campaignPerformance && !data.campaignDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Campaign details are required when campaign performance is selected',
      path: ['campaignDetails'],
    });
  }

  // competitorAnalysis requires competitorDetails
  if (objectives.competitorAnalysis && !data.competitorDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Competitor details are required when competitor analysis is selected',
      path: ['competitorDetails'],
    });
  }

  // industrySectorAnalysis requires industryDetails
  if (objectives.industrySectorAnalysis && !data.industryDetails) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Industry details are required when industry/sector analysis is selected',
      path: ['industryDetails'],
    });
  }

  // timeRange === 'custom' requires customStartDate and customEndDate
  if (data.timeRange === 'custom') {
    if (!data.customStartDate || data.customStartDate.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Start date is required for custom time range',
        path: ['customStartDate'],
      });
    }
    if (!data.customEndDate || data.customEndDate.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date is required for custom time range',
        path: ['customEndDate'],
      });
    }
  }

  // previousPeriodType === 'custom' requires previousPeriodStartDate and previousPeriodEndDate
  if (data.comparePreviousPeriod && data.previousPeriodType === 'custom') {
    if (!data.previousPeriodStartDate || data.previousPeriodStartDate.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Previous period start date is required',
        path: ['previousPeriodStartDate'],
      });
    }
    if (!data.previousPeriodEndDate || data.previousPeriodEndDate.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Previous period end date is required',
        path: ['previousPeriodEndDate'],
      });
    }
  }
});

// ── Inferred type ──────────────────────────────────────────────────────────────

export type RequestFormValues = z.infer<typeof requestFormSchema>;
