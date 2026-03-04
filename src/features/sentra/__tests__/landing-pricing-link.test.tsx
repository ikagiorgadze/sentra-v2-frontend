import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { LandingPage } from '@/features/sentra/components/LandingPage';

describe('landing pricing link', () => {
  it('renders a Pricing link to /pricing in header', () => {
    render(
      <BrowserRouter>
        <LandingPage
          onGetStarted={vi.fn()}
          onViewSample={vi.fn()}
          landingDraftMessage=""
          onLandingDraftChange={vi.fn()}
          onTrySend={vi.fn()}
          examplePrompts={[]}
          onSelectExample={vi.fn()}
        />
      </BrowserRouter>,
    );

    const pricingLink = screen.getByRole('link', { name: /pricing/i });
    expect(pricingLink).toHaveAttribute('href', '/pricing');
  });
});
