import './chat.scss';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Taro, { useDidShow, useRouter } from '@tarojs/taro';
import { Send } from '../../../components/icons';
import { ChatBuddyCard } from '../../../components/message/ChatBuddyCard';
import { TempChatRetentionBanner } from '../../../components/message/TempChatRetentionBanner';
import { BottomNavSlot } from '../../../components/navigation/BottomNav';
import PageNavigation from '../../../components/navigation/PageNavigation';
import { PLACEHOLDER_AVATAR } from '../../../constants/remoteImages';
import { useConfirmDialog } from '../../../hooks/useConfirmDialog';
import { useResolvedProfile } from '../../../hooks/useResolvedProfile';
import { useEndRouteTransitionOnShow } from '../../../hooks/useEndRouteTransitionOnShow';
import { useKeyboardInset } from '../../../hooks/useKeyboardInset';
import { useMergedTempChatMessages } from '../../../hooks/useMergedTempChatMessages';
import { useTeamChatPoll } from '../../../hooks/useTeamChatPoll';
import {
  TEMP_CHAT_SCROLL_BOTTOM_ID,
  useTempChatScroll,
} from '../../../hooks/useTempChatScroll';
import {
  useResolvedTempChatMessages,
  useResolvedTempChatSession,
} from '../../../hooks/useResolvedTempChat';
import { useProfilePostsQuery } from '../../../hooks/useSyncApi';
import {
  markTeamChatReadAndInvalidate,
  sendTeamChatMessageAndInvalidate,
} from '../../../hooks/sync/teamChats';
import { acceptTeamApplicationInChat } from '../../../utils/acceptTeamApplicationInChat';
import { sanitizeRemoteImageUrl } from '../../../utils/imageUrl';
import { resolveRequestUserId } from '../../../api/requestContext';
import { ROUTES } from '../../../utils/route';
import { Button } from '../../../components/ui';
import { Input, ScrollView, Text, View } from '@tarojs/components';

