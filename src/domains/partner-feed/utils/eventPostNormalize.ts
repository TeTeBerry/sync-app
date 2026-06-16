import type { EventDetailPost } from '../../../types/post';
import { formatPostPublishTime } from '../../../utils/formatPostPublishTime';
import { sanitizeImageList, sanitizeRemoteImageUrl } from '../../../utils/imageUrl';

export type EventPostListItem = {
  post: EventDetailPost;
  publishTimeLabel: string;
};

export function normalizeEventPostListItem(item: EventDetailPost): EventPostListItem {
  const post: EventDetailPost = {
    id: item.id,
    userId: item.userId,
    location: item.location,
    createdAt: item.createdAt,
    body: item.body ?? '',
    tags: item.tags ?? [],
    name: item.name?.trim() || '用户',
    avatar: sanitizeRemoteImageUrl(item.avatar) ?? item.avatar,
    contentTypes: item.contentTypes,
    images: sanitizeImageList(item.images),
    comments: item.comments,
  };
  const publishTimeLabel = post.createdAt ? formatPostPublishTime(post.createdAt) : '';
  return { post, publishTimeLabel };
}

export function normalizeEventPostList(items: EventDetailPost[]): EventPostListItem[] {
  return items.map(normalizeEventPostListItem);
}
