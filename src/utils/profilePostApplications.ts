import type { PostApplicationItem, ProfilePostItem } from '../types/backend';

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
