# Request Form Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the intelligence request form into a two-card layout separating user data from analysis configuration, with inline conditional expansions and a dynamic price calculator.

**Architecture:** Single-page form using React Hook Form + Zod for validation, shadcn/ui Card components for visual separation, and the existing `createFormRequest` API. The form is split into "Your Details" (user data collection), "Analysis Configuration" (drives the backend pipeline), and "Price Calculator" (dynamic cost summary). Conditional fields expand inline below their parent checkbox.

**Tech Stack:** React 18, TypeScript, React Hook Form, Zod, shadcn/ui (Card, Input, Textarea, Checkbox, RadioGroup, Label, Button, Badge, Form), TailwindCSS

---

### Task 1: Define Zod Schema and Form Types

**Files:**
- Create: `src/features/sentra/types/requestFormSchema.ts`

**Step 1: Create the Zod schema file**

```typescript
import { z } from 'zod';

export const campaignDetailsSchema = z.object({
  campaignName: z.string().min(1, 'Campaign name is required'),
  launchDate: z.string().optional(),
  metrics: z.array(z.enum(['reach', 'engagement', 'conversions', 'brand_lift'])),
});

export const competitorDetailsSchema = z.object({
  competitorNames: z.array(z.string().min(1)).min(1, 'At least one competitor is required'),
  compareAspects: z.array(z.enum(['sentiment', 'share_of_voice', 'messaging_strategy'])),
});

export const industryDetailsSchema = z.object({
  sector: z.string().min(1, 'Sector is required'),
  focusAreas: z.array(z.enum(['market_trends', 'regulatory_sentiment', 'public_perception'])),
});

export const requestFormSchema = z.object({
  // --- Your Details ---
  organizationName: z.string().min(1, 'Organization name is required'),
  department: z.enum(['corporate_affairs', 'pr_communications', 'marketing', 'research_academic', 'other']),
  departmentOther: z.string().optional(),
  contactName: z.string().min(1, 'Contact name is required'),
  contactEmail: z.string().email('Valid email is required'),
  contactPhone: z.string().optional(),
  projectName: z.string().optional(),
  additionalContext: z.string().optional(),

  // --- Analysis Configuration ---
  objectives: z.object({
    brandSentiment: z.boolean(),
    campaignPerformance: z.boolean(),
    competitorAnalysis: z.boolean(),
    industrySectorAnalysis: z.boolean(),
    other: z.boolean(),
    otherText: z.string().optional(),
  }).refine(
    (obj) => obj.brandSentiment || obj.campaignPerformance || obj.competitorAnalysis || obj.industrySectorAnalysis || obj.other,
    { message: 'Select at least one monitoring objective' }
  ),

  campaignDetails: campaignDetailsSchema.optional(),
  competitorDetails: competitorDetailsSchema.optional(),
  industryDetails: industryDetailsSchema.optional(),

  keyQuestion: z.string().min(1, 'Key question is required'),
  keywords: z.array(z.string().min(1)).min(1, 'At least one keyword is required'),
  country: z.string().min(1, 'Country is required'),

  timeRange: z.enum(['last_24h', 'last_7d', 'last_30d', 'custom']),
  customStartDate: z.string().optional(),
  customEndDate: z.string().optional(),
  comparePreviousPeriod: z.boolean(),
  previousPeriodType: z.enum(['same_length', 'custom']).optional(),
  previousPeriodStartDate: z.string().optional(),
  previousPeriodEndDate: z.string().optional(),

  intelligenceDepth: z.enum(['basic', 'advanced', 'strategic']),
}).superRefine((data, ctx) => {
  if (data.timeRange === 'custom') {
    if (!data.customStartDate) ctx.addIssue({ code: 'custom', message: 'Start date is required', path: ['customStartDate'] });
    if (!data.customEndDate) ctx.addIssue({ code: 'custom', message: 'End date is required', path: ['customEndDate'] });
  }
  if (data.objectives.campaignPerformance && !data.campaignDetails) {
    ctx.addIssue({ code: 'custom', message: 'Campaign details are required', path: ['campaignDetails'] });
  }
  if (data.objectives.competitorAnalysis && !data.competitorDetails) {
    ctx.addIssue({ code: 'custom', message: 'Competitor details are required', path: ['competitorDetails'] });
  }
  if (data.objectives.industrySectorAnalysis && !data.industryDetails) {
    ctx.addIssue({ code: 'custom', message: 'Industry details are required', path: ['industryDetails'] });
  }
  if (data.objectives.other && !data.objectives.otherText?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Please specify', path: ['objectives', 'otherText'] });
  }
  if (data.department === 'other' && !data.departmentOther?.trim()) {
    ctx.addIssue({ code: 'custom', message: 'Please specify department', path: ['departmentOther'] });
  }
  if (data.comparePreviousPeriod && data.previousPeriodType === 'custom') {
    if (!data.previousPeriodStartDate) ctx.addIssue({ code: 'custom', message: 'Start date is required', path: ['previousPeriodStartDate'] });
    if (!data.previousPeriodEndDate) ctx.addIssue({ code: 'custom', message: 'End date is required', path: ['previousPeriodEndDate'] });
  }
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;
```

