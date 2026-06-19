import { describe, expect, it } from 'vitest';
import { BUDDY_POST_PUBLISH_SUCCESS_MESSAGE } from '@/constants/ugcPublishCompliance';

describe('BUDDY_POST_PUBLISH_SUCCESS_MESSAGE', () => {
  it('is non-empty and includes self-screening guidance', () => {
    expect(BUDDY_POST_PUBLISH_SUCCESS_MESSAGE.length).toBeGreaterThan(0);
    expect(BUDDY_POST_PUBLISH_SUCCESS_MESSAGE).toContain('自行甄别');
    expect(BUDDY_POST_PUBLISH_SUCCESS_MESSAGE).toContain('公开');
  });

  it('does not imply ticketing or platform guarantee', () => {
    expect(BUDDY_POST_PUBLISH_SUCCESS_MESSAGE).not.toMatch(/票务|购票|担保/);
  });
});
