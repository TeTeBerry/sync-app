import { describe, expect, it } from 'vitest';
import { parseStreamEventPayload } from '@/utils/aiChatStreamEvents';

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

  it('parses message_complete, conversation_patch, and post_created', () => {
    expect(
      parseStreamEventPayload({
        type: 'message_complete',
        content: 'final',
        requestId: 'r1',
      }),
    ).toEqual({
      type: 'message_complete',
      content: 'final',
      requestId: 'r1',
    });
    expect(
      parseStreamEventPayload({
        type: 'conversation_patch',
        state: { version: 1, flow: 'idle' },
      }),
    ).toEqual({
      type: 'conversation_patch',
      state: { version: 1, flow: 'idle' },
    });
    expect(
      parseStreamEventPayload({
        type: 'post_created',
        postId: 'p1',
        activityLegacyId: 4,
      }),
    ).toEqual({
      type: 'post_created',
      postId: 'p1',
      activityLegacyId: 4,
      post: undefined,
    });
  });

  it('parses activity_recommendation and server error', () => {
    expect(
      parseStreamEventPayload({
        type: 'activity_recommendation',
        activity: {
          activityLegacyId: 4,
          title: '风暴电音节',
          date: '06/13',
          location: '深圳',
        },
      }),
    ).toEqual({
      type: 'activity_recommendation',
      activity: {
        activityLegacyId: 4,
        title: '风暴电音节',
        date: '06/13',
        location: '深圳',
      },
    });
    expect(parseStreamEventPayload({ type: 'error', message: 'quota' })).toEqual({
      type: 'error',
      message: 'quota',
    });
  });
});
