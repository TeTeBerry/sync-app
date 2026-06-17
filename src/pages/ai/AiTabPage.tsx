import '../../packageAi/pages/ai-assistant/AiAssistantPage.scss';
import { type FC } from 'react';
import { CalendarDays, Zap } from '../../components/icons';
import TabPageHeader from '../../components/navigation/TabPageHeader';
import { Text, View } from '@tarojs/components';
import { ProfileTabErrorBoundary } from '../../components/profile/ProfileTabErrorBoundary';
import { AiAssistantChat } from '../../packageAi/pages/ai-assistant/AiAssistantChat';
import { useAiAssistantPage } from '../../packageAi/pages/ai-assistant/useAiAssistantPage';
import { FestivalPlanSummaryBar } from '../../domains/festival-plan/FestivalPlanSummaryBar';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { ROUTES } from '../../utils/route';

const AiTabPage: FC = () => {
  useEndRouteTransitionOnShow(ROUTES.AI);
  const page = useAiAssistantPage();

  return (
    <View data-cmp="AiTab" className="s-page-with-tabbar">
      <View
        className={[
          's-page-with-tabbar__main',
          's-ai-assistant',
          page.userGender === 'female' && 's-ai-assistant--female',
          page.userGender === 'male' && 's-ai-assistant--male',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <TabPageHeader
          title="AI助手"
          navInsets={page.navInsets}
          className="s-tab-page-header--ai"
        />

        {page.showEventContext ? (
          <View className="s-ai-assistant__event-context">
            <View className="s-ai-assistant__event-context-icon" aria-hidden>
              <CalendarDays size={14} />
            </View>
            <View className="s-ai-assistant__event-context-text">
              {page.activityQuery.isLoading && !page.activityTitle ? (
                <Text className="s-ai-assistant__event-context-title">
                  加载活动信息…
                </Text>
              ) : (
                <>
                  <Text className="s-ai-assistant__event-context-kicker">当前活动</Text>
                  <Text className="s-ai-assistant__event-context-title">
                    {page.activityTitle ?? '本场活动'}
                  </Text>
                  {page.activityMeta ? (
                    <Text className="s-ai-assistant__event-context-meta">
                      {page.activityMeta}
                    </Text>
                  ) : null}
                </>
              )}
            </View>
          </View>
        ) : null}

        {page.showEventContext && page.festivalPlan ? (
          <FestivalPlanSummaryBar
            checklist={page.festivalPlan}
            onTaskPress={page.handleFestivalPlanTaskPress}
          />
        ) : null}

        <View className="s-ai-assistant__body">
          <View className="s-ai-assistant__panel">
            <View className="s-ai-assistant__tab-status" aria-hidden>
              <Zap size={10} color="#64d2ff" />
              <Text className="s-ai-assistant__tab-status-text">在线 · 实时响应</Text>
            </View>
            <ProfileTabErrorBoundary logTag="AiTab">
              <AiAssistantChat
                initialMessage={page.pendingInitialMessage}
                initialOpenAiGuideSheet={page.pendingOpenAiGuideSheet}
                initialAutoRunTravelGuideForm={page.pendingAutoGuideForm}
                pageShowSeq={page.pageShowSeq}
                activityLegacyId={page.activityLegacyId}
                activityTitle={page.activityTitle}
                onInitialMessageSent={page.handleInitialMessageSent}
                onMessageCountChange={page.onChatMessagesChange}
                chatScrollHeight={page.chatScrollHeight}
                userAvatar={page.profileUserData.avatar}
                userName={page.profileUserData.name}
                userGender={page.userGender}
                onFestivalPlanActionsChange={page.setFestivalPlanActions}
              />
            </ProfileTabErrorBoundary>
          </View>
        </View>
      </View>

      <LoginInterceptHost />
    </View>
  );
};

export default AiTabPage;
