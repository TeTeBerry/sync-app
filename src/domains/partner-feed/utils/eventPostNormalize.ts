import type { EventDetailPost } from '../../../types/post';
import { formatPostPublishTimeNative } from '../../../utils/dateTimeNative';
import { sanitizeRemoteImageUrl } from '../../../utils/imageUrl';

export type EventPostListItem = {
  post: EventDetailPost;
  publishTimeLabel: string;
};

export function normalizeEventPostListItem(item: EventDetailPost): EventPostListItem {
  const post: EventDetailPost = {
    id: item.id,
    userId: item.userId,
    handle: item.handle?.trim() || undefined,
    location: item.location,
    departureCity: item.departureCity?.trim() || undefined,
    createdAt: item.createdAt,
    body: item.body ?? '',
    bodyPreview: item.bodyPreview ?? '',
    tags: item.tags ?? [],
    name: item.name?.trim() || '用户',
    avatar: sanitizeRemoteImageUrl(item.avatar) ?? item.avatar,
    comments: item.comments,
    recruitStatus: item.recruitStatus,
    ...(item.slotsTotal != null ? { slotsTotal: item.slotsTotal } : {}),
    ...(item.slotsFilled != null ? { slotsFilled: item.slotsFilled } : {}),
  };
  const publishTimeLabel = post.createdAt
    ? formatPostPublishTimeNative(post.createdAt)
    : '';
  return { post, publishTimeLabel };
}

export function normalizeEventPostList(items: EventDetailPost[]): EventPostListItem[] {
  return items.map(normalizeEventPostListItem);
}
