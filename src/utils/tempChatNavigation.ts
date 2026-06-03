import { buildTeamChatSessionId } from './teamChatSessionId';

export function buildTempChatRouteSessionId(
  postId: string,
  applicantUserId: string,
): string {
  return buildTeamChatSessionId(postId, applicantUserId);
}
