import type { EventDetailPost } from '../types/backend';
import type { RecommendedPostCard } from '../types/aiChat';
import { stripPostBodyContact } from './postBodyContact';

export function eventDetailPostToCard(
  post: EventDetailPost,
  options: {
    activityLegacyId: number;
    authorName: string;
    authorAvatar?: string;
    authorGender?: RecommendedPostCard['authorGender'];
  },
): RecommendedPostCard {
  return {
    postId: post.id,
    snippet: stripPostBodyContact(post.body),
    authorName: options.authorName,
    authorAvatar: options.authorAvatar || post.avatar,
    authorGender: options.authorGender,
    eventTitle: post.name,
    location: post.location,
    tags: post.tags,
    activityLegacyId: options.activityLegacyId,
  };
}
