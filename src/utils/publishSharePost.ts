import { createPost } from '../api/sync/posts';
import type { EventDetailPost } from '../types/backend';
import { uploadChatImageRefs } from './chatImage';

export type PublishSharePostParams = {
  body: string;
  imageRefs?: string[];
  activityLegacyId: number;
  eventTitle: string;
  location?: string;
  tags?: string[];
};

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
