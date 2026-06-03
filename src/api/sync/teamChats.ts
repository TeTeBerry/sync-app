import { apiGet, apiPost } from '../../utils/apiClient';
import type { TeamChatMessage, TeamChatSession } from '../../types/teamChat';
import { ownerQueryParams } from '../requestContext';

export function fetchTeamChatSessions() {
  return apiGet<TeamChatSession[]>('/team-chats', ownerQueryParams());
}

export function fetchTeamChatMessages(postId: string, applicantUserId: string) {
  return apiGet<TeamChatMessage[]>(
    `/team-chats/${encodeURIComponent(postId)}/${encodeURIComponent(applicantUserId)}/messages`,
    ownerQueryParams(),
  );
}

export function sendTeamChatMessage(
  postId: string,
  applicantUserId: string,
  body: string,
) {
  return apiPost<TeamChatMessage>(
    `/team-chats/${encodeURIComponent(postId)}/${encodeURIComponent(applicantUserId)}/messages`,
    { body },
    ownerQueryParams(),
  );
}
