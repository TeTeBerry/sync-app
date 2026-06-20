import './ai-travel-guide.scss';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { Button } from '../../../components/ui';
import { TravelGuideDetailView } from '@/domains/travel-guide/components/TravelGuideDetailView';
import { TravelPlanReceiptOcrTip } from '@/domains/travel-plan';
import { useAiTravelGuidePage } from '@/domains/travel-guide/hooks/useAiTravelGuidePage';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { FileText, RefreshCw, Share2 } from '../../../components/icons';
import { getRegenerateCta, getTravelGuideTitle } from '../../../constants/aiCtaLabels';
import { useT } from '@/hooks/useI18n';
import { AI_TRAVEL_GUIDE_DISCLAIMER } from '../../../constants/aiDisclosure';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { ScrollView, Text, View } from '@tarojs/components';

const AiTravelGuidePage = () => {
  useEndRouteTransitionOnShow();
  const page = useAiTravelGuidePage();
  const t = useT();
  usePageRouteReady(Boolean(page.payload) && !page.loading);

  return (
    <View data-cmp="AiTravelGuidePage" className="s-ai-travel-guide-page">
      <PageNavigation title={getTravelGuideTitle()} fallback={page.navFallback} />

      {page.loading ? (
        <ThemedPageLoader
          variant="spinner"
          label={t('travelGuide.loading')}
          minHeight={280}
        />
      ) : page.payload ? (
        <View className="s-ai-travel-guide-page__body">
          <ScrollView
            scrollY
            enhanced
            showScrollbar={false}
            className="s-ai-travel-guide-page__scroll s-scrollbar-none"
            style={{ height: `${page.mainScrollHeight ?? 480}px` }}
          >
            <View className="s-ai-travel-guide-page__inner">
              <TravelGuideDetailView plan={page.payload.plan} />
              <TravelPlanReceiptOcrTip
                className="s-ai-travel-guide-page__ocr-tip"
                activityLegacyId={page.activityLegacyId}
              />
              <Text className="s-ai-travel-guide-page__disclaimer">
                {AI_TRAVEL_GUIDE_DISCLAIMER}
              </Text>
            </View>
          </ScrollView>

          <View className="s-ai-travel-guide-page__footer">
            <Button
              className="s-ai-travel-guide-page__footer-btn"
              hoverClass="s-ai-travel-guide-page__footer-btn--pressed"
              onClick={page.handleRegenerate}
            >
              <RefreshCw size={16} color="#fff" />
              <Text className="s-ai-travel-guide-page__footer-btn-label">
                {getRegenerateCta()}
              </Text>
            </Button>
            {page.isWeapp ? (
              <Button
                className="s-ai-travel-guide-page__footer-btn s-ai-travel-guide-page__footer-btn--primary"
                hoverClass="s-ai-travel-guide-page__footer-btn--pressed"
                openType="share"
              >
                <Share2 size={16} color="#fff" />
                <Text className="s-ai-travel-guide-page__footer-btn-label">
                  {t('travelGuide.share')}
                </Text>
              </Button>
            ) : null}
            <Button
              className="s-ai-travel-guide-page__footer-btn s-ai-travel-guide-page__footer-btn--ghost"
              hoverClass="s-ai-travel-guide-page__footer-btn--pressed"
              disabled={page.sharing}
              onClick={() => void page.handleCopyShare()}
            >
              <FileText size={16} color="#fff" />
              <Text className="s-ai-travel-guide-page__footer-btn-label">
                {t('travelGuide.copyText')}
              </Text>
            </Button>
          </View>
        </View>
      ) : (
        <View className="s-ai-travel-guide-page__empty">
          <Text className="s-ai-travel-guide-page__empty-title">
            {page.loadError ?? t('travelGuide.notFound')}
          </Text>
          <Text className="s-ai-travel-guide-page__empty-sub">
            {t('travelGuide.notFoundHint')}
          </Text>
        </View>
      )}
      <LoginInterceptHost />
    </View>
  );
};

export default AiTravelGuidePage;
