import { describe, expect, it } from 'vitest';
import {
  formatBuddyPreferencesSummary,
  hasBuddyPreferenceSignal,
} from '@/constants/buddyPreferences';

describe('formatBuddyPreferencesSummary', () => {
  it('joins city genres and budget', () => {
    const summary = formatBuddyPreferencesSummary({
      city: '%E4%B8%8A%E6%B5%B7',
      favorGenres: ['Techno', 'House'],
      budgetLevel: 'medium',
    });
    expect(summary).toContain('上海');
    expect(summary).toContain('Techno');
    expect(summary).toContain('舒适');
  });

  it('returns placeholder when empty', () => {
    expect(formatBuddyPreferencesSummary({})).toBe('未设置');
  });
});

describe('hasBuddyPreferenceSignal', () => {
  it('returns true when any preference field is set', () => {
    expect(hasBuddyPreferenceSignal({ city: '上海' })).toBe(true);
    expect(hasBuddyPreferenceSignal({ favorGenres: ['Techno'] })).toBe(true);
    expect(hasBuddyPreferenceSignal({ budgetLevel: 'medium' })).toBe(true);
  });

  it('returns false when no preference fields are set', () => {
    expect(hasBuddyPreferenceSignal({})).toBe(false);
    expect(hasBuddyPreferenceSignal(null)).toBe(false);
  });
});