**Step 2: Verify the file compiles**

Run: `cd sentra-frontend && npx tsc --noEmit src/features/sentra/types/requestFormSchema.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/features/sentra/types/requestFormSchema.ts
git commit -m "feat: add Zod schema for request form redesign"
```

---

### Task 2: Create Price Calculator Logic

**Files:**
- Create: `src/features/sentra/lib/priceCalculator.ts`

**Step 1: Create the price calculator module**

```typescript
import type { RequestFormValues } from '../types/requestFormSchema';

export interface PriceLineItem {
  label: string;
  price: number;
}

// Placeholder prices — replace with real values later
const PRICES = {
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

export function calculatePrice(values: Partial<RequestFormValues>): {
  lineItems: PriceLineItem[];
  total: number;
} {
  const lineItems: PriceLineItem[] = [];

  // Intelligence depth
  const depth = values.intelligenceDepth ?? 'basic';
  lineItems.push({
    label: `Intelligence: ${depth.charAt(0).toUpperCase() + depth.slice(1)}`,
    price: PRICES.depth[depth],
  });

  // Objectives
  const obj = values.objectives;
  if (obj?.brandSentiment) {
    lineItems.push({ label: 'Brand sentiment monitoring', price: PRICES.objectives.brandSentiment });
  }
  if (obj?.campaignPerformance) {
    lineItems.push({ label: 'Campaign performance analysis', price: PRICES.objectives.campaignPerformance });
  }
  if (obj?.competitorAnalysis) {
    lineItems.push({ label: 'Competitor analysis', price: PRICES.objectives.competitorAnalysis });
  }
  if (obj?.industrySectorAnalysis) {
    lineItems.push({ label: 'Industry / sector analysis', price: PRICES.objectives.industrySectorAnalysis });
  }

  const total = lineItems.reduce((sum, item) => sum + item.price, 0);
  return { lineItems, total };
}
```

**Step 2: Verify compilation**

Run: `cd sentra-frontend && npx tsc --noEmit src/features/sentra/lib/priceCalculator.ts`
Expected: No errors

**Step 3: Commit**

```bash
git add src/features/sentra/lib/priceCalculator.ts
git commit -m "feat: add price calculator for request form"
```

---

### Task 3: Create PriceCalculator Component

**Files:**
- Create: `src/features/sentra/components/requests/PriceCalculator.tsx`

**Step 1: Create the component**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { PriceLineItem } from '../../lib/priceCalculator';

interface PriceCalculatorProps {
  lineItems: PriceLineItem[];
  total: number;
}

export function PriceCalculator({ lineItems, total }: PriceCalculatorProps) {
  if (lineItems.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {lineItems.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-muted-foreground">{item.label}</span>
            <span>{item.price === 0 ? 'Included' : `$${item.price}`}</span>
          </div>
        ))}
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Estimated Total</span>
          <span>${total}</span>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify compilation**

Run: `cd sentra-frontend && npx tsc --noEmit src/features/sentra/components/requests/PriceCalculator.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/features/sentra/components/requests/PriceCalculator.tsx
git commit -m "feat: add PriceCalculator display component"
```

---

### Task 4: Create YourDetailsSection Component

**Files:**
- Create: `src/features/sentra/components/requests/YourDetailsSection.tsx`

**Step 1: Create the component**

This is the "Your Details" card containing: Organization, Department, Contact info, Project name, Additional context.

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormContext } from 'react-hook-form';
import type { RequestFormValues } from '../../types/requestFormSchema';

