import { describe, expect, it } from 'vitest';
import {
  buildBuddyPostSearchParsedSummaryParts,
  formatBuddyPostSearchParsedSummary,
} from '@/utils/formatBuddyPostSearchParsedSummary';

describe('formatBuddyPostSearchParsedSummary', () => {
  it('builds departure, date, and people count parts', () => {
    expect(
      buildBuddyPostSearchParsedSummaryParts({
        date: '6.14',
        peopleCount: '1',
        extraKeywords: ['上海出发'],
        searchTerms: ['上海出发', '6.14', '1'],
      }),
    ).toEqual([
      { kind: 'text', value: '上海出发' },
      { kind: 'text', value: '6.14' },
      { kind: 'peopleCount', value: '1' },
    ]);
  });

  it('formats summary with a custom people count label', () => {
    expect(
      formatBuddyPostSearchParsedSummary(
        {
          date: '6.14',
          peopleCount: '1',
          extraKeywords: ['上海出发'],
          searchTerms: ['上海出发', '6.14', '1'],
        },
        (count) => `差 ${count} 人`,
      ),
    ).toBe('上海出发 · 6.14 · 差 1 人');
  });

  it('includes genre and extra keywords without duplicates', () => {
    expect(
      formatBuddyPostSearchParsedSummary(
        {
          date: '10.3',
          genre: 'Techno',
          peopleCount: '2',
          extraKeywords: ['白天', '同逛舞台'],
          searchTerms: ['10.3', 'Techno', '2', '白天', '同逛舞台'],
        },
        (count) => `差 ${count} 人`,
      ),
    ).toBe('10.3 · 差 2 人 · Techno · 白天 · 同逛舞台');
  });

  it('returns null when parsed has no displayable fields', () => {
    expect(
      formatBuddyPostSearchParsedSummary(
        { searchTerms: ['Techno'] },
        (count) => `差 ${count} 人`,
      ),
    ).toBeNull();
  });
});
