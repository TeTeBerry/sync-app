import { describe, expect, it } from 'vitest';
import { sumProfilePostLikes } from '@/utils/profileLikes';

describe('sumProfilePostLikes', () => {
  it('sums positive like counts on owner posts', () => {
    expect(sumProfilePostLikes([{ likes: 24 }, { likes: 31 }, { likes: 18 }])).toBe(73);
  });

  it('ignores invalid or negative values', () => {
    expect(
      sumProfilePostLikes([
        { likes: 5 },
        { likes: -1 },
        { likes: Number.NaN },
        { likes: 0 },
      ]),
    ).toBe(5);
  });
});
