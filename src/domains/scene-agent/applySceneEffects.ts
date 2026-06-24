import type { InsightLineVariant, SceneEffect } from '@sync/scene-contracts';
import type { BuddyPostSearchParsed } from '@/types/backend';
import type { EventDetailPost } from '@/types/partner';

export type SceneInsightLine = {
  text: string;
  variant?: InsightLineVariant;
};

export type SceneReorderPostsResult = {
  postIds: string[];
  items: EventDetailPost[];
  totalMatched: number;
  totalScanned: number;
  parsed?: BuddyPostSearchParsed;
};

export type SceneEffectHandlers = {
  onInsightLine?: (line: SceneInsightLine) => void;
  onReorderPosts?: (result: SceneReorderPostsResult) => void;
  onPrefillQuery?: (query: string, source?: string) => void;
};

export type ApplySceneEffectsResult = {
  insightLines: SceneInsightLine[];
  reorderPosts: SceneReorderPostsResult | null;
  prefillQuery: string | null;
};

export function applySceneEffects(
  effects: SceneEffect[] | null | undefined,
  handlers: SceneEffectHandlers = {},
): ApplySceneEffectsResult {
  const insightLines: SceneInsightLine[] = [];
  let reorderPosts: SceneReorderPostsResult | null = null;
  let prefillQuery: string | null = null;

  for (const effect of effects ?? []) {
    switch (effect.type) {
      case 'insight_line': {
        const line: SceneInsightLine = {
          text: effect.text,
          variant: effect.variant,
        };
        insightLines.push(line);
        handlers.onInsightLine?.(line);
        break;
      }
      case 'reorder_posts': {
        reorderPosts = {
          postIds: effect.postIds,
          items: effect.items,
          totalMatched: effect.totalMatched,
          totalScanned: effect.totalScanned,
          parsed: effect.parsed,
        };
        handlers.onReorderPosts?.(reorderPosts);
        break;
      }
      case 'prefill_query': {
        prefillQuery = effect.query;
        handlers.onPrefillQuery?.(effect.query, effect.source);
        break;
      }
      default:
        break;
    }
  }

  return { insightLines, reorderPosts, prefillQuery };
}

export function findSceneInsightLine(
  insightLines: SceneInsightLine[],
  variant: InsightLineVariant,
): string | null {
  const line = insightLines.find((item) => item.variant === variant);
  return line?.text?.trim() || null;
}
