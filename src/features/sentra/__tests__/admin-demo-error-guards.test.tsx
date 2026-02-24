import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminDemoPage } from '@/features/sentra/components/AdminDemoPage';
import type { DemoScenario } from '@/features/sentra/demo/types';

const INVALID_SCENARIOS: DemoScenario[] = [
  {
    id: 'broken',
    name: 'Broken',
    description: 'Broken scenario for guard tests',
    script: [],
    analysisPayload: {
      query: '',
      summary: '',
      sentimentOverview: { positive: 0, neutral: 0, negative: 0 },
      sentimentTimeseries: [],
    },
  },
];

describe('admin demo error guards', () => {
  it('shows inline error and blocks playback when scenario is invalid', () => {
    render(<AdminDemoPage scenarios={INVALID_SCENARIOS} />);

    expect(screen.getByText(/selected demo scenario has no scripted steps/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /next step/i })).toBeDisabled();
  });
});
