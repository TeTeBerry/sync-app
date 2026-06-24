import { useCallback, useState } from 'react';
import Taro from '@tarojs/taro';
import type { AiComposePostsPayload } from '@/types/partner';
import { composeBuddyPostCandidates } from '@/api/sync/posts';
import type { BuddyPostComposeCandidate } from '@/types/partner';
import { t } from '@/i18n/translate';

type UseBuddyPostComposeOptions = {
  activityLegacyId?: number;
};

export function useBuddyPostCompose({ activityLegacyId }: UseBuddyPostComposeOptions) {
  const [candidates, setCandidates] = useState<BuddyPostComposeCandidate[]>([]);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generate = useCallback(
    async (
      payload: Omit<AiComposePostsPayload, 'activityLegacyId'>,
      options?: { regenerate?: boolean },
    ) => {
      if (
        activityLegacyId == null ||
        !Number.isFinite(activityLegacyId) ||
        activityLegacyId <= 0
      ) {
        void Taro.showToast({ title: t('posts.composeInvalidActivity'), icon: 'none' });
        return false;
      }

      setLoading(true);
      try {
        const result = await composeBuddyPostCandidates({
          activityLegacyId,
          ...payload,
          regenerate: options?.regenerate === true,
        });
        setCandidates(result.candidates);
        setDisclaimer(result.disclaimer);
        if (result.candidates.length === 1) {
          setSelectedId(result.candidates[0]!.id);
        } else {
          setSelectedId(null);
        }
        return true;
      } catch {
        void Taro.showToast({ title: t('posts.composeFailed'), icon: 'none' });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [activityLegacyId],
  );

  const reset = useCallback(() => {
    setCandidates([]);
    setDisclaimer(null);
    setSelectedId(null);
    setLoading(false);
  }, []);

  return {
    candidates,
    disclaimer,
    selectedId,
    loading,
    setSelectedId,
    generate,
    reset,
  };
}
