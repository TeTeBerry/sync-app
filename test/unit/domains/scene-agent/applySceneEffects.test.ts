import { describe, expect, it, vi } from 'vitest';
import {
  applySceneEffects,
  findSceneInsightLine,
} from '@/domains/scene-agent/applySceneEffects';
import type { SceneEffect } from '@sync/scene-contracts';

describe('applySceneEffects', () => {
  it('dispatches recruit_search effects', () => {
    const onInsightLine = vi.fn();
    const onReorderPosts = vi.fn();
    const effects: SceneEffect[] = [
      {
        type: 'insight_line',
        text: '上海出发',
        variant: 'parsed',
      },
      {
        type: 'reorder_posts',
        postIds: ['post-1'],
        items: [
          {
            id: 'post-1',
            name: 'A',
            location: '上海',
            tags: [],
            avatar: '',
          },
        ],
        totalMatched: 1,
        totalScanned: 3,
        parsed: { searchTerms: ['上海出发'] },
      },
    ];

    const result = applySceneEffects(effects, { onInsightLine, onReorderPosts });

    expect(onInsightLine).toHaveBeenCalledWith({
      text: '上海出发',
      variant: 'parsed',
    });
    expect(onReorderPosts).toHaveBeenCalledWith(
      expect.objectContaining({ postIds: ['post-1'], totalMatched: 1 }),
    );
    expect(findSceneInsightLine(result.insightLines, 'parsed')).toBe('上海出发');
    expect(result.reorderPosts?.items).toHaveLength(1);
  });
});
