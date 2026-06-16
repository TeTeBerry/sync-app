import './ai-travel-guide.scss';
import PageNavigation from '../../../components/navigation/PageNavigation';
import ThemedPageLoader from '../../../components/ThemedPageLoader';
import { Button } from '../../../components/ui';
import { TravelGuideDetailView } from '@/domains/travel-guide/components/TravelGuideDetailView';
import { useAiTravelGuidePage } from '@/domains/travel-guide/hooks/useAiTravelGuidePage';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { usePageRouteReady } from '../../../hooks/usePageRouteReady';
import { FileText, RefreshCw, Share2 } from '../../../components/icons';
import { AI_TRAVEL_GUIDE_DISCLAIMER } from '../../../constants/aiDisclosure';
import { ScrollView, Text, View } from '@tarojs/components';

const AiTravelGuidePage = () => {
  useEndRouteTransitionOnShow();
  const page = useAiTravelGuidePage();
  usePageRouteReady(Boolean(page.payload) && !page.loading);

  return (
    <View data-cmp="AiTravelGuidePage" className="s-ai-travel-guide-page">
      <PageNavigation title="AI 出行攻略" fallback={page.navFallback} />

      {page.loading ? (
        <ThemedPageLoader variant="spinner" label="正在加载攻略…" minHeight={280} />
      ) : page.payload ? (
        <>
          <ScrollView
            scrollY
            enhanced
            showScrollbar={false}
            className="s-ai-travel-guide-page__scroll s-scrollbar-none"
            style={
              page.mainScrollHeight != null
                ? { height: `${page.mainScrollHeight}px` }
                : undefined
            }
          >
            <View className="s-ai-travel-guide-page__inner">
              <TravelGuideDetailView plan={page.payload.plan} />
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
              <Text className="s-ai-travel-guide-page__footer-btn-label">重新规划</Text>
            </Button>
            {page.isWeapp ? (
              <Button
                className="s-ai-travel-guide-page__footer-btn s-ai-travel-guide-page__footer-btn--primary"
                hoverClass="s-ai-travel-guide-page__footer-btn--pressed"
                openType="share"
              >
                <Share2 size={16} color="#fff" />
                <Text className="s-ai-travel-guide-page__footer-btn-label">
                  分享给好友
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
              <Text className="s-ai-travel-guide-page__footer-btn-label">复制文案</Text>
            </Button>
          </View>
        </>
      ) : (
        <View className="s-ai-travel-guide-page__empty">
          <Text className="s-ai-travel-guide-page__empty-title">
            {page.loadError ?? '攻略不存在或已过期'}
          </Text>
          <Text className="s-ai-travel-guide-page__empty-sub">
            请返回 AI 对话重新生成出行攻略
          </Text>
        </View>
      )}
    </View>
  );
};

export default AiTravelGuidePage;
