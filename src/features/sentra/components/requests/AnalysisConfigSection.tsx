import { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import type { RequestFormValues } from '../../types/requestFormSchema';

// ── Helper: toggle value in an array ────────────────────────────────────────
function toggleArrayValue<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

// ── Sub-component: CompetitorDetailsExpansion ────────────────────────────────
function CompetitorDetailsExpansion() {
  const { watch, setValue, formState: { errors } } = useFormContext<RequestFormValues>();
  const [competitorInput, setCompetitorInput] = useState('');

  const competitorNames = watch('competitorDetails.competitorNames') ?? [];
  const compareAspects = watch('competitorDetails.compareAspects') ?? [];

  const addCompetitor = (raw: string) => {
    const name = raw.trim();
    if (name && !competitorNames.includes(name)) {
      setValue('competitorDetails.competitorNames', [...competitorNames, name], {
        shouldValidate: true,
      });
    }
    setCompetitorInput('');
  };

  const removeCompetitor = (name: string) => {
    setValue(
      'competitorDetails.competitorNames',
      competitorNames.filter((n) => n !== name),
      { shouldValidate: true },
    );
  };

  const compareAspectOptions = [
    { value: 'sentiment' as const, label: 'Sentiment' },
    { value: 'share_of_voice' as const, label: 'Share of voice' },
    { value: 'messaging_strategy' as const, label: 'Messaging strategy' },
  ];

  return (
    <div className="ml-6 pl-4 border-l-2 border-muted space-y-4 mt-2">
      {/* Competitor names tag input */}
      <div className="space-y-2">
        <Label>Competitor names</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Add competitor name"
            value={competitorInput}
            onChange={(e) => setCompetitorInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addCompetitor(competitorInput);
              }
            }}
          />
        </div>
        {competitorNames.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {competitorNames.map((name) => (
              <Badge key={name} variant="secondary" className="gap-1">
                {name}
                <button
                  type="button"
                  className="ml-1 hover:text-destructive"
                  onClick={() => removeCompetitor(name)}
                >
                  &times;
                </button>
              </Badge>
            ))}
          </div>
        )}
        {errors.competitorDetails?.competitorNames && (
          <p className="text-sm text-destructive mt-1">
            {errors.competitorDetails.competitorNames.message}
          </p>
        )}
      </div>

      {/* Compare aspects */}
      <div className="space-y-2">
        <Label>What to compare</Label>
        <div className="space-y-2">
          {compareAspectOptions.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <Checkbox
                id={`compare-${opt.value}`}
                checked={compareAspects.includes(opt.value)}
                onCheckedChange={() =>
                  setValue(
                    'competitorDetails.compareAspects',
                    toggleArrayValue(compareAspects, opt.value),
                  )
                }
              />
              <Label htmlFor={`compare-${opt.value}`} className="font-normal">
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export function AnalysisConfigSection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<RequestFormValues>();

  const [keywordInput, setKeywordInput] = useState('');

  const objectives = watch('objectives');
  const keywords = watch('keywords') ?? [];
  const timeRange = watch('timeRange');
  const comparePreviousPeriod = watch('comparePreviousPeriod');
  const previousPeriodType = watch('previousPeriodType');
  const intelligenceDepth = watch('intelligenceDepth');
  const campaignMetrics = watch('campaignDetails.metrics') ?? [];
  const industryFocusAreas = watch('industryDetails.focusAreas') ?? [];

  // ── Keyword helpers ─────────────────────────────────────────────────────
  const addKeyword = (raw: string) => {
    const kw = raw.trim();
    if (kw && !keywords.includes(kw)) {
      setValue('keywords', [...keywords, kw], { shouldValidate: true });
    }
    setKeywordInput('');
  };

  const removeKeyword = (kw: string) => {
    setValue(
      'keywords',
      keywords.filter((k) => k !== kw),
      { shouldValidate: true },
    );
  };

  // ── Campaign metric options ─────────────────────────────────────────────
  const campaignMetricOptions = [
    { value: 'reach' as const, label: 'Reach' },
    { value: 'engagement' as const, label: 'Engagement' },
    { value: 'conversions' as const, label: 'Conversions' },
    { value: 'brand_lift' as const, label: 'Brand lift' },
  ];

  // ── Industry focus area options ─────────────────────────────────────────
  const industryFocusAreaOptions = [
    { value: 'market_trends' as const, label: 'Market trends' },
    { value: 'regulatory_sentiment' as const, label: 'Regulatory sentiment' },
    { value: 'public_perception' as const, label: 'Public perception' },
  ];

  // ── Time range options ──────────────────────────────────────────────────
  const timeRangeOptions = [
    { value: 'last_24h' as const, label: 'Last 24 hours' },
    { value: 'last_7d' as const, label: 'Last 7 days' },
    { value: 'last_30d' as const, label: 'Last 30 days' },
    { value: 'custom' as const, label: 'Custom range' },
  ];

  // ── Intelligence depth options ──────────────────────────────────────────
  const depthOptions = [
    {
      value: 'basic' as const,
      label: 'Basic',
      price: '$100',
      description: 'Mentions volume, Sentiment distribution, Top posts',
    },
    {
      value: 'advanced' as const,
      label: 'Advanced',
      price: '$250',
      description: '+ Emotion analysis, Influencer mapping',
    },
    {
      value: 'strategic' as const,
      label: 'Strategic Intelligence',
      price: '$500',
      description:
        '+ Coordinated behavior signals, Competitor positioning, Strategic recommendations',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* ── 1. Monitoring Objectives ──────────────────────────────────────── */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Monitoring Objectives</Label>

          {/* Root-level objectives error */}
          {errors.objectives?.root && (
            <p className="text-sm text-destructive">
              {errors.objectives.root.message}
            </p>
          )}

          {/* a) Brand sentiment monitoring */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="obj-brand"
              checked={objectives?.brandSentiment ?? false}
              onCheckedChange={(v) =>
                setValue('objectives.brandSentiment', !!v)
              }
            />
            <Label htmlFor="obj-brand" className="font-normal">
              Brand sentiment monitoring
            </Label>
          </div>

          {/* b) Campaign performance analysis */}
          <div className="space-y-0">
            <div className="flex items-center gap-2">
              <Checkbox
                id="obj-campaign"
                checked={objectives?.campaignPerformance ?? false}
                onCheckedChange={(v) =>
                  setValue('objectives.campaignPerformance', !!v)
                }
              />
              <Label htmlFor="obj-campaign" className="font-normal">
                Campaign performance analysis
              </Label>
              <Badge variant="secondary">+$75</Badge>
            </div>

            {objectives?.campaignPerformance && (
              <div className="ml-6 pl-4 border-l-2 border-muted space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign name or hashtag</Label>
                  <Input
                    id="campaignName"
                    placeholder="Campaign name or hashtag"
                    {...register('campaignDetails.campaignName')}
                  />
                  {errors.campaignDetails?.campaignName && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.campaignDetails.campaignName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="launchDate">Launch date</Label>
                  <Input
                    id="launchDate"
                    type="date"
                    {...register('campaignDetails.launchDate')}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Metrics that matter most</Label>
                  <div className="space-y-2">
                    {campaignMetricOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`metric-${opt.value}`}
                          checked={campaignMetrics.includes(opt.value)}
                          onCheckedChange={() =>
                            setValue(
                              'campaignDetails.metrics',
                              toggleArrayValue(campaignMetrics, opt.value),
                            )
                          }
                        />
                        <Label
                          htmlFor={`metric-${opt.value}`}
                          className="font-normal"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* c) Competitor analysis */}
          <div className="space-y-0">
            <div className="flex items-center gap-2">
              <Checkbox
                id="obj-competitor"
                checked={objectives?.competitorAnalysis ?? false}
                onCheckedChange={(v) =>
                  setValue('objectives.competitorAnalysis', !!v)
                }
              />
              <Label htmlFor="obj-competitor" className="font-normal">
                Competitor analysis
              </Label>
              <Badge variant="secondary">+$150</Badge>
            </div>

            {objectives?.competitorAnalysis && <CompetitorDetailsExpansion />}
          </div>

          {/* d) Industry / sector analysis */}
          <div className="space-y-0">
            <div className="flex items-center gap-2">
              <Checkbox
                id="obj-industry"
                checked={objectives?.industrySectorAnalysis ?? false}
                onCheckedChange={(v) =>
                  setValue('objectives.industrySectorAnalysis', !!v)
                }
              />
              <Label htmlFor="obj-industry" className="font-normal">
                Industry / sector analysis
              </Label>
              <Badge variant="secondary">+$100</Badge>
            </div>

            {objectives?.industrySectorAnalysis && (
              <div className="ml-6 pl-4 border-l-2 border-muted space-y-4 mt-2">
                <div className="space-y-2">
                  <Label htmlFor="industrySector">Industry / sector</Label>
                  <Input
                    id="industrySector"
                    placeholder="Industry or sector"
                    {...register('industryDetails.sector')}
                  />
                  {errors.industryDetails?.sector && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.industryDetails.sector.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Focus areas</Label>
                  <div className="space-y-2">
                    {industryFocusAreaOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center gap-2">
                        <Checkbox
                          id={`focus-${opt.value}`}
                          checked={industryFocusAreas.includes(opt.value)}
                          onCheckedChange={() =>
                            setValue(
                              'industryDetails.focusAreas',
                              toggleArrayValue(industryFocusAreas, opt.value),
                            )
                          }
                        />
                        <Label
                          htmlFor={`focus-${opt.value}`}
                          className="font-normal"
                        >
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* e) Other */}
          <div className="space-y-0">
            <div className="flex items-center gap-2">
              <Checkbox
                id="obj-other"
                checked={objectives?.other ?? false}
                onCheckedChange={(v) => setValue('objectives.other', !!v)}
              />
              <Label htmlFor="obj-other" className="font-normal">
                Other
              </Label>
            </div>

            {objectives?.other && (
              <div className="ml-6 pl-4 border-l-2 border-muted mt-2">
                <Input
                  placeholder="Please specify"
                  {...register('objectives.otherText')}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 2. Key Question ───────────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="keyQuestion">Key Question</Label>
          <Textarea
            id="keyQuestion"
            placeholder='e.g. "How is the public reacting to our telecom price increase?"'
            {...register('keyQuestion')}
          />
          {errors.keyQuestion && (
            <p className="text-sm text-destructive mt-1">
              {errors.keyQuestion.message}
            </p>
          )}
        </div>

        {/* ── 3. Keywords / Phrases ─────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label>Keywords / Phrases</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword or phrase"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addKeyword(keywordInput);
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => addKeyword(keywordInput)}
            >
              Add
            </Button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {keywords.map((kw) => (
                <Badge key={kw} variant="secondary" className="gap-1">
                  {kw}
                  <button
                    type="button"
                    className="ml-1 hover:text-destructive"
                    onClick={() => removeKeyword(kw)}
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {errors.keywords && (
            <p className="text-sm text-destructive mt-1">
              {errors.keywords.message}
            </p>
          )}
        </div>

        {/* ── 4. Country ────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            placeholder="Country"
            {...register('country')}
          />
          {errors.country && (
            <p className="text-sm text-destructive mt-1">
              {errors.country.message}
            </p>
          )}
        </div>

        {/* ── 5. Time Range ─────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Time Range</Label>
          <div className="space-y-2">
            {timeRangeOptions.map((opt) => (
              <div key={opt.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`time-${opt.value}`}
                  name="timeRange"
                  value={opt.value}
                  checked={timeRange === opt.value}
                  onChange={() => setValue('timeRange', opt.value)}
                />
                <Label htmlFor={`time-${opt.value}`} className="font-normal">
                  {opt.label}
                </Label>
              </div>
            ))}
          </div>

          {timeRange === 'custom' && (
            <div className="ml-6 pl-4 border-l-2 border-muted mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customStartDate">Start date</Label>
                  <Input
                    id="customStartDate"
                    type="date"
                    {...register('customStartDate')}
                  />
                  {errors.customStartDate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.customStartDate.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customEndDate">End date</Label>
                  <Input
                    id="customEndDate"
                    type="date"
                    {...register('customEndDate')}
                  />
                  {errors.customEndDate && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.customEndDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Compare with previous period */}
          <div className="space-y-2 mt-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="comparePrevious"
                checked={comparePreviousPeriod ?? false}
                onCheckedChange={(v) =>
                  setValue('comparePreviousPeriod', !!v)
                }
              />
              <Label htmlFor="comparePrevious" className="font-normal">
                Compare with previous period
              </Label>
            </div>

            {comparePreviousPeriod && (
              <div className="ml-6 pl-4 border-l-2 border-muted space-y-4 mt-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="prevPeriod-same"
                      name="previousPeriodType"
                      value="same_length"
                      checked={previousPeriodType === 'same_length'}
                      onChange={() =>
                        setValue('previousPeriodType', 'same_length')
                      }
                    />
                    <Label htmlFor="prevPeriod-same" className="font-normal">
                      Same length prior period
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="prevPeriod-custom"
                      name="previousPeriodType"
                      value="custom"
                      checked={previousPeriodType === 'custom'}
                      onChange={() =>
                        setValue('previousPeriodType', 'custom')
                      }
                    />
                    <Label htmlFor="prevPeriod-custom" className="font-normal">
                      Custom range
                    </Label>
                  </div>
                </div>

                {previousPeriodType === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="previousPeriodStartDate">
                        Start date
                      </Label>
                      <Input
                        id="previousPeriodStartDate"
                        type="date"
                        {...register('previousPeriodStartDate')}
                      />
                      {errors.previousPeriodStartDate && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.previousPeriodStartDate.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="previousPeriodEndDate">End date</Label>
                      <Input
                        id="previousPeriodEndDate"
                        type="date"
                        {...register('previousPeriodEndDate')}
                      />
                      {errors.previousPeriodEndDate && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.previousPeriodEndDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 6. Intelligence Depth ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <Label className="text-base font-semibold">Intelligence Depth</Label>
          <div className="space-y-3">
            {depthOptions.map((opt) => (
              <div
                key={opt.value}
                className={`p-3 rounded-md border cursor-pointer ${
                  intelligenceDepth === opt.value
                    ? 'border-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => setValue('intelligenceDepth', opt.value)}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="intelligenceDepth"
                    value={opt.value}
                    checked={intelligenceDepth === opt.value}
                    onChange={() => setValue('intelligenceDepth', opt.value)}
                  />
                  <Label className="font-medium cursor-pointer">
                    {opt.label}
                  </Label>
                  <Badge variant="secondary">{opt.price}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-6">
                  {opt.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
