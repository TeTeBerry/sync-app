/** Below-fold UI mount defer (first paint). */
export const DEFER_BELOW_FOLD_MS = 0;

/** Non-critical API on home (notification badge, etc.). */
export const DEFER_SECONDARY_API_MS = 280;

/** Event detail posts feed defer (let header/meta paint first). */
export const DEFER_EVENT_POSTS_MS = DEFER_BELOW_FOLD_MS;

/** Notifications list defer. */
export const DEFER_NOTIFICATIONS_MS = 0;

/** AI chat panel defer. */
export const DEFER_AI_CHAT_MS = 0;

/** Hot-route preload after tab settle (see route.ts). */
export const PRELOAD_HOT_ROUTES_MS = 500;

/** Profile tab: defer entitlements / activities APIs until after summary paints. */
export const DEFER_PROFILE_ENTITLEMENTS_MS = 400;
