import { describe, expect, it } from 'vitest';
import { formatBuddyPreferencesSummary } from '@/constants/buddyPreferences';

describe('formatBuddyPreferencesSummary', () => {
  it('joins city genres and budget', () => {
    const summary = formatBuddyPreferencesSummary({
      city: '上海',
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
