import { describe, expect, it } from 'vitest';

import { DEMO_SCENARIOS } from '@/features/sentra/demo/scenarios';

describe('demo scenarios', () => {
  it('exposes at least one valid scenario with script and analysis payload', () => {
    expect(DEMO_SCENARIOS.length).toBeGreaterThan(0);
    for (const scenario of DEMO_SCENARIOS) {
      expect(scenario.id).toBeTruthy();
      expect(scenario.script.length).toBeGreaterThan(0);
      expect(scenario.analysisPayload).toBeDefined();
    }
  });
});
