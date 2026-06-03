import { acceptPostApplicationAndInvalidate } from '../hooks/useSyncApi';
import { invalidateTeamChatQueries } from '../hooks/sync/teamChats';
import { useTempChatStore } from '../stores/tempChatStore';
import type { TempChatSession } from '../types/tempChat';
import { patchProfilePostApplicationAccepted } from './queryInvalidation';

export async function acceptTeamApplicationInChat(
  session: TempChatSession,
  apiEnabled: boolean,
): Promise<void> {
  useTempChatStore.getState().markApplicationAccepted(session.id);
  patchProfilePostApplicationAccepted(
    session.postId,
    session.applicantUserId || session.peerUserId,
  );
  if (apiEnabled) {
    await acceptPostApplicationAndInvalidate(
      session.postId,
      session.applicantUserId || session.peerUserId,
    );
    invalidateTeamChatQueries();
  }
}
