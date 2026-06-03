import { describe, expect, it } from 'vitest';
import { formatItineraryBuddyRecruitHintMessage } from './itineraryBuddyRecruitHint';

describe('formatItineraryBuddyRecruitHintMessage', () => {
  it('formats genre-specific copy when count and genre present', () => {
    expect(
      formatItineraryBuddyRecruitHintMessage({
        recruitingCount: 8,
        highlightGenre: 'Techno',
      }),
    ).toBe('同场喜欢 Techno 的 8 人也在招募，去看看能否结伴同行。');
  });

  it('returns null when no recruiters', () => {
    expect(
      formatItineraryBuddyRecruitHintMessage({
        recruitingCount: 0,
        highlightGenre: 'House',
      }),
    ).toBeNull();
  });
});
