/** Preload targets keyed by tab path (matches `ROUTES` in route.ts). */
export const PRELOAD_PAGE_ROUTES_BY_TAB = {
  '/pages/index/index': [
    '/packageEvent/pages/event-detail/index',
    '/packageProfile/pages/notifications/index',
  ],
  '/pages/events/index': ['/packageEvent/pages/event-detail/index'],
  '/pages/profile/index': ['/packageProfile/pages/notifications/index'],
} as const;

export type PreloadTabPath = keyof typeof PRELOAD_PAGE_ROUTES_BY_TAB;
