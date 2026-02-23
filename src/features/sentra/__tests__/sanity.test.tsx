import { describe, expect, it } from 'vitest';

describe('sanity', () => {
  it('runs tests in jsdom', () => {
    expect(document).toBeDefined();
  });
});
