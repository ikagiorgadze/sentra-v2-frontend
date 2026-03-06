import { describe, expect, it } from 'vitest';

import { buildRequestQuery } from '@/features/sentra/lib/requestQueryBuilder';

describe('request query builder', () => {
  it('returns primary entity plus keywords as request query', () => {
    const query = buildRequestQuery({
      primary_entity: '  Acme Telecom  ',
      geography: { region: 'Specific country', country: 'Romania' },
      timeframe: { preset: 'Last 7 days' },
      keywords: ['Acme', '#acme'],
    });

    expect(query).toBe('Acme Telecom Acme #acme');
  });

  it('falls back to primary entity when keywords are empty', () => {
    const query = buildRequestQuery({
      primary_entity: '  Acme Telecom  ',
      geography: { region: 'Specific country', country: 'Romania' },
      timeframe: { preset: 'Last 7 days' },
      keywords: ['  ', ''],
    });

    expect(query).toBe('Acme Telecom');
  });
});
