import { useCallback, useRef, useState } from 'react';
import { runScene } from '@/api/sync/sceneRun';
import { applySceneEffects } from '@/domains/scene-agent/applySceneEffects';
import type { SceneFestivalStoryResult } from '@/domains/scene-agent/applySceneEffects';

export function useFestivalStory(activityLegacyId?: number) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<SceneFestivalStoryResult | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const cacheRef = useRef<Map<number, SceneFestivalStoryResult>>(new Map());

  const load = useCallback(
    async (regenerate = false) => {
      if (!activityLegacyId || activityLegacyId <= 0) return;

      if (!regenerate && cacheRef.current.has(activityLegacyId)) {
        setStory(cacheRef.current.get(activityLegacyId) ?? null);
        return;
      }

      setLoading(true);
      setError(false);
      try {
        const response = await runScene({
          scene: 'festival_story',
          context: {
            activityLegacyId,
            trigger: 'page_enter',
            ...(regenerate ? { regenerate: true } : {}),
          },
        });
        const applied = applySceneEffects(response.effects);
        if (applied.festivalStory) {
          cacheRef.current.set(activityLegacyId, applied.festivalStory);
          setStory(applied.festivalStory);
        }
        setDisclaimer(response.disclaimer?.trim() || null);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    },
    [activityLegacyId],
  );

  const toggle = useCallback(() => {
    setExpanded((prev) => {
      const next = !prev;
      if (next && !story && !loading) {
        void load();
      }
      return next;
    });
  }, [load, loading, story]);

  const regenerate = useCallback(() => {
    void load(true);
  }, [load]);

  return {
    expanded,
    loading,
    story,
    disclaimer,
    error,
    toggle,
    regenerate,
  };
}
