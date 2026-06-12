import { describe, expect, it } from 'vitest';
import { isBuddyPostIntent } from '@/utils/buddyPostIntent';

describe('buddyPostIntent', () => {
  it('matches explicit buddy post phrases', () => {
    expect(isBuddyPostIntent('组队发帖')).toBe(true);
    expect(isBuddyPostIntent('AI组队')).toBe(true);
    expect(isBuddyPostIntent('帮我发个组队帖')).toBe(true);
  });

  it('does not match post browsing phrases', () => {
    expect(isBuddyPostIntent('看看有没有组队帖')).toBe(false);
    expect(isBuddyPostIntent('有没有类似的帖子')).toBe(false);
  });
});
