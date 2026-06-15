/** Home summary + embedded popular posts (refetch on pull / invalidation). */
export const STALE_HOME_SUMMARY_MS = 90_000;

/** Activity list tab — longer cache, refetch on tab show if stale. */
export const STALE_ACTIVITIES_LIST_MS = 120_000;

/** Activity detail header — seed from list/home reduces refetch need. */
export const STALE_ACTIVITY_DETAIL_MS = 120_000;

/** Post feeds (home popular fallback, activity posts query). */
export const STALE_POSTS_FEED_MS = 90_000;