const DEPARTMENTS = [
  { value: 'corporate_affairs', label: 'Corporate Affairs' },
  { value: 'pr_communications', label: 'PR / Communications' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'research_academic', label: 'Research / Academic' },
  { value: 'other', label: 'Other' },
] as const;

export function YourDetailsSection() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequestFormValues>();
  const department = watch('department');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Your Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="organizationName">Organization / Client Name *</Label>
          <Input id="organizationName" {...register('organizationName')} />
          {errors.organizationName && <p className="text-sm text-destructive mt-1">{errors.organizationName.message}</p>}
        </div>

        <div>
          <Label htmlFor="department">Department / Team *</Label>
          <Select value={department} onValueChange={(v) => setValue('department', v as RequestFormValues['department'])}>
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {DEPARTMENTS.map((d) => (
                <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {department === 'other' && (
            <Input className="mt-2" placeholder="Specify department" {...register('departmentOther')} />
          )}
          {errors.departmentOther && <p className="text-sm text-destructive mt-1">{errors.departmentOther.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Primary Contact *</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input placeholder="Name" {...register('contactName')} />
              {errors.contactName && <p className="text-sm text-destructive mt-1">{errors.contactName.message}</p>}
            </div>
            <div>
              <Input placeholder="Email" type="email" {...register('contactEmail')} />
              {errors.contactEmail && <p className="text-sm text-destructive mt-1">{errors.contactEmail.message}</p>}
            </div>
          </div>
          <Input placeholder="Phone (optional)" {...register('contactPhone')} />
        </div>

        <div>
          <Label htmlFor="projectName">Project / Campaign Name</Label>
          <Input id="projectName" {...register('projectName')} />
        </div>

        <div>
          <Label htmlFor="additionalContext">Additional Context</Label>
          <Textarea
            id="additionalContext"
            placeholder="Campaign strategy, known controversies, expected narrative risks, key events..."
            {...register('additionalContext')}
          />
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Verify compilation**

Run: `cd sentra-frontend && npx tsc --noEmit src/features/sentra/components/requests/YourDetailsSection.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/features/sentra/components/requests/YourDetailsSection.tsx
git commit -m "feat: add YourDetailsSection component"
```

---

### Task 5: Create AnalysisConfigSection Component

**Files:**
- Create: `src/features/sentra/components/requests/AnalysisConfigSection.tsx`

**Step 1: Create the component**

This is the largest component. It contains: Monitoring objectives with inline expansions, key question, keywords tag input, country, time range, compare toggle, intelligence depth with pricing labels.

```tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFormContext, useFieldArray } from 'react-hook-form';
import type { RequestFormValues } from '../../types/requestFormSchema';

const DEPTH_OPTIONS = [
  {
    value: 'basic' as const,
    label: 'Basic',
    price: '$100',
    features: 'Mentions volume, Sentiment distribution, Top posts',
  },
  {
    value: 'advanced' as const,
    label: 'Advanced',
    price: '$250',
    features: '+ Emotion analysis, Influencer mapping',
  },
  {
    value: 'strategic' as const,
    label: 'Strategic Intelligence',
    price: '$500',
    features: '+ Coordinated behavior signals, Competitor positioning, Strategic recommendations',
  },
] as const;

const TIME_PRESETS = [
  { value: 'last_24h' as const, label: 'Last 24 hours' },
  { value: 'last_7d' as const, label: 'Last 7 days' },
  { value: 'last_30d' as const, label: 'Last 30 days' },
  { value: 'custom' as const, label: 'Custom range' },
] as const;

export function AnalysisConfigSection() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequestFormValues>();
  const [keywordInput, setKeywordInput] = useState('');

  const objectives = watch('objectives');
  const timeRange = watch('timeRange');
  const comparePrevious = watch('comparePreviousPeriod');
  const previousPeriodType = watch('previousPeriodType');
  const depth = watch('intelligenceDepth');
  const keywords = watch('keywords') ?? [];

  const addKeyword = () => {
    const trimmed = keywordInput.trim();
    if (trimmed && !keywords.includes(trimmed)) {
      setValue('keywords', [...keywords, trimmed]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (kw: string) => {
    setValue('keywords', keywords.filter((k) => k !== kw));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Analysis Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Monitoring Objectives */}
        <div className="space-y-3">
          <Label>Monitoring Objective *</Label>
          {errors.objectives?.root && <p className="text-sm text-destructive">{errors.objectives.root.message}</p>}

          {/* Brand Sentiment */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={objectives?.brandSentiment}
              onCheckedChange={(v) => setValue('objectives.brandSentiment', !!v)}
            />
            <span className="text-sm">Brand sentiment monitoring</span>
          </div>

          {/* Campaign Performance */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={objectives?.campaignPerformance}
                onCheckedChange={(v) => setValue('objectives.campaignPerformance', !!v)}
              />
              <span className="text-sm">Campaign performance analysis</span>
              <Badge variant="secondary" className="text-xs">+$75</Badge>
            </div>
            {objectives?.campaignPerformance && (
              <div className="ml-6 pl-4 border-l-2 border-muted space-y-2">
                <Input placeholder="Campaign name or hashtag" {...register('campaignDetails.campaignName')} />
                {errors.campaignDetails?.campaignName && <p className="text-sm text-destructive">{errors.campaignDetails.campaignName.message}</p>}
                <Input type="date" {...register('campaignDetails.launchDate')} />
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Metrics that matter most</Label>
                  {(['reach', 'engagement', 'conversions', 'brand_lift'] as const).map((m) => (
                    <div key={m} className="flex items-center gap-2">
                      <Checkbox
                        checked={watch('campaignDetails.metrics')?.includes(m)}
                        onCheckedChange={(checked) => {
                          const current = watch('campaignDetails.metrics') ?? [];
                          setValue('campaignDetails.metrics', checked ? [...current, m] : current.filter((x) => x !== m));
                        }}
                      />
                      <span className="text-sm capitalize">{m.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Competitor Analysis */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={objectives?.competitorAnalysis}
                onCheckedChange={(v) => setValue('objectives.competitorAnalysis', !!v)}
              />
              <span className="text-sm">Competitor analysis</span>
              <Badge variant="secondary" className="text-xs">+$150</Badge>
            </div>
            {objectives?.competitorAnalysis && (
              <CompetitorDetailsExpansion />
            )}
          </div>

          {/* Industry / Sector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={objectives?.industrySectorAnalysis}
                onCheckedChange={(v) => setValue('objectives.industrySectorAnalysis', !!v)}
              />
              <span className="text-sm">Industry / sector analysis</span>
              <Badge variant="secondary" className="text-xs">+$100</Badge>
            </div>
            {objectives?.industrySectorAnalysis && (
              <div className="ml-6 pl-4 border-l-2 border-muted space-y-2">
                <Input placeholder="Industry / sector" {...register('industryDetails.sector')} />
                {errors.industryDetails?.sector && <p className="text-sm text-destructive">{errors.industryDetails.sector.message}</p>}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Focus areas</Label>
                  {(['market_trends', 'regulatory_sentiment', 'public_perception'] as const).map((f) => (
                    <div key={f} className="flex items-center gap-2">
                      <Checkbox
                        checked={watch('industryDetails.focusAreas')?.includes(f)}
                        onCheckedChange={(checked) => {
                          const current = watch('industryDetails.focusAreas') ?? [];
                          setValue('industryDetails.focusAreas', checked ? [...current, f] : current.filter((x) => x !== f));
                        }}
                      />
                      <span className="text-sm capitalize">{f.replace(/_/g, ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Other */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={objectives?.other}
                onCheckedChange={(v) => setValue('objectives.other', !!v)}
              />
              <span className="text-sm">Other</span>
            </div>
            {objectives?.other && (
              <div className="ml-6 pl-4 border-l-2 border-muted">
                <Input placeholder="Describe..." {...register('objectives.otherText')} />
                {errors.objectives?.otherText && <p className="text-sm text-destructive">{errors.objectives.otherText.message}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Key Question */}
        <div>
          <Label htmlFor="keyQuestion">Key Question *</Label>
          <Textarea
            id="keyQuestion"
            placeholder='e.g. "How is the public reacting to our telecom price increase?"'
            {...register('keyQuestion')}
          />
          {errors.keyQuestion && <p className="text-sm text-destructive mt-1">{errors.keyQuestion.message}</p>}
        </div>

        {/* Keywords */}
        <div>
          <Label>Keywords / Phrases *</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword and press Enter"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={handleKeywordKeyDown}
            />
            <Button type="button" variant="secondary" onClick={addKeyword}>Add</Button>
          </div>
          {keywords.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {keywords.map((kw) => (
                <Badge key={kw} variant="outline" className="cursor-pointer" onClick={() => removeKeyword(kw)}>
                  {kw} ×
                </Badge>
              ))}
            </div>
          )}
          {errors.keywords && <p className="text-sm text-destructive mt-1">{errors.keywords.message}</p>}
        </div>

        {/* Country */}
        <div>
          <Label htmlFor="country">Country *</Label>
          <Input id="country" placeholder="e.g. Georgia, United States" {...register('country')} />
          {errors.country && <p className="text-sm text-destructive mt-1">{errors.country.message}</p>}
        </div>

        {/* Time Range */}
        <div className="space-y-2">
          <Label>Time Range *</Label>
          <div className="space-y-1">
            {TIME_PRESETS.map((t) => (
              <div key={t.value} className="flex items-center gap-2">
                <input
                  type="radio"
                  value={t.value}
                  checked={timeRange === t.value}
                  onChange={() => setValue('timeRange', t.value)}
                  className="accent-primary"
                />
                <span className="text-sm">{t.label}</span>
              </div>
            ))}
          </div>
          {timeRange === 'custom' && (
            <div className="ml-6 pl-4 border-l-2 border-muted grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Start date</Label>
                <Input type="date" {...register('customStartDate')} />
                {errors.customStartDate && <p className="text-sm text-destructive">{errors.customStartDate.message}</p>}
              </div>
              <div>
                <Label className="text-xs">End date</Label>
                <Input type="date" {...register('customEndDate')} />
                {errors.customEndDate && <p className="text-sm text-destructive">{errors.customEndDate.message}</p>}
              </div>
            </div>
          )}

          {/* Compare with previous */}
          <div className="flex items-center gap-2 pt-2">
            <Checkbox
              checked={comparePrevious}
              onCheckedChange={(v) => setValue('comparePreviousPeriod', !!v)}
            />
            <span className="text-sm">Compare with previous period</span>
          </div>
          {comparePrevious && (
            <div className="ml-6 pl-4 border-l-2 border-muted space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  value="same_length"
                  checked={previousPeriodType === 'same_length'}
                  onChange={() => setValue('previousPeriodType', 'same_length')}
                  className="accent-primary"
                />
                <span className="text-sm">Same length prior period</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  value="custom"
                  checked={previousPeriodType === 'custom'}
                  onChange={() => setValue('previousPeriodType', 'custom')}
                  className="accent-primary"
                />
                <span className="text-sm">Custom range</span>
              </div>
              {previousPeriodType === 'custom' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Start date</Label>
                    <Input type="date" {...register('previousPeriodStartDate')} />
                  </div>
                  <div>
                    <Label className="text-xs">End date</Label>
                    <Input type="date" {...register('previousPeriodEndDate')} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Intelligence Depth */}
        <div className="space-y-2">
          <Label>Intelligence Depth *</Label>
          {DEPTH_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-colors ${
                depth === opt.value ? 'border-primary bg-primary/5' : 'border-muted'
              }`}
              onClick={() => setValue('intelligenceDepth', opt.value)}
            >
              <input
                type="radio"
                value={opt.value}
                checked={depth === opt.value}
                onChange={() => setValue('intelligenceDepth', opt.value)}
                className="accent-primary mt-1"
              />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium text-sm">{opt.label}</span>
                  <Badge variant="secondary">{opt.price}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{opt.features}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CompetitorDetailsExpansion() {
  const { register, watch, setValue, formState: { errors } } = useFormContext<RequestFormValues>();
  const [competitorInput, setCompetitorInput] = useState('');
  const competitorNames = watch('competitorDetails.competitorNames') ?? [];

  const addCompetitor = () => {
    const trimmed = competitorInput.trim();
    if (trimmed && !competitorNames.includes(trimmed)) {
      setValue('competitorDetails.competitorNames', [...competitorNames, trimmed]);
      setCompetitorInput('');
    }
  };

  const removeCompetitor = (name: string) => {
    setValue('competitorDetails.competitorNames', competitorNames.filter((n) => n !== name));
  };

  return (
    <div className="ml-6 pl-4 border-l-2 border-muted space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Add competitor name"
          value={competitorInput}
          onChange={(e) => setCompetitorInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompetitor(); } }}
        />
        <Button type="button" variant="secondary" onClick={addCompetitor}>Add</Button>
      </div>
      {competitorNames.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {competitorNames.map((name) => (
            <Badge key={name} variant="outline" className="cursor-pointer" onClick={() => removeCompetitor(name)}>
              {name} ×
            </Badge>
          ))}
        </div>
      )}
      {errors.competitorDetails?.competitorNames && (
        <p className="text-sm text-destructive">{errors.competitorDetails.competitorNames.message}</p>
      )}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">What to compare</Label>
        {(['sentiment', 'share_of_voice', 'messaging_strategy'] as const).map((a) => (
          <div key={a} className="flex items-center gap-2">
            <Checkbox
              checked={watch('competitorDetails.compareAspects')?.includes(a)}
              onCheckedChange={(checked) => {
                const current = watch('competitorDetails.compareAspects') ?? [];
                setValue('competitorDetails.compareAspects', checked ? [...current, a] : current.filter((x) => x !== a));
              }}
            />
            <span className="text-sm capitalize">{a.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Verify compilation**

Run: `cd sentra-frontend && npx tsc --noEmit src/features/sentra/components/requests/AnalysisConfigSection.tsx`
Expected: No errors

**Step 3: Commit**

```bash
git add src/features/sentra/components/requests/AnalysisConfigSection.tsx
git commit -m "feat: add AnalysisConfigSection component with inline expansions"
```

---

### Task 6: Rewrite RequestFormPage

**Files:**
- Modify: `src/features/sentra/components/requests/RequestFormPage.tsx`

**Step 1: Read the existing file to understand current imports and routing**

Read: `src/features/sentra/components/requests/RequestFormPage.tsx`
Note the existing imports, navigation, and toast patterns.

**Step 2: Rewrite the component**

Replace the entire file with the new form page that composes the three sections and handles submission.

```tsx
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

export default function RequestFormPage() {
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
        form_payload: {
          organization_name: data.organizationName,
          department: data.department,
          department_other: data.departmentOther,
          contact: {
            name: data.contactName,
            email: data.contactEmail,
            phone: data.contactPhone,
          },
          project_name: data.projectName,
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
```

**Step 3: Verify compilation**

Run: `cd sentra-frontend && npx tsc --noEmit src/features/sentra/components/requests/RequestFormPage.tsx`
Expected: No errors

**Step 4: Run dev server and visually verify**

Run: `cd sentra-frontend && npm run dev`
Navigate to the request form page and verify the two-card layout renders correctly.

**Step 5: Commit**

```bash
git add src/features/sentra/components/requests/RequestFormPage.tsx
git commit -m "feat: redesign RequestFormPage with two-card layout and price calculator"
```

---

### Task 7: Update requestQueryBuilder (if needed)

**Files:**
- Modify: `src/features/sentra/lib/requestQueryBuilder.ts`

**Step 1: Read current requestQueryBuilder.ts**

Check if `buildRequestQuery` is still used elsewhere. If the old function signature is used by other components (e.g., RequestDetailPage), keep it. If only used by the old RequestFormPage, it can be left as-is since the new form builds its own query string inline.

**Step 2: Verify no broken imports**

Run: `cd sentra-frontend && npx tsc --noEmit`
Expected: No errors project-wide

**Step 3: Commit (if changes made)**

```bash
git commit -am "refactor: update requestQueryBuilder for new form shape"
```

---

### Task 8: Smoke Test End-to-End

**Step 1: Run the full TypeScript check**

Run: `cd sentra-frontend && npx tsc --noEmit`
Expected: No errors

**Step 2: Run existing tests**

Run: `cd sentra-frontend && npx vitest run`
Expected: All existing tests pass

**Step 3: Manual smoke test**

1. Open the request form page
2. Fill in "Your Details" card — verify all fields work
3. Check each monitoring objective checkbox — verify inline expansions appear
4. Add keywords using tag input — verify add/remove works
5. Select different intelligence depth tiers — verify price calculator updates
6. Submit the form — verify it creates a request and navigates to detail page

**Step 4: Commit**

```bash
git commit --allow-empty -m "chore: smoke test request form redesign complete"
```
