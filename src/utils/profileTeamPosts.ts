import type { PostContentType, ProfilePostItem } from '../types/backend';

/** Share posts — excluded from「我的帖子」. */
export function isProfileSharePost(contentTypes?: PostContentType[] | null): boolean {
  return (contentTypes ?? []).includes('share');
}

export function filterProfileTeamPosts<T extends Pick<ProfilePostItem, 'contentTypes'>>(
  items: T[],
): T[] {
  return items.filter((item) => !isProfileSharePost(item.contentTypes));
}
