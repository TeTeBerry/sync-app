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

export async function publishBuddyPostFromForm(params: {
  form: AiBuddyPostFormValues;
  activityLegacyId: number;
  activityTitle: string;
  authorName: string;
  authorAvatar?: string;
}): Promise<{ post: EventDetailPost; card: RecommendedPostCard }> {
  const { form, activityLegacyId, activityTitle, authorName, authorAvatar } = params;
  const title = activityTitle.trim() || '本场活动';
  const body = buildBuddyPostBody(form);
  const hashTags = buddyPostHashTags(form.tags);

  const post = await createPost({
    body: hashTags.length ? `${body}\n\n${hashTags.join(' ')}` : body,
    activityLegacyId,
    eventTitle: title,
    location: form.location.trim(),
    tags: hashTags,
    contentTypes: buddyPostContentTypes(form.tags),
  });

  const card = eventDetailPostToCard(post, {
    activityLegacyId,
    authorName,
    authorAvatar,
  });

  return { post, card };
}
