import { useCallback } from 'react';
import { runScene } from '@/api/sync/sceneRun';
import { applySceneEffects } from '@/domains/scene-agent/applySceneEffects';
import type { BuddyPostComposeCandidate } from '@/types/partner';
import type { EventDetailPost } from '@/types/partner';

export type RecruitApplyComposeResult = {
  candidates: BuddyPostComposeCandidate[];
  disclaimer: string | null;
};

export function useRecruitApplyCompose(activityLegacyId: number) {
  const composeApplyDraft = useCallback(
    async (
      post: EventDetailPost,
      options?: { applicantName?: string; applicantPrefs?: string },
    ): Promise<RecruitApplyComposeResult | null> => {
      if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
        return null;
      }

      try {
        const response = await runScene({
          scene: 'recruit_apply_compose',
          activityLegacyId,
          context: {
            trigger: 'sheet_submit',
            postId: post.id,
            postSummary: post.bodyPreview || post.body || '',
            applicantName: options?.applicantName,
            applicantPrefs: options?.applicantPrefs,
          },
        });
        const applied = applySceneEffects(response.effects);
        if (!applied.candidates?.items.length) {
          return null;
        }
        return {
          candidates: applied.candidates.items,
          disclaimer: response.disclaimer?.trim() || null,
        };
      } catch {
        return null;
      }
    },
    [activityLegacyId],
  );

  return { composeApplyDraft };
}
