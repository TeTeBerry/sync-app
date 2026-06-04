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
  const mainScrollHeight = useTabPageMainHeight(headerChromePx) ?? 480;
  const { sessions, isLoading, isError, refetch } = useTeamChatSessionList();

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
          showScrollbar={false}
          className="s-messages__scroll s-scrollbar-none"
          style={{ height: `${mainScrollHeight}px` }}
        >
          <View className="s-messages__inner">
            {isLoading ? (
              <Text className="s-messages__empty-hint">加载中…</Text>
            ) : isError ? (
              <View className="s-messages__empty">
                <Text className="s-messages__empty-title">加载失败</Text>
                <Text className="s-messages__empty-hint">请检查网络后重试</Text>
                <Button
                  className="s-messages__retry"
                  hoverClass="s-messages__retry--pressed"
                  onClick={() => void refetch({ background: false })}
                >
                  <Text className="s-messages__retry-label">重新加载</Text>
                </Button>
              </View>
            ) : sortedSessions.length === 0 ? (
              <View className="s-messages__empty">
                <View className="s-messages__empty-icon">
                  <MessageCircle size={24} color="#ff0066" />
                </View>
                <Text className="s-messages__empty-title">暂无会话</Text>
                <Text className="s-messages__empty-hint">
                  发起沟通后，会话会出现在这里
                </Text>
              </View>
            ) : (
              <View className="s-messages__list">
                {sortedSessions.map((session) => {
                  const hasUnread = session.unreadCount > 0;
                  const badgeLabel =
                    session.unreadCount > 99 ? '99+' : String(session.unreadCount);

                  return (
                    <Button
                      key={session.id}
                      className={[
                        's-messages__item',
                        hasUnread && 's-messages__item--unread',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      hoverClass="s-messages__item--pressed"
                      onClick={() => handleOpenSession(session.id)}
                    >
                      <View className="s-messages__avatar-wrap" aria-hidden>
                        <View
                          className="s-messages__avatar"
                          style={
                            session.peerAvatar
                              ? { backgroundImage: `url(${session.peerAvatar})` }
                              : undefined
                          }
                        />
                        {hasUnread ? <View className="s-messages__avatar-dot" /> : null}
                      </View>
                      <View className="s-messages__body">
                        <View className="s-messages__row">
                          <Text className="s-messages__name">{session.peerName}</Text>
                          <Text className="s-messages__time">
                            {formatTimeAgo(session.lastMessageAt)}
                          </Text>
                        </View>
                        <View className="s-messages__preview-row">
                          <Text className="s-messages__preview">
                            {session.lastMessage}
                          </Text>
                          {hasUnread ? (
                            <Text className="s-messages__badge">{badgeLabel}</Text>
                          ) : null}
                        </View>
                      </View>
                    </Button>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <BottomNavSlot />
    </View>
  );
};

export default MessagesPage;
