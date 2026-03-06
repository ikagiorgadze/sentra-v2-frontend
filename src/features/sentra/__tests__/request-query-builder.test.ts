import { describe, expect, it } from 'vitest';

import { buildRequestQuery } from '@/features/sentra/lib/requestQueryBuilder';

describe('request query builder', () => {
  it('builds query from entity, objective, geography, and timeframe', () => {
    const query = buildRequestQuery({
      primary_entity: 'Acme Telecom',
      objectives: ['Brand sentiment monitoring', 'Crisis monitoring / early warning'],
      geography: { region: 'Specific country', country: 'Romania' },
      timeframe: { preset: 'Last 7 days' },
      keywords: ['Acme', '#acme'],
    });

    expect(query).toContain('Acme Telecom');
    expect(query).toContain('Romania');
    expect(query.toLowerCase()).toContain('last 7 days');
  });
});
