import {
  fetchTeamChatMessages,
  fetchTeamChatSessions,
  markTeamChatRead,
  sendTeamChatMessage,
} from '../../api/sync/teamChats';
import { isLiveApi } from '../../constants/api';
import { resolveRequestUserId } from '../../api/requestContext';
import type { TeamChatMessage, TeamChatSession } from '../../types/teamChat';
import type { TempChatMessage, TempChatSession } from '../../types/tempChat';
import {
  broadcastCacheData,
  invalidateCache,
  setCacheData,
  useApiQuery,
} from '../useApiQuery';
import { buildTeamChatSessionId } from '../../utils/teamChatSessionId';

const TEAM_CHAT_STALE_MS = 15_000;

export function teamChatSessionsQueryKey(userId: string) {
  return ['team-chats', 'sessions', userId] as const;
}

export function teamChatMessagesQueryKey(
  userId: string,
  postId: string,
  applicantUserId: string,
) {
  return ['team-chats', 'messages', userId, postId, applicantUserId] as const;
}

export function mapTeamChatSessionToTemp(session: TeamChatSession): TempChatSession {
  const recruitmentStatus =
    session.postRecruitmentStatus === '已隐藏'
      ? '招募中'
      : session.postRecruitmentStatus;

  return {
    id: session.sessionId,
    applicantUserId: session.applicantUserId,
    peerUserId: session.peerUserId,
    peerName: session.peerName,
    peerAvatar: session.peerAvatar,
    postId: session.postId,
    postTitle: session.postTitle,
    buddyInfo: session.buddyPreview,
    lastMessage: session.lastMessage,
    lastMessageAt: session.lastMessageAt,
    unreadCount: Math.max(0, session.unreadCount ?? 0),
    applicationStatus: session.applicationStatus,
    postRecruitmentStatus: recruitmentStatus,
    activityLegacyId: session.activityLegacyId,
    activityEndAt: session.activityEndAt,
    destroysAt: session.destroysAt,
    isOwner: session.isOwner,
  };
}

export function mapTeamChatMessagesToTemp(
  messages: TeamChatMessage[],
  sessionId: string,
): TempChatMessage[] {
  return messages.map((message) => ({
    id: message.id,
    sessionId,
    role: message.role,
    body: message.body,
    createdAt: message.createdAt,
  }));
}

export function useTeamChatSessionsQuery() {
  const userId = resolveRequestUserId();
  const enabled = isLiveApi();

  return useApiQuery({
    queryKey: [...teamChatSessionsQueryKey(userId)],
    queryFn: fetchTeamChatSessions,
    enabled,
    staleTime: TEAM_CHAT_STALE_MS,
  });
}

export function useTeamChatMessagesQuery(
  postId: string | undefined,
  applicantUserId: string | undefined,
) {
  const userId = resolveRequestUserId();
  const enabled =
    isLiveApi() && Boolean(postId?.trim()) && Boolean(applicantUserId?.trim());

  return useApiQuery({
    queryKey: [
      ...teamChatMessagesQueryKey(userId, postId ?? '', applicantUserId ?? ''),
    ],
    queryFn: () => fetchTeamChatMessages(postId!.trim(), applicantUserId!.trim()),
    enabled,
    staleTime: TEAM_CHAT_STALE_MS,
  });
}

export function invalidateTeamChatQueries() {
  invalidateCache(['team-chats']);
}

function patchTeamChatSessionUnreadInCache(
  postId: string,
  applicantUserId: string,
  unreadCount: number,
) {
  const userId = resolveRequestUserId();
  const sessionId = buildTeamChatSessionId(postId, applicantUserId);
  const queryKey = [...teamChatSessionsQueryKey(userId)];

  setCacheData<TeamChatSession[]>(queryKey, (prev) => {
    if (!prev?.length) return prev;
    const next = prev.map((session) =>
      session.sessionId === sessionId ? { ...session, unreadCount } : session,
    );
    const changed = next.some(
      (session, index) => session.unreadCount !== prev[index]?.unreadCount,
    );
    return changed ? next : prev;
  });
  broadcastCacheData(queryKey);
}

export async function sendTeamChatMessageAndInvalidate(
  postId: string,
  applicantUserId: string,
  body: string,
): Promise<TeamChatMessage> {
  const result = await sendTeamChatMessage(postId, applicantUserId, body);
  invalidateTeamChatQueries();
  return result;
}

export async function markTeamChatReadAndInvalidate(
  postId: string,
  applicantUserId: string,
) {
  patchTeamChatSessionUnreadInCache(postId, applicantUserId, 0);
  try {
    return await markTeamChatRead(postId, applicantUserId);
  } finally {
    invalidateTeamChatQueries();
  }
}
