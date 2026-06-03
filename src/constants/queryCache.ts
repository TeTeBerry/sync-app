/** Home summary + embedded popular posts (refetch on pull / invalidation). */
export const STALE_HOME_SUMMARY_MS = 90_000;

/** Activity list tab — longer cache, refetch on tab show if stale. */
export const STALE_ACTIVITIES_LIST_MS = 120_000;

/** Activity detail header — seed from list/home reduces refetch need. */
export const STALE_ACTIVITY_DETAIL_MS = 120_000;

/** Post feeds (home popular fallback, activity posts query). */
export const STALE_POSTS_FEED_MS = 90_000;

/** Post comments while expanded. */
export const STALE_POST_COMMENTS_MS = 30_000;

/** Team chat — poll messages while chat page is visible (live API). */
export const TEAM_CHAT_POLL_INTERVAL_MS = 4_000;
