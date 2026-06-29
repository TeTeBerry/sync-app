import { buildTravelGuideGenerationPath } from '@/domains/travel-guide/utils/travelGuideWechatShare.util';
import type { AiGuidePlanFormValues } from '@/types/travelGuide';
import { goAiTravelGuideGeneration } from '@/utils/route';
import { requireAuth } from '@/utils/authGate';
import { isApiEnabled } from '@/constants/api';
import { showAppToast } from '@/utils/appToast';

function createGuideId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function runTravelGuideGeneration(
  activityLegacyId: number,
  form: AiGuidePlanFormValues,
  guideId?: string,
): void {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    showAppToast('travelPlan.pleaseEnterActivity', { icon: 'none' });
    return;
  }

  requireAuth(() => {
    if (!isApiEnabled()) {
      showAppToast('travelPlan.pleaseConfigureApi', { icon: 'none' });
      return;
    }

    const isRegenerate = Boolean(guideId?.trim());
    const resolvedGuideId = guideId?.trim() || createGuideId();
    const forceRegenerate = Boolean(isRegenerate || form.forceRegenerate);
    const path = buildTravelGuideGenerationPath(
      resolvedGuideId,
      { form, activityLegacyId },
      { forceRegenerate },
    );

    goAiTravelGuideGeneration(path);
  }, 'ai_assistant');
}
