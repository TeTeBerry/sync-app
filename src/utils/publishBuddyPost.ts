import { createPost, updatePost } from '../api/sync/posts';
import type { EventDetailPost } from '../types/backend';
import type { RecommendedPostCard } from '../types/aiChat';
import type { AiBuddyPostFormValues } from '../types/buddyPost';
import {
  buildBuddyPostBody,
  buddyPostHashTags,
  buildRecruitFieldsFromBuddyForm,
  formatBuddyPostDeparture,
} from './buddyPostForm';
import { eventDetailPostToCard } from './eventPostCard';
import { assertPostPublishedVisible } from './postPublishFeedback';

export function buildOptimisticBuddyPost(params: {
  pendingId: string;
  form: AiBuddyPostFormValues;
  authorName: string;
  authorAvatar?: string;
  authorHandle?: string;
  userId?: string;
  location?: string;
}): EventDetailPost {
  const body = buildBuddyPostBody(params.form);
  const hashTags = buddyPostHashTags(params.form.tags);
  const fullBody = hashTags.length ? `${body}\n\n${hashTags.join(' ')}` : body;
  const recruit = buildRecruitFieldsFromBuddyForm(params.form);

  return {
    id: params.pendingId,
    userId: params.userId,
    name: params.authorName,
    handle: params.authorHandle?.trim() || undefined,
    avatar: params.authorAvatar?.trim() || '',
    location: formatBuddyPostDeparture(params.location ?? params.form.location),
    createdAt: new Date().toISOString(),
    body: fullBody,
    tags: hashTags,
    recruitStatus: recruit.recruitStatus,
    ...(recruit.slotsTotal != null ? { slotsTotal: recruit.slotsTotal } : {}),
    ...(recruit.slotsFilled != null ? { slotsFilled: recruit.slotsFilled } : {}),
  };
}

export async function publishBuddyPostFromForm(params: {
  form: AiBuddyPostFormValues;
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
  const location = formatBuddyPostDeparture(form.location);
  const recruit = buildRecruitFieldsFromBuddyForm(form);

  const post = await createPost({
    body: hashTags.length ? `${body}\n\n${hashTags.join(' ')}` : body,
    activityLegacyId,
    eventTitle: title,
    ...(location ? { location } : {}),
    tags: hashTags,
    listedInFeed: params.listedInFeed !== false,
    recruitStatus: recruit.recruitStatus,
    ...(recruit.slotsTotal != null ? { slotsTotal: recruit.slotsTotal } : {}),
    ...(recruit.slotsFilled != null ? { slotsFilled: recruit.slotsFilled } : {}),
  });
  assertPostPublishedVisible(post);

  const card = eventDetailPostToCard(post, {
    activityLegacyId,
    authorName,
    authorAvatar,
  });

  return { post, card };
}

export async function updateBuddyPostFromForm(params: {
  postId: string;
  form: AiBuddyPostFormValues;
  recruitStatus?: 'open' | 'full';
}): Promise<EventDetailPost> {
  const { form, postId } = params;
  const body = buildBuddyPostBody(form);
  const hashTags = buddyPostHashTags(form.tags);
  const location = formatBuddyPostDeparture(form.location);
  const recruit = buildRecruitFieldsFromBuddyForm(form);

  return updatePost(postId, {
    body: hashTags.length ? `${body}\n\n${hashTags.join(' ')}` : body,
    ...(location ? { location } : {}),
    tags: hashTags,
    recruitStatus: params.recruitStatus ?? recruit.recruitStatus,
    ...(recruit.slotsTotal != null ? { slotsTotal: recruit.slotsTotal } : {}),
    ...(recruit.slotsFilled != null ? { slotsFilled: recruit.slotsFilled } : {}),
  });
}
