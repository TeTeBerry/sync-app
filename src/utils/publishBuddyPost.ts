import { createPost } from '../api/sync/posts';
import type { EventDetailPost } from '../types/backend';
import type { RecommendedPostCard } from '../types/aiChat';
import type { AiBuddyPostFormValues } from '../types/buddyPost';
import {
  buildBuddyPostBody,
  buddyPostContentTypes,
  buddyPostHashTags,
} from './buddyPostForm';
import { eventDetailPostToCard } from './eventPostCard';
import { uploadChatImageRefs } from './chatImage';

export function buildOptimisticBuddyPost(params: {
  pendingId: string;
  form: AiBuddyPostFormValues;
  authorName: string;
  authorAvatar?: string;
  userId?: string;
  imageRefs?: string[];
}): EventDetailPost {
  const body = buildBuddyPostBody(params.form);
  const hashTags = buddyPostHashTags(params.form.tags);
  const fullBody = hashTags.length ? `${body}\n\n${hashTags.join(' ')}` : body;

  return {
    id: params.pendingId,
    userId: params.userId,
    name: params.authorName,
    avatar: params.authorAvatar?.trim() || '',
    location: params.form.location.trim(),
    createdAt: new Date().toISOString(),
    body: fullBody,
    tags: hashTags,
    contentTypes: buddyPostContentTypes(params.form.tags),
    likes: 0,
    liked: false,
    comments: 0,
    status: '招募中',
    ...(params.imageRefs?.length ? { images: params.imageRefs } : {}),
  };
}

export async function publishBuddyPostFromForm(params: {
  form: AiBuddyPostFormValues;
  imageRefs?: string[];
  activityLegacyId: number;
  activityTitle: string;
  authorName: string;
  authorAvatar?: string;
  /** Default true — false keeps post off the activity feed but still persisted. */
  listedInFeed?: boolean;
}): Promise<{ post: EventDetailPost; card: RecommendedPostCard }> {
  const { form, activityLegacyId, activityTitle, authorName, authorAvatar } = params;
  const title = activityTitle.trim() || '本场活动';
  const body = buildBuddyPostBody(form);
  const hashTags = buddyPostHashTags(form.tags);
  const images = params.imageRefs?.length
    ? await uploadChatImageRefs(params.imageRefs)
    : undefined;

  const post = await createPost({
    body: hashTags.length ? `${body}\n\n${hashTags.join(' ')}` : body,
    activityLegacyId,
    eventTitle: title,
    location: form.location.trim(),
    tags: hashTags,
    contentTypes: buddyPostContentTypes(form.tags),
    listedInFeed: params.listedInFeed !== false,
    ...(images?.length ? { images } : {}),
  });

  const card = eventDetailPostToCard(post, {
    activityLegacyId,
    authorName,
    authorAvatar,
  });

  return { post, card };
}
