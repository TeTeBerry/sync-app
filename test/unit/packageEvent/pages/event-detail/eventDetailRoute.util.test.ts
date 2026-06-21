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
      openCommentsOnMount: false,
      openGuideOnMount: false,
    });
  });

  it('parses openComments flag from query', () => {
    expect(
      parseEventDetailRouteFlags({
        postId: 'post-1',
        openComments: '1',
      }),
    ).toEqual({
      highlightPostId: 'post-1',
      focusPostsOnMount: false,
      openBuddyPostOnMount: false,
      openCommentsOnMount: true,
      openGuideOnMount: false,
    });
  });

  it('defaults route flags when query params are absent', () => {
    expect(parseEventDetailRouteFlags({})).toEqual({
      highlightPostId: '',
      focusPostsOnMount: false,
      openBuddyPostOnMount: false,
      openCommentsOnMount: false,
      openGuideOnMount: false,
    });
  });

  it('warms AI assistant only after deferred mount gate opens', () => {
    expect(shouldWarmEventDetailAi(false)).toBe(false);
    expect(shouldWarmEventDetailAi(true)).toBe(true);
  });
});
