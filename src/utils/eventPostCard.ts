import type { EventDetailPost } from '../types/backend';
import type { RecommendedPostCard } from '../types/aiChat';
import { splitPostBodyContact } from './postBodyContact';

export function eventDetailPostToCard(
  post: EventDetailPost,
  options: {
    activityLegacyId: number;
    authorName: string;
    authorAvatar?: string;
    authorGender?: RecommendedPostCard['authorGender'];
  },
): RecommendedPostCard {
  const { publicBody } = splitPostBodyContact(post.body);

  return {
    postId: post.id,
    snippet: publicBody,
    authorName: options.authorName,
    authorAvatar: options.authorAvatar || post.avatar,
    authorGender: options.authorGender,
    eventTitle: post.name,
    location: post.location,
    tags: post.tags,
    activityLegacyId: options.activityLegacyId,
  };
}
