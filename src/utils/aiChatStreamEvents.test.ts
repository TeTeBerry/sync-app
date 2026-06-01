import { describe, expect, it } from 'vitest';
import { parseStreamEventPayload } from './aiChatStreamEvents';

describe('parseStreamEventPayload', () => {
  it('parses legacy chunk and typed delta frames', () => {
    expect(parseStreamEventPayload({ chunk: 'hi' })).toEqual({
      type: 'delta',
      content: 'hi',
    });
    expect(parseStreamEventPayload({ type: 'delta', content: 'x' })).toEqual({
      type: 'delta',
      content: 'x',
    });
  });

  it('ignores connected and REST envelopes', () => {
    expect(parseStreamEventPayload({ type: 'connected', sessionId: 's1' })).toBeNull();
    expect(parseStreamEventPayload({ code: 200, message: 'ok', data: {} })).toBeNull();
  });

  it('parses post_recommendations and server error', () => {
    expect(
      parseStreamEventPayload({
        type: 'post_recommendations',
        posts: [{ postId: 'p1', snippet: 'x', authorName: 'A', eventTitle: 'E' }],
        degraded: true,
      }),
    ).toEqual({
      type: 'post_recommendations',
      posts: [{ postId: 'p1', snippet: 'x', authorName: 'A', eventTitle: 'E' }],
      degraded: true,
    });
    expect(parseStreamEventPayload({ type: 'error', message: 'quota' })).toEqual({
      type: 'error',
      message: 'quota',
    });
  });
});
