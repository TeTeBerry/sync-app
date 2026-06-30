import { useCallback, useEffect, useRef, useState } from 'react';
import { runScene } from '@/api/sync/sceneRun';
import { applySceneEffects } from '@/domains/scene-agent/applySceneEffects';
import type { SceneDjBioResult } from '@/domains/scene-agent/applySceneEffects';

const SHORT_BIO_THRESHOLD = 40;

type UseLineupDjBioParams = {
  activityLegacyId?: number;
  artistName?: string;
  genre?: string;
  catalogBio?: string;
  enabled: boolean;
};

export function useLineupDjBio({
  activityLegacyId,
  artistName,
  genre,
  catalogBio,
  enabled,
}: UseLineupDjBioParams) {
  const [aiBio, setAiBio] = useState<SceneDjBioResult | null>(null);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const requestedRef = useRef<string | null>(null);

  const catalogBioTrimmed = catalogBio?.trim() ?? '';
  const needsAiBio =
    enabled &&
    Boolean(artistName?.trim()) &&
    Boolean(activityLegacyId && activityLegacyId > 0) &&
    catalogBioTrimmed.length < SHORT_BIO_THRESHOLD;

  const load = useCallback(async () => {
    if (!needsAiBio || !activityLegacyId || !artistName?.trim()) return;

    const cacheKey = `${activityLegacyId}:${artistName}`;
    if (requestedRef.current === cacheKey && aiBio) return;

    setLoading(true);
    try {
      const response = await runScene({
        scene: 'lineup_dj',
        activityLegacyId,
        context: {
          activityLegacyId,
          artistName: artistName.trim(),
          genre: genre?.trim() || undefined,
          trigger: 'page_enter',
        },
      });
      const applied = applySceneEffects(response.effects);
      if (applied.djBio) {
        requestedRef.current = cacheKey;
        setAiBio(applied.djBio);
      }
      setDisclaimer(response.disclaimer?.trim() || null);
    } catch {
      // best-effort AI bio
    } finally {
      setLoading(false);
    }
  }, [activityLegacyId, aiBio, artistName, genre, needsAiBio]);

  useEffect(() => {
    if (!needsAiBio) {
      setAiBio(null);
      setDisclaimer(null);
      return;
    }
    void load();
  }, [load, needsAiBio]);

  const displayBio =
    catalogBioTrimmed.length >= SHORT_BIO_THRESHOLD
      ? catalogBioTrimmed
      : aiBio?.bio?.trim() || catalogBioTrimmed;

  return {
    displayBio,
    loading,
    disclaimer: aiBio ? disclaimer : null,
    aiGenerated: Boolean(
      aiBio?.bio?.trim() && catalogBioTrimmed.length < SHORT_BIO_THRESHOLD,
    ),
  };
}
