import { createPost } from '../api/sync/posts';
import type { EventDetailPost, HomeFeedPost } from '../types/backend';
import { formatTimeAgo } from './dayTime';
import { uploadChatImageRefs } from './chatImage';

export type PublishSharePostParams = {
  body: string;
  imageRefs?: string[];
  activityLegacyId: number;
  eventTitle: string;
  location?: string;
  tags?: string[];
};

/** Map createPost response into explore share feed row shape. */
export function sharePostToHomeFeedItem(
  post: EventDetailPost,
  ctx: { eventTitle: string; activityLegacyId: number },
): HomeFeedPost {
  const name = post.name?.trim() || '用户';
  return {
    id: post.id,
    userId: post.userId,
    name,
    handle: `@${name.toLowerCase()}`,
    event: ctx.eventTitle.trim() || '现场分享',
    activityLegacyId: ctx.activityLegacyId,
    location: post.location ?? '',
    body: post.body,
    time: post.createdAt ? formatTimeAgo(post.createdAt) : '刚刚',
    likes: post.likes ?? 0,
    liked: post.liked ?? false,
    comments: post.comments ?? 0,
    avatar: post.avatar ?? '',
    status: post.status ?? '招募中',
    contentTypes: post.contentTypes ?? ['share'],
    tags: post.tags ?? [],
    images: post.images,
    ...(post.authorOnSiteVerified ? { authorOnSiteVerified: true } : {}),
  };
}

export async function publishSharePost(
  params: PublishSharePostParams,
): Promise<EventDetailPost> {
  const trimmedBody = params.body.trim();
  const imageRefs = params.imageRefs ?? [];
  const images = imageRefs.length ? await uploadChatImageRefs(imageRefs) : undefined;
  const tags = params.tags?.length ? params.tags : ['#现场'];
  const body = trimmedBody || (images?.length ? '分享了一张现场照片 📸 #现场' : '');

  if (!body.trim()) {
    throw new Error('EMPTY_SHARE_POST');
  }

  return createPost({
    body,
    activityLegacyId: params.activityLegacyId,
    eventTitle: params.eventTitle.trim() || '现场分享',
    location: params.location?.trim(),
    tags,
    contentTypes: ['share'],
    images,
    listedInFeed: true,
  });
}
