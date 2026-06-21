import Taro from '@tarojs/taro';
import { generateTravelGuide } from '@/api/sync/travelGuide';
import { isApiEnabled } from '@/constants/api';
import { saveTravelGuideDetail } from '@/domains/travel-guide/utils/travelGuideDetailStorage';
import type { AiGuidePlanFormValues } from '@/types/travelGuide';
import { goAiTravelGuide } from '@/utils/route';
import { requireAuth } from '@/utils/authGate';
import { t } from '@/i18n';

function createGuideId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function runTravelGuideGeneration(
  activityLegacyId: number,
  form: AiGuidePlanFormValues,
): Promise<void> {
  if (!Number.isFinite(activityLegacyId) || activityLegacyId <= 0) {
    void Taro.showToast({ title: t('travelPlan.pleaseEnterActivity'), icon: 'none' });
    return;
  }

  const execute = async () => {
    if (!isApiEnabled()) {
      void Taro.showToast({ title: t('travelPlan.pleaseConfigureApi'), icon: 'none' });
      return;
    }

    void Taro.showLoading({ title: t('travelPlan.generatingTravelGuide'), mask: true });
    const guideId = createGuideId();

    try {
      const { plan } = await generateTravelGuide(activityLegacyId, {
        ...form,
        guideId,
      });
      saveTravelGuideDetail(guideId, {
        plan,
        form,
        activityLegacyId,
      });
      goAiTravelGuide(guideId);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('travelPlan.guideGenerationFailed');
      void Taro.showToast({ title: message, icon: 'none' });
    } finally {
      Taro.hideLoading();
    }
  };

  requireAuth(() => void execute(), 'ai_assistant');
}
