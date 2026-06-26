import { describe, expect, it } from 'vitest';
import { shouldShowPeaceBanner } from '@/domains/travel-guide/utils/shouldShowPeaceBanner';

describe('shouldShowPeaceBanner', () => {
  it('shows when payload exists and banner not dismissed', () => {
    expect(shouldShowPeaceBanner(true, false)).toBe(true);
  });

  it('hides when dismissed', () => {
    expect(shouldShowPeaceBanner(true, true)).toBe(false);
  });

  it('hides when no payload', () => {
    expect(shouldShowPeaceBanner(false, false)).toBe(false);
  });
});
