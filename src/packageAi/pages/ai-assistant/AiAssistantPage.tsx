import './AiAssistantPage.scss';
import { type FC } from 'react';
import { PageTabBarChrome } from '../../../components/navigation/BottomNav';
import { CalendarDays, Sparkles, Zap } from '../../../components/icons';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { Text, View } from '@tarojs/components';
import { ProfileTabErrorBoundary } from '../../../components/profile/ProfileTabErrorBoundary';
import { AiAssistantChat } from './AiAssistantChat';
import { useAiAssistantPage } from './useAiAssistantPage';

const AiAssistantPage: FC = () => {
  const page = useAiAssistantPage();

  return (
    <View data-cmp="AiAssistant" className="s-page-with-tabbar">
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
        <PageNavigation
          className="s-ai-assistant__header"
          tone="surface"
          centerAlign="start"
          onBack={page.handleBack}
          backAriaLabel={page.hasEventScope ? '返回活动详情' : '返回'}
          center={
            <View className="s-ai-assistant__header-main">
              <View className="s-ai-assistant__header-avatar" aria-hidden>
                <Sparkles size={18} />
                <Text className="s-ai-assistant__header-online" />
              </View>
              <View className="s-ai-assistant__header-text">
                {!page.hasEventScope ? (
                  <View className="s-ai-assistant__header-title-row">
                    <Text className="s-ai-assistant__header-title">AI 智能助手</Text>
                    <Text className="s-ai-assistant__ai-badge">
                      <Zap size={10} aria-hidden />
                      {'AI'}
                    </Text>
                  </View>
                ) : null}
                <Text className="s-ai-assistant__header-status">
                  {page.hasEventScope ? '正在对话' : '在线 · 实时响应'}
                </Text>
              </View>
            </View>
          }
          trailing={
            page.messageCount > 0 ? (
              <Text className="s-ai-assistant__message-count" aria-hidden>
                {page.messageCount}
              </Text>
            ) : undefined
          }
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

        <View className="s-ai-assistant__body">
          <View className="s-ai-assistant__panel">
            <ProfileTabErrorBoundary logTag="AiAssistant">
              <AiAssistantChat
                initialMessage={page.pendingInitialMessage}
                initialOpenAiGuideSheet={page.pendingOpenAiGuideSheet}
                initialAutoRunTravelGuideForm={page.pendingAutoGuideForm}
                pageShowSeq={page.pageShowSeq}
                activityLegacyId={page.activityLegacyId}
                activityTitle={page.activityTitle}
                onInitialMessageSent={page.handleInitialMessageSent}
                onMessageCountChange={page.setMessageCount}
                chatScrollHeight={page.chatScrollHeight}
                userAvatar={page.profileUserData.avatar}
                userName={page.profileUserData.name}
                userGender={page.userGender}
              />
            </ProfileTabErrorBoundary>
          </View>
        </View>
      </View>

      <PageTabBarChrome />
    </View>
  );
};

export default AiAssistantPage;
