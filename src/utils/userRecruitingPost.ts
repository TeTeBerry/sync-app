import type { EventDetailPost, ProfilePostItem } from '../types/backend';
import { isCurrentUserPostAuthor } from './postOwnership';

/** User has an active recruiting post in the loaded activity feed. */
export function findUserRecruitingPostInFeed(
  posts: EventDetailPost[],
): EventDetailPost | undefined {
  return posts.find(
    (post) =>
      post.status === '招募中' && isCurrentUserPostAuthor(post.name, post.userId),
  );
}

/** Fallback when feed is paginated: check profile posts scoped to this activity. */
export function userHasRecruitingPostForActivity(
  profilePosts: ProfilePostItem[] | undefined,
  activityLegacyId: number,
): boolean {
  if (!profilePosts?.length || !Number.isFinite(activityLegacyId)) {
    return false;
  }
  return profilePosts.some(
    (post) =>
      post.status === '招募中' &&
      post.activityLegacyId != null &&
      post.activityLegacyId === activityLegacyId,
  );
}

export function userHasRecruitingBuddyPost(
  activityLegacyId: number,
  feedPosts: EventDetailPost[],
  profilePosts?: ProfilePostItem[],
): boolean {
  if (findUserRecruitingPostInFeed(feedPosts)) {
    return true;
  }
  return userHasRecruitingPostForActivity(profilePosts, activityLegacyId);
}
