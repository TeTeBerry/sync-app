import type { AiBuddyPostFormValues } from '../types/buddyPost';
import type { EventDetailPost, ProfilePostItem } from '../types/backend';
import { buildBuddyPostBody, buddyPostHashTags } from './buddyPostForm';
import {
  formatContentTypeHashtag,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from './postContentTypeDisplay';
import {
  listUserRecruitingPostsForActivity,
  listUserRecruitingPostsInFeed,
} from './userRecruitingPost';

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

/** Pick the user's first recruiting post for the apply card preview. */
export function resolveUserBuddyPreviewForTargetPost(
  _targetPost: EventDetailPost,
  activityLegacyId: number,
  feedPosts: EventDetailPost[],
  profilePosts?: ProfilePostItem[],
): TeamApplyBuddyPreview | null {
  const feedCandidate = listUserRecruitingPostsInFeed(feedPosts)[0];
  if (feedCandidate) {
    return buddyPreviewFromEventPost(feedCandidate);
  }

  const profileCandidate = listUserRecruitingPostsForActivity(
    profilePosts,
    activityLegacyId,
  )[0];
  if (profileCandidate) {
    return buddyPreviewFromProfilePost(profileCandidate);
  }

  return null;
}
