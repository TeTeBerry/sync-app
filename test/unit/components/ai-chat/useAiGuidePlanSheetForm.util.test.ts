import { describe, expect, it } from 'vitest';
import { resolveGuidePlanAccommodationNights } from '@/components/ai-chat/useAiGuidePlanSheetForm';

describe('resolveGuidePlanAccommodationNights', () => {
  it('sends 0 nights when domestic accommodation is turned off', () => {
    expect(resolveGuidePlanAccommodationNights(true, false, 2)).toBe(0);
  });

  it('keeps nights when domestic accommodation is on', () => {
    expect(resolveGuidePlanAccommodationNights(true, true, 2)).toBe(2);
  });

  it('keeps nights for overseas activities without accommodation toggle', () => {
    expect(resolveGuidePlanAccommodationNights(false, true, 3)).toBe(3);
    expect(resolveGuidePlanAccommodationNights(false, false, 3)).toBe(3);
  });
});
