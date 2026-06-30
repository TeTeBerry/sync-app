import './ai-travel-guide.scss';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { Button } from '../../../components/ui';
import {
  TravelGuideBudgetCompareCards,
  TravelGuideDetailView,
  TravelGuideGenerationLoader,
  TravelGuidePeaceBanner,
  useAiTravelGuidePage,
} from '@/domains/travel-guide';
import { TravelPlanReceiptOcrTip } from '@/domains/travel-plan';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import {
  FileText,
  ChevronRight,
  RefreshCw,
  Share2,
  Sparkles,
  Users,
} from '../../../components/icons';
import { getRegenerateCta, getTravelGuideTitle } from '../../../constants/aiCtaLabels';
import { LazyAiGuidePlanSheet } from '../../../components/ai-chat/LazyAiGuidePlanSheet';
import { useT } from '@/hooks/useI18n';
import { getAiTravelGuideDisclaimer } from '../../../constants/aiDisclosure';
import { LoginInterceptHost } from '../../../components/auth/LoginInterceptHost';
import { ScrollView, Text, View } from '@tarojs/components';

const AiTravelGuidePage = () => {
  useEndRouteTransitionOnShow();
  const page = useAiTravelGuidePage();
  const t = useT();
  usePageRouteReady(Boolean(page.payload) && !page.showGenerationLoader);

  return (
    <View data-cmp="AiTravelGuidePage" className="s-ai-travel-guide-page">
      <PageNavigation title={getTravelGuideTitle()} fallback={page.navFallback} />

      {page.showGenerationLoader ? (
        <TravelGuideGenerationLoader
          progress={page.generationProgress}
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
              <TravelGuidePeaceBanner
                visible={page.showPeaceBanner}
                onDismiss={page.handleDismissPeaceBanner}
              />
              {page.payload.plan.accommodationNights > 0 ? (
                <TravelGuideBudgetCompareCards
                  headcount={page.payload.plan.headcount}
                  accommodationNights={page.payload.plan.accommodationNights}
                  budgetTierSnapshots={page.payload.plan.budgetTierSnapshots}
                  selectedTier={page.selectedBudgetTier}
                  updating={page.budgetTierUpdating}
                  onSelect={page.handleSelectBudgetTier}
                />
              ) : null}
              <TravelGuideDetailView
                plan={page.payload.plan}
                activityRegion={page.activityRegion}
                selectedBudgetTier={page.selectedBudgetTier}
              />
              <TravelPlanReceiptOcrTip
                activityLegacyId={page.activityLegacyId}
                headcount={page.payload.plan.headcount}
              />
              {page.showRecruitBridge ? (
                <View className="s-ai-travel-guide-page__recruit-bridge">
                  <View className="s-ai-travel-guide-page__recruit-bridge-head">
                    <View className="s-ai-travel-guide-page__recruit-bridge-badge">
                      <Sparkles
                        size={11}
                        color="#ffb340"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      <Text className="s-ai-travel-guide-page__recruit-bridge-badge-text s-ai-travel-guide-page__recruit-bridge-badge-text--post">
                        {t('travelGuide.recruitBridgeKicker')}
                      </Text>
                    </View>
                    <Text className="s-ai-travel-guide-page__recruit-bridge-title">
                      {t('travelGuide.recruitBridgeTitle')}
                    </Text>
                    <Text className="s-ai-travel-guide-page__recruit-bridge-hint">
                      {t('travelGuide.recruitBridgeHint')}
                    </Text>
                  </View>

                  <Button
                    className="s-ai-travel-guide-page__recruit-action"
                    hoverClass="s-ai-travel-guide-page__recruit-action--pressed"
                    onClick={page.handlePrefillRecruitPost}
                  >
                    <View
                      className="s-ai-travel-guide-page__recruit-action-icon s-ai-travel-guide-page__recruit-action-icon--post"
                      aria-hidden
                    >
                      <Users size={17} color="#ffb340" />
                    </View>
                    <View className="s-ai-travel-guide-page__recruit-action-main">
                      <Text className="s-ai-travel-guide-page__recruit-action-title">
                        {t('travelGuide.postRecruitCta')}
                      </Text>
                      <Text className="s-ai-travel-guide-page__recruit-action-sub">
                        {t('travelGuide.postRecruitSub')}
                      </Text>
                    </View>
                    <ChevronRight size={16} color="#636366" />
                  </Button>

                  <Text className="s-ai-travel-guide-page__recruit-bridge-footnote">
                    {t('travelGuide.recruitBridgeFootnote')}
                  </Text>
                </View>
              ) : null}
              <Text className="s-ai-travel-guide-page__disclaimer">
                {getAiTravelGuideDisclaimer()}
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
      ) : page.loading ? (
        <View className="s-ai-travel-guide-page__empty">
          <Text className="s-ai-travel-guide-page__empty-title">
            {t('travelGuide.loading')}
          </Text>
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
      {page.guideSheetOpen ? (
        <LazyAiGuidePlanSheet
          open
          defaultNights={page.guideDefaultNights}
          eventCity={page.guideEventCity}
          showDomesticGuideOptions={page.guideShowDomesticOptions}
          initialValues={page.guideSheetInitialValues}
          forceRegenerate
          onClose={page.closeGuideSheet}
          onSubmit={page.handleGuideSheetSubmit}
        />
      ) : null}
      <LoginInterceptHost />
    </View>
  );
};

export default AiTravelGuidePage;
