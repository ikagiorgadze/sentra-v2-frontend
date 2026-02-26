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

  it('ensures AlphaInsure scenario captures the insurance campaign name and campaign-specific measurements', () => {
    const alphaScenario = DEMO_SCENARIOS.find((scenario) => scenario.id === 'insurance-rival-campaign-georgia');
    expect(alphaScenario).toBeDefined();

    const scriptText = alphaScenario!.script
      .map((step) => ('content' in step ? step.content : 'normalizedQuery' in step ? step.normalizedQuery : ''))
      .join(' ');

    expect(scriptText).toContain('everybody makes mistakes');
    expect(scriptText.toLowerCase()).toContain('campaign');
    expect(scriptText.toLowerCase()).toContain('name');
    expect(alphaScenario!.analysisPayload.query).toContain('everybody makes mistakes');
    expect(alphaScenario!.analysisPayload.summary).toContain('everybody makes mistakes');
  });
});
