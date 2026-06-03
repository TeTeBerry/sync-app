import { useMemo } from 'react';
import { isLiveApi } from '../constants/api';
import {
  mapTeamChatSessionToTemp,
  useTeamChatMessagesQuery,
  useTeamChatSessionsQuery,
} from './sync/teamChats';
import { useProfilePostsQuery } from './useSyncApi';
import type { TempChatMessage, TempChatSession } from '../types/tempChat';
import { useTempChatStore } from '../stores/tempChatStore';
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
  if (!application) return undefined;

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
  const apiEnabled = isLiveApi();
  const parsed = useMemo(() => parseTeamChatSessionId(sessionId), [sessionId]);

  const sessionsQuery = useTeamChatSessionsQuery();
  const postsQuery = useProfilePostsQuery();

  const apiSession = useMemo(() => {
    if (!apiEnabled || !parsed) return undefined;
    const fromList = sessionsQuery.data?.find((item) => item.sessionId === sessionId);
    if (fromList) {
      const mapped = mapTeamChatSessionToTemp(fromList);
      return isActiveTempChatSession(mapped) ? mapped : undefined;
    }

    const fallback = buildOwnerFallbackSession(
      parsed.postId,
      parsed.applicantUserId,
      postsQuery.data,
    );
    return fallback && isActiveTempChatSession(fallback) ? fallback : undefined;
  }, [apiEnabled, parsed, postsQuery.data, sessionId, sessionsQuery.data]);

  const localSession = useTempChatStore((state) =>
    state.sessions.find((item) => item.id === sessionId),
  );

  const session = useMemo(() => {
    const raw = apiEnabled ? apiSession : localSession;
    if (!raw) return undefined;
    return isActiveTempChatSession(raw) ? raw : undefined;
  }, [apiEnabled, apiSession, localSession]);

  return {
    apiEnabled,
    parsed,
    session,
    sessionsQuery,
    postsQuery,
    isLoading: apiEnabled && sessionsQuery.isLoading && !session,
  };
}

export function useResolvedTempChatMessages(
  sessionId: string,
  session: TempChatSession | undefined,
  parsed: { postId: string; applicantUserId: string } | null,
  apiEnabled: boolean,
) {
  const messagesQuery = useTeamChatMessagesQuery(
    parsed?.postId,
    parsed?.applicantUserId,
  );

  const localMessages = useTempChatStore((state) => state.messages);

  const messages = useMemo((): TempChatMessage[] => {
    if (!sessionId) return [];
    if (apiEnabled) {
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
    }
    return localMessages
      .filter((item) => item.sessionId === sessionId)
      .sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
  }, [apiEnabled, localMessages, messagesQuery.data, sessionId]);

  return { messages, messagesQuery, refetchMessages: messagesQuery.refetch };
}

export function useTeamChatSessionList() {
  const apiEnabled = isLiveApi();
  const sessionsQuery = useTeamChatSessionsQuery();
  const hydrate = useTempChatStore((state) => state.hydrate);
  const localSessions = useTempChatStore((state) => state.sessions);

  const sessions = useMemo((): TempChatSession[] => {
    const raw = apiEnabled
      ? (sessionsQuery.data ?? []).map(mapTeamChatSessionToTemp)
      : localSessions;
    return filterActiveTempChatSessions(raw);
  }, [apiEnabled, localSessions, sessionsQuery.data]);

  return {
    apiEnabled,
    sessions,
    isLoading: apiEnabled ? sessionsQuery.isLoading : false,
    refetch: sessionsQuery.refetch,
    hydrate,
  };
}
