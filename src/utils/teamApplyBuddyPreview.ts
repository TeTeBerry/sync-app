import type { AiBuddyPostFormValues } from '../types/buddyPost';
import type { EventDetailPost, ProfilePostItem } from '../types/backend';
import { buildBuddyPostBody, buddyPostHashTags } from './buddyPostForm';
import {
  formatContentTypeHashtag,
  mergePostContentTypes,
  stripContentTypeHashtags,
} from './postContentTypeDisplay';
import {
  extractBuddyPostMatchSignals,
  pickBestMatchingBuddyPost,
} from './buddyPostMatch.util';
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

type FeedMatchCandidate = ReturnType<typeof extractBuddyPostMatchSignals> & {
  source: 'feed';
  post: EventDetailPost;
  createdAt?: string;
};

type ProfileMatchCandidate = ReturnType<typeof extractBuddyPostMatchSignals> & {
  source: 'profile';
  post: ProfilePostItem;
  createdAt?: string;
};

function eventPostToMatchCandidate(post: EventDetailPost): FeedMatchCandidate {
  return {
    source: 'feed',
    ...extractBuddyPostMatchSignals({
      body: post.body,
      tags: post.tags,
      contentTypes: post.contentTypes,
      location: post.location,
    }),
    createdAt: post.createdAt ?? post.time,
    post,
  };
}

function profilePostToMatchCandidate(post: ProfilePostItem): ProfileMatchCandidate {
  return {
    source: 'profile',
    ...extractBuddyPostMatchSignals({
      body: post.content,
      contentTypes: post.contentTypes,
    }),
    createdAt: post.date,
    post,
  };
}

/** Pick the user's recruiting post that best matches the host post (apply card). */
export function resolveUserBuddyPreviewForTargetPost(
  targetPost: EventDetailPost,
  activityLegacyId: number,
  feedPosts: EventDetailPost[],
  profilePosts?: ProfilePostItem[],
): TeamApplyBuddyPreview | null {
  const targetSignals = extractBuddyPostMatchSignals({
    body: targetPost.body,
    tags: targetPost.tags,
    contentTypes: targetPost.contentTypes,
    location: targetPost.location,
  });

  const feedCandidates = listUserRecruitingPostsInFeed(feedPosts).map(
    eventPostToMatchCandidate,
  );
  const profileCandidates = listUserRecruitingPostsForActivity(
    profilePosts,
    activityLegacyId,
  )
    .filter((post) => !feedCandidates.some((c) => c.post.id === post.id))
    .map(profilePostToMatchCandidate);

  const best = pickBestMatchingBuddyPost(targetSignals, [
    ...feedCandidates,
    ...profileCandidates,
  ]);

  if (!best) return null;
  if (best.source === 'feed') {
    return buddyPreviewFromEventPost(best.post);
  }
  return buddyPreviewFromProfilePost(best.post);
}

/** @deprecated Use resolveUserBuddyPreviewForTargetPost with the host post. */
export function resolveUserBuddyPreviewForActivity(
  activityLegacyId: number,
  feedPosts: EventDetailPost[],
  profilePosts?: ProfilePostItem[],
): TeamApplyBuddyPreview | null {
  const host = feedPosts[0];
  if (!host) return null;
  return resolveUserBuddyPreviewForTargetPost(
    host,
    activityLegacyId,
    feedPosts,
    profilePosts,
  );
}
