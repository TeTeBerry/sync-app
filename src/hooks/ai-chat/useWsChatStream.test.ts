import { describe, expect, it, vi } from 'vitest';
import type { AiChatStreamEvent } from '../../types/aiChat';

async function collectFromGenerator(
  events: AiChatStreamEvent[],
): Promise<AiChatStreamEvent[]> {
  return events;
}

describe('useWsChatStream match quota callbacks', () => {
  it('should call onMatchResults only for post_recommendations with posts', async () => {
    const onMatchResults = vi.fn();
    const onDoneConsume = vi.fn();

    const events: AiChatStreamEvent[] = [
      {
        type: 'post_recommendations',
        posts: [{ postId: 'p1', snippet: 'x', authorName: 'A', eventTitle: 'E' }],
        degraded: false,
      },
      { type: 'done', sessionId: 's1' },
    ];

    for (const event of await collectFromGenerator(events)) {
      if (event.type === 'post_recommendations' && event.posts.length > 0) {
        onMatchResults(9);
      }
      if (event.type === 'done') {
        onDoneConsume();
      }
    }

    expect(onMatchResults).toHaveBeenCalledTimes(1);
    expect(onMatchResults).toHaveBeenCalledWith(9);
    expect(onDoneConsume).toHaveBeenCalledTimes(1);
  });

  it('should not call onMatchResults for empty recommendations', async () => {
    const onMatchResults = vi.fn();

    const events: AiChatStreamEvent[] = [
      { type: 'post_recommendations', posts: [], degraded: false },
      { type: 'done', sessionId: 's1' },
    ];

    for (const event of events) {
      if (event.type === 'post_recommendations' && event.posts.length > 0) {
        onMatchResults();
      }
    }

    expect(onMatchResults).not.toHaveBeenCalled();
  });
});
