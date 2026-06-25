import { hideThemedLoading, showThemedLoading } from '@/utils/themedLoading';
import { generateTravelGuide } from '@/api/sync/travelGuide';
import { isApiEnabled } from '@/constants/api';
import { getTravelGuideGeneratingText } from '@/constants/aiCtaLabels';
import { saveTravelGuideDetail } from '@/domains/travel-guide/utils/travelGuideDetailStorage';
import type { AiGuidePlanFormValues } from '@/types/travelGuide';
import { goAiTravelGuide } from '@/utils/route';
import { requireAuth } from '@/utils/authGate';
import { t } from '@/i18n';
import { showAppToast } from '@/utils/appToast';

function createGuideId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function runTravelGuideGeneration(
  activityLegacyId: number,
  form: AiGuidePlanFormValues,
  guideId?: string,
): Promise<void> {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    showAppToast('travelPlan.pleaseEnterActivity', { icon: 'none' });
    return;
  }

  const execute = async () => {
    if (!isApiEnabled()) {
      showAppToast('travelPlan.pleaseConfigureApi', { icon: 'none' });
      return;
    }

    showThemedLoading({ title: getTravelGuideGeneratingText(), mask: true });
    const resolvedGuideId = guideId?.trim() || createGuideId();

    try {
      const { plan } = await generateTravelGuide(activityLegacyId, {
        ...form,
        guideId: resolvedGuideId,
      });
      saveTravelGuideDetail(resolvedGuideId, {
        plan,
        form,
        activityLegacyId,
      });
      goAiTravelGuide(resolvedGuideId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('travelPlan.guideGenerationFailed');
      showAppToast(message, { raw: true, icon: 'none' });
    } finally {
      hideThemedLoading();
    }
  };

  requireAuth(() => void execute(), 'ai_assistant');
}
