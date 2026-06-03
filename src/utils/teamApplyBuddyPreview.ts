import type { AiBuddyPostFormValues } from '../types/buddyPost';
import type { EventDetailPost, ProfilePostItem } from '../types/backend';
import { buildBuddyPostBody, buddyPostHashTags } from './buddyPostForm';
import {
  formatContentTypeHashtag,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from './postContentTypeDisplay';
import { findUserRecruitingPostInFeed } from './userRecruitingPost';

export type TeamApplyBuddyPreview = {
  body: string;
  tags: string[];
  location?: string;
};

export function buddyPreviewFromForm(
  form: AiBuddyPostFormValues,
): TeamApplyBuddyPreview {
  return {
    body: buildBuddyPostBody(form),
    tags: buddyPostHashTags(form.tags),
    location: form.location.trim() || undefined,
  };
}

export function buddyPreviewFromEventPost(
  post: EventDetailPost,
): TeamApplyBuddyPreview {
  const contentTypeKeys = mergePostContentTypes(post.contentTypes, {
    body: post.body,
    tags: post.tags ?? [],
  });
  const displayTags = contentTypeKeys.map((key) => formatContentTypeHashtag(key));

  return {
    body: stripContentTypeHashtags(post.body) || post.body.trim(),
    tags: displayTags.length ? displayTags : ['#组队'],
    location: post.location?.trim() || undefined,
  };
}

export function buddyPreviewFromProfilePost(
  post: ProfilePostItem,
): TeamApplyBuddyPreview {
  const contentTypeKeys = mergePostContentTypes(post.contentTypes, {
    body: post.content,
    tags: [],
  });
  const displayTags = contentTypeKeys.map((key) => formatContentTypeHashtag(key));

  return {
    body: stripContentTypeHashtags(post.content) || post.content.trim(),
    tags: displayTags.length ? displayTags : ['#组队'],
  };
}

export function resolveUserBuddyPreviewForActivity(
  activityLegacyId: number,
  feedPosts: EventDetailPost[],
  profilePosts?: ProfilePostItem[],
): TeamApplyBuddyPreview | null {
  const ownFeed = findUserRecruitingPostInFeed(feedPosts);
  if (ownFeed) {
    return buddyPreviewFromEventPost(ownFeed);
  }

  const fromProfile = profilePosts?.find(
    (post) =>
      post.status === '招募中' &&
      post.activityLegacyId != null &&
      post.activityLegacyId === activityLegacyId,
  );
  if (fromProfile) {
    return buddyPreviewFromProfilePost(fromProfile);
  }

  return null;
}
