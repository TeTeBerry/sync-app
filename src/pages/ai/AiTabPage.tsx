import './assistant/AiAssistantPage.scss';
import { type FC } from 'react';
import { ProfileTabErrorBoundary } from '../../components/profile/ProfileTabErrorBoundary';
import { AiAssistantChat } from './assistant/AiAssistantChat';
import { useAiAssistantPage } from './assistant/useAiAssistantPage';
import { FestivalPlanSummaryBar } from '../../domains/festival-plan/FestivalPlanSummaryBar';
import { LoginInterceptHost } from '../../components/auth/LoginInterceptHost';
import { useEndRouteTransitionOnShow } from '../../hooks/useEndRouteTransitionOnShow';
import { ROUTES } from '../../utils/route';
import { AiTabHero } from './components/AiTabHero';
import { AiTabContextCard } from './components/AiTabContextCard';
import { AiQuickActions } from './components/AiQuickActions';
import { View } from '@tarojs/components';

const AiTabPage: FC = () => {
  useEndRouteTransitionOnShow(ROUTES.AI);
  const page = useAiAssistantPage();

  const openActivityPicker = () => page.activityBindingActions?.openActivityPicker();

  return (
    <View data-cmp="AiTab" className="s-page-with-tabbar">
      <View
        className={[
          's-page-with-tabbar__main',
          's-ai-assistant',
          's-ai-assistant--tab',
          page.userGender === 'female' && 's-ai-assistant--female',
          page.userGender === 'male' && 's-ai-assistant--male',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <AiTabHero navInsets={page.navInsets} />

        <AiTabContextCard
          showEventContext={page.showEventContext}
          activityLoading={page.activityQuery.isLoading}
          activityTitle={page.activityTitle}
          activityMeta={page.activityMeta}
          onSwitchActivity={openActivityPicker}
          onPickActivity={openActivityPicker}
          planSlot={
            page.showEventContext && page.festivalPlan ? (
              <FestivalPlanSummaryBar
                embedded
                checklist={page.festivalPlan}
                onTaskPress={page.handleFestivalPlanTaskPress}
                onLayoutChange={page.handleChromeLayoutChange}
              />
            ) : null
          }
        />

        {page.showEventContext && page.quickActionsHandlers ? (
          <AiQuickActions
            onLineupPress={page.quickActionsHandlers.openLineup}
            onSchedulePress={page.quickActionsHandlers.openSchedule}
            hasItinerary={Boolean(
              page.festivalPlan?.tasks.find((task) => task.key === 'itinerary')?.done,
            )}
            onLayoutChange={page.handleChromeLayoutChange}
          />
        ) : null}

        <View className="s-ai-assistant__body">
          <View className="s-ai-assistant__panel">
            <ProfileTabErrorBoundary logTag="AiTab">
              <AiAssistantChat
                initialMessage={page.pendingInitialMessage}
                initialOpenAiGuideSheet={page.pendingOpenAiGuideSheet}
                initialOpenItinerarySheet={page.pendingOpenItinerarySheet}
                initialOpenBuddyPostSheet={page.pendingOpenBuddyPostSheet}
                initialPrefillTravelGuideForm={page.pendingPrefillGuideForm}
                initialAutoRunTravelGuideForm={page.pendingAutoGuideForm}
                pageShowSeq={page.pageShowSeq}
                activityLegacyId={page.activityLegacyId}
                activityTitle={page.activityTitle}
                activityLocation={page.activityQuery.data?.location}
                onInitialMessageSent={page.handleInitialMessageSent}
                onMessageCountChange={page.onChatMessagesChange}
                layoutRemeasureKey={page.layoutRemeasureKey}
                onChatChromeLayoutChange={page.handleChromeLayoutChange}
                userAvatar={page.profileUserData.avatar}
                userName={page.profileUserData.name}
                userGender={page.userGender}
                onFestivalPlanActionsChange={page.setFestivalPlanActions}
                onActivityBindingActionsChange={page.setActivityBindingActions}
                onAiQuickActionsChange={page.setQuickActionsHandlers}
                festivalPlanNextTaskKey={page.festivalPlan?.nextTaskKey}
                festivalPlanHasItinerary={Boolean(
                  page.festivalPlan?.tasks.find((task) => task.key === 'itinerary')
                    ?.done,
                )}
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
