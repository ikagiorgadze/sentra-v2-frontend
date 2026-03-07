import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { requestFormSchema, type RequestFormValues } from '../../types/requestFormSchema';
import { createFormRequest } from '../../api/formRequests';
import { calculatePrice } from '../../lib/priceCalculator';
import { YourDetailsSection } from './YourDetailsSection';
import { AnalysisConfigSection } from './AnalysisConfigSection';
import { PriceCalculator } from './PriceCalculator';

const TIME_RANGE_MAP: Record<string, string> = {
  last_24h: 'Last 24 hours',
  last_7d: 'Last 7 days',
  last_30d: 'Last 30 days',
  custom: 'Custom range',
};

export function RequestFormPage() {
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      organizationName: '',
      department: 'corporate_affairs',
      contactName: '',
      contactEmail: '',
      contactPhone: '',
      projectName: '',
      additionalContext: '',
      objectives: {
        brandSentiment: false,
        campaignPerformance: false,
        competitorAnalysis: false,
        industrySectorAnalysis: false,
        other: false,
        otherText: '',
      },
      keyQuestion: '',
      keywords: [],
      country: '',
      timeRange: 'last_7d',
      comparePreviousPeriod: false,
      intelligenceDepth: 'basic',
    },
  });

  const watchedValues = methods.watch();
  const { lineItems, total } = useMemo(() => calculatePrice(watchedValues), [watchedValues]);

  const onSubmit = async (data: RequestFormValues) => {
    setSubmitError(null);
    try {
      const query = [data.keyQuestion, ...data.keywords].join(' ');
      const response = await createFormRequest({
        query,
        // User info — persisted as dedicated DB columns
        organization_name: data.organizationName,
        department: data.department === 'other' ? data.departmentOther || 'Other' : data.department,
        contact_name: data.contactName,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone || undefined,
        project_name: data.projectName || undefined,
        // Analysis payload — stored as JSONB
        form_payload: {
          additional_context: data.additionalContext,
          objectives: data.objectives,
          campaign_details: data.campaignDetails,
          competitor_details: data.competitorDetails,
          industry_details: data.industryDetails,
          key_question: data.keyQuestion,
          keywords: data.keywords,
          geography: { country: data.country },
          timeframe: {
            preset: TIME_RANGE_MAP[data.timeRange] ?? data.timeRange,
            start_date: data.customStartDate,
            end_date: data.customEndDate,
          },
          compare_previous_period: data.comparePreviousPeriod,
          previous_period: data.comparePreviousPeriod
            ? {
                type: data.previousPeriodType,
                start_date: data.previousPeriodStartDate,
                end_date: data.previousPeriodEndDate,
              }
            : undefined,
          intelligence_depth: data.intelligenceDepth,
          price_breakdown: { line_items: lineItems, total },
        },
        normalization_json: {
          country: data.country || null,
          timeframe: TIME_RANGE_MAP[data.timeRange] ?? data.timeRange,
          start_date: data.customStartDate || null,
          end_date: data.customEndDate || null,
        },
      });
      navigate(`/request-history/${response.request.id}`);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <h1 className="text-2xl font-bold">New Intelligence Request</h1>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
          <YourDetailsSection />
          <AnalysisConfigSection />
          <PriceCalculator lineItems={lineItems} total={total} />

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}
