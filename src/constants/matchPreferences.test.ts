import { describe, expect, it } from 'vitest';
import { formatMatchPreferencesSummary } from './matchPreferences';

describe('formatMatchPreferencesSummary', () => {
  it('joins city genres budget and likeMate', () => {
    const summary = formatMatchPreferencesSummary({
      city: '上海',
      favorGenres: ['Techno', 'House', 'Trance'],
      budgetLevel: 'medium',
      likeMate: true,
    });
    expect(summary).toContain('上海');
    expect(summary).toContain('Techno');
    expect(summary).toContain('舒适');
    expect(summary).toContain('找搭子');
  });

  it('returns 未设置 when empty', () => {
    expect(formatMatchPreferencesSummary({})).toBe('未设置');
  });
});
