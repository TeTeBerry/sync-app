import type { ProfilePostItem } from '../types/backend';

/**
 * 个人页「获赞数」= 用户名下所有帖子的点赞数之和（与后端 GET /profile 统计一致）。
 */
export function sumProfilePostLikes(
  posts: ReadonlyArray<Pick<ProfilePostItem, 'likes'>>,
): number {
  let total = 0;
  for (const post of posts) {
    const value = post.likes;
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      total += value;
    }
  }
  return total;
}
