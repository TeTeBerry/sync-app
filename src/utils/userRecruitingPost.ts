import type { EventDetailPost, ProfilePostItem } from '../types/backend';
import { isCurrentUserPostAuthor } from './postOwnership';

/** User's recruiting posts in the loaded activity feed (newest first if feed is sorted). */
export function listUserRecruitingPostsInFeed(
  posts: EventDetailPost[],
): EventDetailPost[] {
  return posts.filter(
    (post) =>
      post.status === '招募中' && isCurrentUserPostAuthor(post.name, post.userId),
  );
}

/** User has an active recruiting post in the loaded activity feed. */
export function findUserRecruitingPostInFeed(
  posts: EventDetailPost[],
): EventDetailPost | undefined {
  return listUserRecruitingPostsInFeed(posts)[0];
}

/** Fallback when feed is paginated: check profile posts scoped to this activity. */
export function listUserRecruitingPostsForActivity(
  profilePosts: ProfilePostItem[] | undefined,
  activityLegacyId: number,
): ProfilePostItem[] {
  if (!profilePosts?.length || !Number.isFinite(activityLegacyId)) {
    return [];
  }
  return profilePosts.filter(
    (post) =>
      post.status === '招募中' &&
      post.activityLegacyId != null &&
      post.activityLegacyId === activityLegacyId,
  );
}

export function userHasRecruitingPostForActivity(
  profilePosts: ProfilePostItem[] | undefined,
  activityLegacyId: number,
): boolean {
  return listUserRecruitingPostsForActivity(profilePosts, activityLegacyId).length > 0;
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
