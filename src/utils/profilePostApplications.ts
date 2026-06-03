import type { PostApplicationItem, ProfilePostItem } from '../types/backend';
import type { TempChatSession } from '../types/tempChat';

/** Owner accepts one applicant: close recruitment and update application list. */
export function patchProfilePostAfterAcceptApplication(
  posts: ProfilePostItem[],
  postId: string,
  applicantUserId: string,
): ProfilePostItem[] {
  return posts.map((item) => {
    if (item.id !== postId) return item;
    const applications = (item.applications ?? []).map((application) =>
      application.userId === applicantUserId
        ? { ...application, status: 'accepted' as const }
        : application,
    );
    const pendingApplicationCount = applications.filter(
      (application) => application.status === 'pending',
    ).length;
    return {
      ...item,
      applications,
      pendingApplicationCount,
      status: '已组队',
    };
  });
}

export function profileApplicationKey(
  postId: string,
  application: PostApplicationItem,
): string {
  return `${postId}:${application.userId}`;
}

/**
 * Mock profile posts: reflect accept actions taken on the chat page (owner only).
 * Opening a chat ("沟通") does not change posts — only sessions marked accepted after
 * 「接受组队」 are applied.
 */
export function applyOwnerAcceptedSessionsToProfilePosts(
  posts: ProfilePostItem[],
  sessions: TempChatSession[],
): ProfilePostItem[] {
  let next = posts;
  for (const session of sessions) {
    if (session.isOwner === false) continue;
    if (session.applicationStatus !== 'accepted') continue;
    const applicantUserId = session.applicantUserId?.trim();
    if (!applicantUserId) continue;
    next = patchProfilePostAfterAcceptApplication(
      next,
      session.postId,
      applicantUserId,
    );
  }
  return next;
}
