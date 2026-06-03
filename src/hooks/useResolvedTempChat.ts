import { useMemo, useRef } from 'react';
import { isLiveApi } from '../constants/api';
import {
  mapTeamChatSessionToTemp,
  useTeamChatMessagesQuery,
  useTeamChatSessionsQuery,
} from './sync/teamChats';
import { useProfilePostsQuery } from './useSyncApi';
import type { TempChatMessage, TempChatSession } from '../types/tempChat';
import { parseTeamChatSessionId } from '../utils/teamChatSessionId';
import { resolveApplicantBuddyInfo } from '../utils/tempChatApplicantBuddy';
import { buildTeamChatSessionId } from '../utils/teamChatSessionId';
import {
  buildTempChatRetentionFields,
  filterActiveTempChatSessions,
  isActiveTempChatSession,
} from '../utils/tempChatRetention';

function buildOwnerFallbackSession(
  postId: string,
  applicantUserId: string,
  posts: ReturnType<typeof useProfilePostsQuery>['data'],
): TempChatSession | undefined {
  const post = posts?.find((item) => item.id === postId);
  if (!post) return undefined;
  const application = post.applications?.find(
    (item) => item.userId === applicantUserId,
  );
  if (!application?.ownerOpenedChatAt) return undefined;

  return {
    id: buildTeamChatSessionId(postId, applicantUserId),
    postId,
    applicantUserId,
    peerUserId: application.userId,
    peerName: application.name,
    peerAvatar: application.avatar,
    postTitle: post.title,
    buddyInfo:
      application.buddyPreview ?? resolveApplicantBuddyInfo(application.userId),
    lastMessage: application.message ?? '',
    lastMessageAt: application.appliedAt,
    unreadCount: 0,
    applicationStatus: application.status,
    postRecruitmentStatus: post.status === '已组队' ? '已组队' : '招募中',
    activityLegacyId: post.activityLegacyId,
    isOwner: true,
    ...buildTempChatRetentionFields(post.activityLegacyId),
  };
}

export function useResolvedTempChatSession(sessionId: string) {
  const parsed = useMemo(() => parseTeamChatSessionId(sessionId), [sessionId]);

  const sessionsQuery = useTeamChatSessionsQuery();
  const postsQuery = useProfilePostsQuery();
  const sessionStickyRef = useRef<TempChatSession | undefined>(undefined);

  const session = useMemo(() => {
    if (!parsed) {
      sessionStickyRef.current = undefined;
      return undefined;
    }
    const fromList = sessionsQuery.data?.find((item) => item.sessionId === sessionId);
    if (fromList) {
      const mapped = mapTeamChatSessionToTemp(fromList);
      if (isActiveTempChatSession(mapped)) {
        sessionStickyRef.current = mapped;
        return mapped;
      }
    }

    const fallback = buildOwnerFallbackSession(
      parsed.postId,
      parsed.applicantUserId,
      postsQuery.data,
    );
    if (fallback && isActiveTempChatSession(fallback)) {
      sessionStickyRef.current = fallback;
      return fallback;
    }

    return sessionStickyRef.current;
  }, [parsed, postsQuery.data, sessionId, sessionsQuery.data]);

  const apiEnabled = isLiveApi();
  const isLoading =
    apiEnabled &&
    !session &&
    (sessionsQuery.isLoading || postsQuery.isLoading) &&
    sessionsQuery.data === undefined &&
    postsQuery.data === undefined;

  return {
    parsed,
    session,
    sessionsQuery,
    postsQuery,
    isLoading,
  };
}

export function useResolvedTempChatMessages(
  sessionId: string,
  parsed: { postId: string; applicantUserId: string } | null,
) {
  const apiEnabled = isLiveApi();
  const messagesQuery = useTeamChatMessagesQuery(
    parsed?.postId,
    parsed?.applicantUserId,
  );

  const messages = useMemo((): TempChatMessage[] => {
    if (!sessionId) return [];
    const rows = messagesQuery.data ?? [];
    return rows
      .map((message) => ({
        id: message.id,
        sessionId,
        role: message.role,
        body: message.body,
        createdAt: message.createdAt,
      }))
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [messagesQuery.data, sessionId]);

  const isLoading =
    apiEnabled &&
    Boolean(parsed) &&
    messagesQuery.isLoading &&
    messagesQuery.data === undefined;

  return {
    messages,
    messagesQuery,
    isLoading,
    refetchMessages: messagesQuery.refetch,
  };
}

export function useTeamChatSessionList() {
  const apiEnabled = isLiveApi();
  const sessionsQuery = useTeamChatSessionsQuery();

  const sessions = useMemo((): TempChatSession[] => {
    const raw = (sessionsQuery.data ?? []).map(mapTeamChatSessionToTemp);
    return filterActiveTempChatSessions(raw);
  }, [sessionsQuery.data]);

  const isLoading =
    apiEnabled && sessionsQuery.isLoading && sessionsQuery.data === undefined;

  return {
    sessions,
    isLoading,
    isError: apiEnabled && sessionsQuery.isError,
    refetch: sessionsQuery.refetch,
  };
}
