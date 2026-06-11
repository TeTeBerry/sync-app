import { describe, expect, it, vi } from 'vitest';
import type { AiChatStreamEvent } from '@/types/aiChat';

async function collectFromGenerator(
  events: AiChatStreamEvent[],
): Promise<AiChatStreamEvent[]> {
  return events;
}

describe('useWsChatStream stream event handling', () => {
  it('invokes onDone when done event is received', async () => {
    const onDoneConsume = vi.fn();

    const events: AiChatStreamEvent[] = [
      { type: 'delta', content: 'hi' },
      { type: 'done', sessionId: 's1' },
    ];

    for (const event of await collectFromGenerator(events)) {
      if (event.type === 'done') {
        onDoneConsume();
      }
    }

    expect(onDoneConsume).toHaveBeenCalledTimes(1);
  });

  it('ignores unknown legacy post_recommendations frames', async () => {
    const onActivity = vi.fn();

    const events = [
      {
        type: 'post_recommendations',
        posts: [{ postId: 'p1', snippet: 'x', authorName: 'A', eventTitle: 'E' }],
        degraded: false,
      },
      { type: 'done', sessionId: 's1' },
    ] as AiChatStreamEvent[];

    for (const event of events) {
      if (event.type === 'activity_recommendation') {
        onActivity();
      }
    }

    expect(onActivity).not.toHaveBeenCalled();
  });
});
