import { FormEvent, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createFormRequest } from '@/features/sentra/api/formRequests';
import { buildRequestQuery, type RequestQueryInput } from '@/features/sentra/lib/requestQueryBuilder';

interface FormErrors {
  organizationName?: string;
  primaryEntity?: string;
  submit?: string;
}

function parseKeywords(raw: string): string[] {
  return raw
    .split(/[\n,]/g)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function RequestFormPage() {
  const navigate = useNavigate();
  const [organizationName, setOrganizationName] = useState('');
  const [primaryEntity, setPrimaryEntity] = useState('');
  const [region, setRegion] = useState<'Global' | 'Eastern Europe' | 'Specific country'>('Global');
  const [country, setCountry] = useState('');
  const [timePreset, setTimePreset] = useState<'Last 24 hours' | 'Last 7 days' | 'Last 30 days' | 'Custom range'>(
    'Last 7 days',
  );
  const [keyQuestion, setKeyQuestion] = useState('');
  const [keywordsRaw, setKeywordsRaw] = useState('');
  const [objectives, setObjectives] = useState<string[]>(['Brand sentiment monitoring']);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryInput = useMemo<RequestQueryInput>(
    () => ({
      primary_entity: primaryEntity,
      objectives,
      geography: {
        region,
        country: country.trim() || undefined,
      },
      timeframe: {
        preset: timePreset,
      },
      keywords: parseKeywords(keywordsRaw),
      key_question: keyQuestion,
    }),
    [country, keyQuestion, keywordsRaw, objectives, primaryEntity, region, timePreset],
  );

  const queryPreview = useMemo(() => buildRequestQuery(queryInput), [queryInput]);

  const toggleObjective = (value: string, checked: boolean) => {
    setObjectives((current) => {
      if (checked) {
        return current.includes(value) ? current : [...current, value];
      }
      return current.filter((item) => item !== value);
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!organizationName.trim()) {
      nextErrors.organizationName = 'Organization/Client name is required';
    }
    if (!primaryEntity.trim()) {
      nextErrors.primaryEntity = 'Primary brand/organization is required';
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await createFormRequest({
        query: queryPreview,
        form_payload: {
          organization_name: organizationName.trim(),
          primary_entity: primaryEntity.trim(),
          objectives,
          geography: {
            region,
            country: country.trim() || null,
          },
          timeframe: {
            preset: timePreset,
          },
          key_question: keyQuestion.trim() || null,
          keywords: parseKeywords(keywordsRaw),
        },
        normalization_json: {
          region,
          country: country.trim() || null,
          timeframe: timePreset,
        },
      });
      navigate(`/request-history/${response.request.id}`);
    } catch (caught) {
      const message = caught instanceof Error && caught.message.trim() ? caught.message.trim() : 'Submit failed';
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold">Sentra Intelligence Request Form</h1>
          <p className="text-sm text-muted-foreground">Structured intake for analysis job creation.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-border bg-card p-5">
          <div className="space-y-2">
            <label htmlFor="organizationName" className="text-sm">
              Organization / Client Name
            </label>
            <input
              id="organizationName"
              value={organizationName}
              onChange={(event) => setOrganizationName(event.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
            {errors.organizationName && <p className="text-xs text-red-300">{errors.organizationName}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="primaryEntity" className="text-sm">
              Primary Brand / Organization
            </label>
            <input
              id="primaryEntity"
              value={primaryEntity}
              onChange={(event) => setPrimaryEntity(event.target.value)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
            {errors.primaryEntity && <p className="text-xs text-red-300">{errors.primaryEntity}</p>}
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm">Monitoring Objective</legend>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={objectives.includes('Brand sentiment monitoring')}
                onChange={(event) => toggleObjective('Brand sentiment monitoring', event.target.checked)}
              />
              <span>Brand sentiment monitoring</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={objectives.includes('Crisis monitoring / early warning')}
                onChange={(event) => toggleObjective('Crisis monitoring / early warning', event.target.checked)}
              />
              <span>Crisis monitoring / early warning</span>
            </label>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="region" className="text-sm">
                Region to monitor
              </label>
              <select
                id="region"
                value={region}
                onChange={(event) => setRegion(event.target.value as typeof region)}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="Global">Global</option>
                <option value="Eastern Europe">Eastern Europe</option>
                <option value="Specific country">Specific country</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="country" className="text-sm">
                Country
              </label>
              <input
                id="country"
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="timePreset" className="text-sm">
              Time Range
            </label>
            <select
              id="timePreset"
              value={timePreset}
              onChange={(event) => setTimePreset(event.target.value as typeof timePreset)}
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="Last 24 hours">Last 24 hours</option>
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Custom range">Custom range</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="keyQuestion" className="text-sm">
              Key Question
            </label>
            <textarea
              id="keyQuestion"
              value={keyQuestion}
              onChange={(event) => setKeyQuestion(event.target.value)}
              className="min-h-24 w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="keywords" className="text-sm">
              Keywords / Phrases to Track
            </label>
            <textarea
              id="keywords"
              value={keywordsRaw}
              onChange={(event) => setKeywordsRaw(event.target.value)}
              placeholder="brand, hashtag, campaign keyword"
              className="min-h-24 w-full rounded border border-border bg-background px-3 py-2 text-sm"
            />
          </div>

          <section className="rounded border border-border/70 bg-background/60 p-3">
            <p className="mb-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">Query Preview</p>
            <p className="text-sm">{queryPreview}</p>
          </section>

          {errors.submit && <p className="text-sm text-red-300">{errors.submit}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded bg-[#3FD6D0] px-4 py-2 text-sm font-medium text-black disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </main>
  );
}
