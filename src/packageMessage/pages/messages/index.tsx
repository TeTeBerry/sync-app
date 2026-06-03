import './messages.scss';
import React, { useCallback } from 'react';
import { useDidShow } from '@tarojs/taro';
import { MessageCircle } from '../../../components/icons';
import { TempChatRetentionBanner } from '../../../components/message/TempChatRetentionBanner';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useStackPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { useTeamChatSessionList } from '../../../hooks/useResolvedTempChat';
import { useTempChatStore } from '../../../stores/tempChatStore';
import { formatTimeAgo } from '../../../utils/dayTime';
import { goTempChat, ROUTES } from '../../../utils/route';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';

const MessagesPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const mainScrollHeight = useStackPageMainHeight();
  const { apiEnabled, sessions, isLoading, refetch, hydrate } =
    useTeamChatSessionList();
  const purgeExpired = useTempChatStore((state) => state.purgeExpiredSessions);

  useDidShow(() => {
    hydrate();
    purgeExpired();
    if (apiEnabled) {
      void refetch();
    }
  });

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  const handleOpenSession = useCallback((sessionId: string) => {
    goTempChat(sessionId);
  }, []);

  return (
    <View data-cmp="MessagesPage" className="s-messages">
      <PageNavigation title="私信" fallback={ROUTES.HOME} tone="surface" />

      <ScrollView
        scrollY
        enhanced
        showScrollbar={false}
        className="s-messages__scroll s-scrollbar-none"
        style={
          mainScrollHeight != null ? { height: `${mainScrollHeight}px` } : undefined
        }
      >
        <View className="s-messages__inner">
          {isLoading ? (
            <Text className="s-messages__empty-hint">加载中…</Text>
          ) : sortedSessions.length === 0 ? (
            <View className="s-messages__empty">
              <View className="s-messages__empty-icon">
                <MessageCircle size={24} color="#ff0066" />
              </View>
              <Text className="s-messages__empty-title">暂无会话</Text>
              <Text className="s-messages__empty-hint">
                申请组队或收到申请后，可在这里与对方沟通
              </Text>
            </View>
          ) : (
            <>
              <TempChatRetentionBanner session={sortedSessions[0]} />
              {sortedSessions.map((session) => (
                <Button
                  key={session.id}
                  className="s-messages__item"
                  onClick={() => handleOpenSession(session.id)}
                >
                  <View
                    className="s-messages__avatar"
                    style={
                      session.peerAvatar
                        ? { backgroundImage: `url(${session.peerAvatar})` }
                        : undefined
                    }
                    aria-hidden
                  />
                  <View className="s-messages__body">
                    <View className="s-messages__row">
                      <Text className="s-messages__name">{session.peerName}</Text>
                      <Text className="s-messages__time">
                        {formatTimeAgo(session.lastMessageAt)}
                      </Text>
                    </View>
                    <Text className="s-messages__preview">{session.lastMessage}</Text>
                  </View>
                  {session.unreadCount > 0 ? (
                    <Text className="s-messages__badge">{session.unreadCount}</Text>
                  ) : null}
                </Button>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default MessagesPage;
