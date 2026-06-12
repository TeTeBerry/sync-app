import { createPost } from '../api/sync/posts';
import type { EventDetailPost } from '../types/backend';
import { uploadChatImageRefs } from './chatImage';
import { assertPostPublishedVisible } from './postPublishFeedback';
import { resolveCurrentPostLocation } from './resolveCurrentPostLocation';

export function buildOptimisticMessageBoardPost(params: {
  pendingId: string;
  body: string;
  authorName: string;
  authorAvatar?: string;
  userId?: string;
  imageRefs?: string[];
  location?: string;
}): EventDetailPost {
  return {
    id: params.pendingId,
    userId: params.userId,
    name: params.authorName,
    avatar: params.authorAvatar?.trim() || '',
    location: params.location?.trim() ?? '',
    createdAt: new Date().toISOString(),
    body: params.body.trim(),
    tags: [],
    contentTypes: ['other'],
    likes: 0,
    liked: false,
    comments: 0,
    ...(params.imageRefs?.length ? { images: params.imageRefs } : {}),
  };
}

export async function publishMessageBoardPost(params: {
  body: string;
  imageRefs?: string[];
  activityLegacyId: number;
  activityTitle: string;
}): Promise<EventDetailPost> {
  const trimmedBody = params.body.trim();
  const title = params.activityTitle.trim() || '本场活动';
  const images = params.imageRefs?.length
    ? await uploadChatImageRefs(params.imageRefs)
    : undefined;
  const body = trimmedBody || (images?.length ? '分享图片 📸' : '');
  const location = await resolveCurrentPostLocation();

  const post = await createPost({
    body,
    activityLegacyId: params.activityLegacyId,
    eventTitle: title,
    contentTypes: ['other'],
    listedInFeed: true,
    ...(location ? { location } : {}),
    ...(images?.length ? { images } : {}),
  });
  assertPostPublishedVisible(post);
  return post;
}
