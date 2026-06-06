import './messages.scss';
import React, { useCallback, useMemo, useState } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { MessageCircle } from '../../../components/icons';
import { BottomNavSlot } from '../../../components/navigation/BottomNav';
import PageNavigation, {
  stackPageNavChromePx,
} from '../../../components/navigation/PageNavigation';
import { isLiveApi } from '../../../constants/api';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useNavBarInsets } from '../../../hooks/useNavBarInsets';
import { useTabPageMainHeight } from '../../../hooks/useTabPageMainHeight';
import { dismissTeamChatSessionAndInvalidate } from '../../../hooks/sync/teamChats';
import { useTeamChatSessionList } from '../../../hooks/useResolvedTempChat';
import type { TempChatSession } from '../../../types/tempChat';
import { parseTeamChatSessionId } from '../../../utils/teamChatSessionId';
import { goTempChat, ROUTES } from '../../../utils/route';
import { Button } from '../../../components/ui';
import { ScrollView, Text, View } from '@tarojs/components';
import MessageSessionRow from './MessageSessionRow';
import { useSwipeDeleteRegistry } from './swipeDeleteRegistry';

const MessagesPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const navInsets = useNavBarInsets();
  const headerChromePx = stackPageNavChromePx(navInsets);
  const mainScrollHeight = useTabPageMainHeight(headerChromePx) ?? 480;
  const { sessions, isLoading, isError, refetch } = useTeamChatSessionList();
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const { closeOpenRow, registerRow, setOpenRow } = useSwipeDeleteRegistry();
  const apiEnabled = isLiveApi();
  const isWeapp = process.env.TARO_ENV === 'weapp';

  const closeRows = useCallback(() => {
    if (isWeapp) {
      setOpenRowId(null);
      return;
    }
    closeOpenRow();
  }, [closeOpenRow, isWeapp]);

  useDidShow(() => {
    void refetch({ background: true });
    closeRows();
  });

  const sortedSessions = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
      ),
    [sessions],
  );

  const handleOpenSession = useCallback((sessionId: string) => {
    goTempChat(sessionId);
  }, []);

  const handleDeleteSession = useCallback(
    async (session: TempChatSession) => {
      const parsed = parseTeamChatSessionId(session.id);
      if (!parsed) {
        void Taro.showToast({ title: '无法删除该会话', icon: 'none' });
        return;
      }

      const confirmed = await confirm({
        title: '删除对话',
        message: `确定删除与「${session.peerName}」的会话？对方发来新消息后会重新出现。`,
        confirmText: '删除',
      });
      if (!confirmed) return;

      if (!apiEnabled) {
        void Taro.showToast({ title: '当前环境无法删除', icon: 'none' });
        return;
      }

      try {
        await dismissTeamChatSessionAndInvalidate(
          parsed.postId,
          parsed.applicantUserId,
        );
        closeRows();
      } catch {
        void Taro.showToast({ title: '删除失败，请重试', icon: 'none' });
      }
    },
    [apiEnabled, closeRows, confirm],
  );

  const handleScroll = useCallback(() => {
    closeRows();
  }, [closeRows]);

  return (
    <View data-cmp="MessagesPage" className="s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-messages">
        <PageNavigation title="私信" fallback={ROUTES.HOME} tone="surface" />

        <ScrollView
          scrollY
          showScrollbar={false}
          className="s-messages__scroll s-scrollbar-none"
          style={{ height: `${mainScrollHeight}px` }}
          onScroll={handleScroll}
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
                {sortedSessions.map((session) => (
                  <MessageSessionRow
                    key={session.id}
                    session={session}
                    openRowId={openRowId}
                    onOpenRowChange={setOpenRowId}
                    registerRow={isWeapp ? undefined : registerRow}
                    setOpenRow={isWeapp ? undefined : setOpenRow}
                    onOpen={handleOpenSession}
                    onDelete={handleDeleteSession}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <BottomNavSlot />
      {confirmDialog}
    </View>
  );
};

export default MessagesPage;
