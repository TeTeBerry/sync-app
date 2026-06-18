import { describe, expect, it } from 'vitest';
import {
  parseEventDetailRouteFlags,
  shouldWarmEventDetailAi,
} from '@/packageEvent/pages/event-detail/eventDetailRoute.util';

describe('eventDetailRoute.util', () => {
  it('parses post highlight, focus, and buddy-post sheet flags from query', () => {
    expect(
      parseEventDetailRouteFlags({
        postId: ' abc ',
        focusPosts: '1',
        openBuddyPost: '1',
      }),
    ).toEqual({
      highlightPostId: 'abc',
      focusPostsOnMount: true,
      openBuddyPostOnMount: true,
    });
  });

  it('defaults route flags when query params are absent', () => {
    expect(parseEventDetailRouteFlags({})).toEqual({
      highlightPostId: '',
      focusPostsOnMount: false,
      openBuddyPostOnMount: false,
    });
  });

  it('warms AI assistant only after deferred mount gate opens', () => {
    expect(shouldWarmEventDetailAi(false)).toBe(false);
    expect(shouldWarmEventDetailAi(true)).toBe(true);
  });
});