const TempChatPage: React.FC = () => {
  useEndRouteTransitionOnShow();
  const router = useRouter();
  const sessionId = router.params.sessionId?.trim() ?? '';
  const profileUser = useResolvedProfile();
  const postsQuery = useProfilePostsQuery();
  const myAvatar =
    sanitizeRemoteImageUrl(profileUser.avatar?.trim()) || PLACEHOLDER_AVATAR;
  const keyboardInset = useKeyboardInset();
  const [draft, setDraft] = useState('');
  const [accepting, setAccepting] = useState(false);
  const [sending, setSending] = useState(false);
  const { confirm, confirmDialog } = useConfirmDialog({ cancelText: '取消' });

  const { parsed, session, sessionsQuery, isLoading } =
    useResolvedTempChatSession(sessionId);
  const {
    messages: sourceMessages,
    messagesQuery,
    isLoading: messagesLoading,
    refetchMessages,
  } = useResolvedTempChatMessages(sessionId, parsed);
  const displayMessages = useMergedTempChatMessages(sessionId, sourceMessages);
  const { scrollIntoView, onScroll, markStickToBottom } = useTempChatScroll(
    displayMessages,
    sessionId,
  );

  const pollEnabled = Boolean(parsed && session);

  useTeamChatPoll({
    pollEnabled,
    hasCachedMessages: displayMessages.length > 0,
    refetchMessages,
  });

  const markedReadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!parsed || !session) return;
    const key = `${parsed.postId}:${parsed.applicantUserId}`;
    if (markedReadKeyRef.current === key) return;
    markedReadKeyRef.current = key;
    void markTeamChatReadAndInvalidate(parsed.postId, parsed.applicantUserId);
  }, [parsed, session]);

  useDidShow(() => {
    if (!parsed || !session) return;
    void markTeamChatReadAndInvalidate(parsed.postId, parsed.applicantUserId);
  });

  const canSend = draft.trim().length > 0;
  const showAcceptTeam =
    session != null &&
    session.isOwner !== false &&
    session.applicationStatus === 'pending' &&
    session.postRecruitmentStatus === '招募中';

  const handleSend = useCallback(async () => {
    if (!sessionId || !canSend || sending || !parsed) return;
    const body = draft.trim();
    if (!body) return;

    setSending(true);
    try {
      await sendTeamChatMessageAndInvalidate(
        parsed.postId,
        parsed.applicantUserId,
        body,
      );
      setDraft('');
      void refetchMessages({ background: true });
      markStickToBottom();
    } catch {
      void Taro.showToast({ title: '发送失败', icon: 'none' });
    } finally {
      setSending(false);
    }
  }, [canSend, draft, parsed, markStickToBottom, refetchMessages, sending, sessionId]);

  const handleAcceptTeam = useCallback(async () => {
    if (!session || accepting) return;
    const ok = await confirm({
      title: '接受组队',
      message: `确认接受 ${session.peerName} 的组队申请？接受后该帖子将标记为已组队。`,
      confirmText: '接受组队',
    });
    if (!ok) return;

    setAccepting(true);
    try {
      await acceptTeamApplicationInChat(session);
      void postsQuery.refetch();
      void sessionsQuery.refetch();
      void refetchMessages({ background: displayMessages.length > 0 });
      void Taro.showToast({ title: '已组队', icon: 'success' });
    } catch {
      void Taro.showToast({ title: '操作失败', icon: 'none' });
    } finally {
      setAccepting(false);
    }
  }, [
    accepting,
    confirm,
    postsQuery,
    displayMessages.length,
    refetchMessages,
    session,
    sessionsQuery,
  ]);

  const composerStyle =
    keyboardInset > 0
      ? {
          paddingBottom: `calc(10px + env(safe-area-inset-bottom, 0px) + ${keyboardInset}px)`,
        }
      : undefined;

  const acceptTrailing = showAcceptTeam ? (
    <Button
      className={`s-temp-chat__accept-team${
        accepting ? ' s-temp-chat__accept-team--loading' : ''
      }`}
      disabled={accepting}
      onClick={() => void handleAcceptTeam()}
    >
      <Text className="s-btn-label">{accepting ? '处理中…' : '接受组队'}</Text>
    </Button>
  ) : session?.applicationStatus === 'accepted' ? (
    <Text className="s-temp-chat__accepted-label">已组队</Text>
  ) : null;

  const showInitialLoading =
    (isLoading || messagesLoading) && displayMessages.length === 0;

  if (showInitialLoading) {
    return (
      <View data-cmp="TempChatPage" className="s-page-with-tabbar">
        <View className="s-page-with-tabbar__main s-temp-chat">
          <PageNavigation title="私信" fallback={ROUTES.MESSAGES} tone="surface" />
          <Text className="s-temp-chat__missing">加载中…</Text>
        </View>
        <BottomNavSlot />
      </View>
    );
  }

  if (!session) {
    const myUserId = resolveRequestUserId();
    const isApplicantViewer = Boolean(parsed) && myUserId === parsed?.applicantUserId;
    const missingHint = isApplicantViewer
      ? '帖主尚未发起沟通，请耐心等待'
      : parsed
        ? '请先在「我的组队帖」中点击「沟通」发起会话'
        : '会话不存在或已失效';

    return (
      <View data-cmp="TempChatPage" className="s-page-with-tabbar">
        <View className="s-page-with-tabbar__main s-temp-chat">
          <PageNavigation title="私信" fallback={ROUTES.MESSAGES} tone="surface" />
          <Text className="s-temp-chat__missing">{missingHint}</Text>
        </View>
        <BottomNavSlot />
      </View>
    );
  }

  return (
    <View data-cmp="TempChatPage" className="s-page-with-tabbar">
      <View className="s-page-with-tabbar__main s-temp-chat">
        <PageNavigation
          title={session.peerName}
          fallback={ROUTES.MESSAGES}
          tone="surface"
          trailing={acceptTrailing}
        />

        <View className="s-temp-chat__main">
          <ScrollView
            scrollY
            showScrollbar={false}
            scrollIntoView={scrollIntoView}
            scrollWithAnimation={false}
            className="s-temp-chat__scroll s-scrollbar-none"
            onScroll={(event) => onScroll(event.detail)}
          >
            <View className="s-temp-chat__inner">
              <TempChatRetentionBanner session={session} />
              <ChatBuddyCard
                peerName={session.peerName}
                peerAvatar={session.peerAvatar}
                postTitle={session.postTitle}
                buddyInfo={session.buddyInfo}
              />
              {displayMessages.map((message) => {
                const isPeer = message.role === 'peer';
                return (
                  <View
                    key={message.id}
                    id={`msg-${message.id}`}
                    className={`s-temp-chat__bubble-row${
                      isPeer ? '' : ' s-temp-chat__bubble-row--me'
                    }`}
                  >
                    {isPeer ? (
                      <View
                        className="s-temp-chat__bubble-avatar"
                        style={
                          session.peerAvatar
                            ? { backgroundImage: `url(${session.peerAvatar})` }
                            : undefined
                        }
                        aria-hidden
                      />
                    ) : null}
                    <View
                      className={`s-temp-chat__bubble${
                        isPeer
                          ? ' s-temp-chat__bubble--peer'
                          : ' s-temp-chat__bubble--me'
                      }`}
                    >
                      <Text className="s-temp-chat__bubble-text">{message.body}</Text>
                    </View>
                    {!isPeer ? (
                      <View
                        className="s-temp-chat__bubble-avatar"
                        style={{ backgroundImage: `url(${myAvatar})` }}
                        aria-hidden
                      />
                    ) : null}
                  </View>
                );
              })}
              <View
                id={TEMP_CHAT_SCROLL_BOTTOM_ID}
                className="s-temp-chat__scroll-bottom"
              />
            </View>
          </ScrollView>

          <View className="s-temp-chat__composer" style={composerStyle}>
            <View className="s-temp-chat__input-wrap">
              <Input
                className="s-temp-chat__input"
                value={draft}
                placeholder="发消息…"
                placeholderStyle="color: rgba(255,255,255,0.28)"
                confirmType="send"
                adjustPosition={false}
                cursorSpacing={16}
                onInput={(event) => setDraft(event.detail.value ?? '')}
                onConfirm={() => void handleSend()}
              />
            </View>
            <Button
              className={`s-temp-chat__send${canSend ? '' : ' s-temp-chat__send--disabled'}`}
              disabled={!canSend || sending || !parsed}
              aria-label="发送"
              onClick={() => void handleSend()}
            >
              <Send size={18} color="#fff" aria-hidden />
            </Button>
          </View>
        </View>
      </View>

      {confirmDialog}
      <BottomNavSlot />
    </View>
  );
};

export default TempChatPage;
