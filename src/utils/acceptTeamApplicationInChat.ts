import { acceptPostApplicationAndInvalidate } from '../hooks/useSyncApi';
import { invalidateTeamChatQueries } from '../hooks/sync/teamChats';
import type { TempChatSession } from '../types/tempChat';

function resolveApplicantUserId(session: TempChatSession): string {
  const applicantUserId = session.applicantUserId?.trim();
  if (applicantUserId) return applicantUserId;
  if (session.isOwner !== false) {
    return session.peerUserId?.trim() ?? '';
  }
  return '';
}

/** Accept team application from chat page only; updates post recruitment on server. */
export async function acceptTeamApplicationInChat(
  session: TempChatSession,
): Promise<void> {
  const applicantUserId = resolveApplicantUserId(session);
  if (!applicantUserId) {
    throw new Error('缺少申请人 userId，无法接受组队');
  }

  await acceptPostApplicationAndInvalidate(session.postId, applicantUserId);
  invalidateTeamChatQueries();
}
