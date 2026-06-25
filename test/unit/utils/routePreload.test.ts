import { describe, expect, it } from 'vitest';
import { PRELOAD_PAGE_ROUTES_BY_TAB } from '@/utils/routePreload.config';

describe('routePreload.config', () => {
  it('preloads only event detail and notifications from home tab', () => {
    expect(PRELOAD_PAGE_ROUTES_BY_TAB['/pages/index/index']).toEqual([
      '/packageEvent/pages/event-detail/index',
      '/packageProfile/pages/notifications/index',
    ]);
  });

  it('does not preload heavy optional event subpages from home tab', () => {
    const homeRoutes = PRELOAD_PAGE_ROUTES_BY_TAB['/pages/index/index'];
    expect(homeRoutes).not.toContain('/packageEvent/pages/personality-test/index');
    expect(homeRoutes).not.toContain('/packageEvent/pages/activity-lineup/index');
    expect(homeRoutes).not.toContain('/packageEvent/pages/ai-travel-guide/index');
  });

  it('keeps events tab focused on event detail', () => {
    expect(PRELOAD_PAGE_ROUTES_BY_TAB['/pages/events/index']).toEqual([
      '/packageEvent/pages/event-detail/index',
    ]);
  });

  it('keeps profile tab focused on notifications', () => {
    expect(PRELOAD_PAGE_ROUTES_BY_TAB['/pages/profile/index']).toEqual([
      '/packageProfile/pages/notifications/index',
    ]);
  });
});
