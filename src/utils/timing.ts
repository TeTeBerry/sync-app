/** Below-fold UI mount defer (first paint). */
export const DEFER_BELOW_FOLD_MS = 0;

/** Non-critical API on home (notification badge, etc.). */
export const DEFER_SECONDARY_API_MS = 280;

/** Event detail: composer block (AI chips) after nav/header paint. */
export const DEFER_EVENT_COMPOSER_MS = 48;

/** Event detail posts feed — after activity detail request starts. */
export const DEFER_EVENT_POSTS_MS = 240;

/** Event detail users/me (account risk) — after posts on weak networks. */
export const DEFER_EVENT_SECONDARY_MS = 400;

/** Event detail AI subpackage warm — touch-first; optional idle preload. */
export const DEFER_EVENT_AI_WARM_MS = 800;

/** Notifications list defer. */
export const DEFER_NOTIFICATIONS_MS = 0;

/** AI chat panel defer. */
export const DEFER_AI_CHAT_MS = 0;

/** Hot-route preload after tab settle (see route.ts). */
export const PRELOAD_HOT_ROUTES_MS = 500;
