import './messages.scss';
import React, { useCallback } from 'react';
import { useDidShow } from '@tarojs/taro';
import { MessageCircle } from '../../../components/icons';
import { BottomNavSlot } from '../../../components/navigation/BottomNav';
import PageNavigation, {
  stackPageNavChromePx,
} from '../../../components/navigation/PageNavigation';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { useTeamChatSessionList } from '../../../hooks/useResolvedTempChat';
import { formatTimeAgo } from '../../../utils/dayTime';
import { goTempChat, ROUTES } from '../../../utils/route';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';

const MessagesPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const navInsets = useNavBarInsets();
  const headerChromePx = stackPageNavChromePx(navInsets);
  const mainScrollHeight = useTabPageMainHeight(headerChromePx);
  const { sessions, isLoading, refetch } = useTeamChatSessionList();

  useDidShow(() => {
    void refetch({ background: true });
  });

  const sortedSessions = [...sessions].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
  );

  const handleOpenSession = useCallback((sessionId: string) => {
    goTempChat(sessionId);
  }, []);

  return (
    <View data-cmp="MessagesPage" className="s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-messages">
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
              sortedSessions.map((session) => {
                const hasUnread = session.unreadCount > 0;
                const badgeLabel =
                  session.unreadCount > 99 ? '99+' : String(session.unreadCount);

                return (
                  <Button
                    key={session.id}
                    className={
                      hasUnread
                        ? 's-messages__item s-messages__item--unread'
                        : 's-messages__item'
                    }
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
                        <View className="s-messages__title">
                          <Text className="s-messages__name">{session.peerName}</Text>
                          {hasUnread ? (
                            <Text className="s-messages__badge">{badgeLabel}</Text>
                          ) : null}
                        </View>
                        <Text className="s-messages__time">
                          {formatTimeAgo(session.lastMessageAt)}
                        </Text>
                      </View>
                      <Text className="s-messages__preview">{session.lastMessage}</Text>
                    </View>
                  </Button>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      <BottomNavSlot />
    </View>
  );
};

export default MessagesPage;
