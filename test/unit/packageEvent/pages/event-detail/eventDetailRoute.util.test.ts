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
      artifactId: '',
    });
  });

  it('parses openBuddySheet and artifactId from query', () => {
    expect(
      parseEventDetailRouteFlags({
        openBuddySheet: '1',
        artifactId: ' art-1 ',
      }),
    ).toEqual({
      highlightPostId: '',
      focusPostsOnMount: false,
      openBuddyPostOnMount: true,
      openCommentsOnMount: false,
      openGuideOnMount: false,
      artifactId: 'art-1',
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
      artifactId: '',
    });
  });

  it('defaults route flags when query params are absent', () => {
    expect(parseEventDetailRouteFlags({})).toEqual({
      highlightPostId: '',
      focusPostsOnMount: false,
      openBuddyPostOnMount: false,
      openCommentsOnMount: false,
      openGuideOnMount: false,
      artifactId: '',
    });
  });

  it('warms AI assistant only after deferred mount gate opens', () => {
    expect(shouldWarmEventDetailAi(false)).toBe(false);
    expect(shouldWarmEventDetailAi(true)).toBe(true);
  });
});
