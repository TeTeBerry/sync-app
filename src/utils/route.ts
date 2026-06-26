import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';
import { showAppToast } from './appToast';
import { bindActivity } from '../domains/activity-scope';
import { useNavigationStore } from '../stores/navigationStore';
import type { NavigationState } from '../stores/navigationStore';
import type { ExclusiveItineraryNavIntent } from '../stores/types';
import type { BuddyPostSheetPrefill } from './travelGuideToBuddyPost';
import { prefetchPersonalityTestAudioMedia } from '../domains/personality-test';
import type { AiGuidePlanFormValues } from '../types/travelGuide';
import type { BackendActivity, HomeSummary, NotificationMeta } from '../types/backend';
import { PRELOAD_HOT_ROUTES_MS } from './timing';
import {
  ensureEventSubpackageLoaded,
  preloadEventSubpackage,
  preloadProfileSubpackage,
} from './subpackagePreload';
import { parseActivityLegacyId } from './activityLegacyId';
import {
  buildQueryString,
  normalizeQueryString,
  parseQueryString,
} from './queryString';
import { getCacheData } from '../hooks/useApiQuery';
import { findBackendActivityByLegacyId } from './apiMappers';
import { seedActivityDetailFromHomeSignupEvent } from './activityDetailCache';
import { prefetchEventPostsPage } from '../cache/eventPostsPageCache';
import { isAuthGated, requireAuth } from './authGate';
import type { LoginInterceptFeature } from '../stores/loginInterceptStore';
import { setEventsViewTabIntent } from './eventsTabIntent';
import { setEventsSearchQuery } from './eventsSearchIntent';
import { encodeSelectedDjList } from '../domains/performance-itinerary/utils/itineraryBanner';
import { PRELOAD_PAGE_ROUTES_BY_TAB, type PreloadTabPath } from './routePreload.config';

export const ROUTES = {
  HOME: '/pages/index/index',
  EVENTS: '/pages/events/index',
  PROFILE: '/pages/profile/index',
  PROFILE_ACTIVITIES: '/packageProfile/pages/profile-activities/index',
  PROFILE_POSTS: '/packageProfile/pages/profile-posts/index',
  SETTINGS: '/packageProfile/pages/settings/index',
  LEGAL_DOCUMENT: '/packageProfile/pages/legal-document/index',
  PLUR_FILM_WEBVIEW: '/packageProfile/pages/plur-film-webview/index',
  /** Legacy subpackage deep link — redirects to home. */
  AI_ASSISTANT: '/packageAi/pages/ai-assistant/index',
  EVENT_DETAIL: '/packageEvent/pages/event-detail/index',
  EXCLUSIVE_ITINERARY: '/packageEvent/pages/exclusive-itinerary/index',
  ACTIVITY_LINEUP: '/packageEvent/pages/activity-lineup/index',
  MY_ITINERARY: '/packageEvent/pages/my-itinerary/index',
  PERSONALITY_TEST: '/packageEvent/pages/personality-test/index',
  SET_VOTE: '/packageEvent/pages/set-vote/index',
  AI_TRAVEL_GUIDE: '/packageEvent/pages/ai-travel-guide/index',
  NOTIFICATIONS: '/packageProfile/pages/notifications/index',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

const TAB_ROUTE_PATHS = new Set<RoutePath>([
  ROUTES.HOME,
  ROUTES.EVENTS,
  ROUTES.PROFILE,
]);

export type TabRoutePath = PreloadTabPath;

function preloadSubpackagesForTab(tab: PreloadTabPath): void {
  preloadEventSubpackage();
  if (tab === ROUTES.PROFILE) {
    preloadProfileSubpackage();
  }
}

function resolvePreloadTab(path?: string): PreloadTabPath {
  const tab = resolveTabRouteFromPath(path ?? '');
  if (tab) {
    return tab;
  }
  return ROUTES.HOME;
}

/** Map a page route (tab root or subpackage stack) to its bottom-nav tab. */
export function resolveTabRouteFromPath(path: string): PreloadTabPath | null {
  const base = normalizePath(path.split('?')[0] ?? path);
  if (TAB_ROUTE_PATHS.has(base as RoutePath)) {
    return base as PreloadTabPath;
  }
  if (base.startsWith('/packageProfile/')) {
    return ROUTES.PROFILE;
  }
  if (base.startsWith('/packageAi/')) {
    return ROUTES.HOME;
  }
  return null;
}

const tabRouteListeners = new Set<() => void>();
/** Tab highlight before `getCurrentPages()` reflects `switchTab` (custom tab bar). */
let optimisticTabPath: PreloadTabPath | null = null;
/** Last tab selected — used for packageEvent stack pages (no tab root in route). */
let lastTabBarPath: PreloadTabPath = ROUTES.HOME;

function notifyTabRouteChange() {
  for (const listener of tabRouteListeners) {
    listener();
  }
}

/** Tab pages call on useDidShow so the custom tab bar stays in sync. */
export function syncTabBarRoute(tabPath: PreloadTabPath): void {
  optimisticTabPath = tabPath;
  lastTabBarPath = tabPath;
  notifyTabRouteChange();
}

/** Stack pages with an embedded tab bar sync highlight from the visible route. */
export function syncTabBarFromCurrentPage(): void {
  const tab = resolveTabRouteFromPath(currentRoutePath());
  if (tab) {
    syncTabBarRoute(tab);
    return;
  }
  notifyTabRouteChange();
}

function resolveActiveRoutePath(): PreloadTabPath {
  const current = currentRoutePath();
  const tabFromCurrent = resolveTabRouteFromPath(current);
  if (tabFromCurrent) {
    lastTabBarPath = tabFromCurrent;
    if (optimisticTabPath === tabFromCurrent) {
      optimisticTabPath = null;
    }
    return tabFromCurrent;
  }
  if (optimisticTabPath) {
    return optimisticTabPath;
  }
  return lastTabBarPath;
}

/** True when the visible page is the tab root (not a subpackage stack page). */
export function isOnTabRoot(path: RoutePath): boolean {
  if (!isTabRoute(path)) {
    return false;
  }
  return currentRoutePath() === normalizePath(path);
}

function clearStuckTabSwitchState(target?: RoutePath) {
  const normalizedTarget = target ? normalizePath(target) : null;
  if (
    optimisticTabPath &&
    (!normalizedTarget || optimisticTabPath !== normalizedTarget)
  ) {
    optimisticTabPath = null;
    notifyTabRouteChange();
  }
  const transition = useNavigationStore.getState().routeTransition;
  if (
    transition?.active &&
    transition.tabTarget &&
    (!normalizedTarget || transition.tabTarget !== normalizedTarget)
  ) {
    endRouteTransition();
  }
}

export function subscribeTabRouteChange(listener: () => void): () => void {
  tabRouteListeners.add(listener);
  return () => {
    tabRouteListeners.delete(listener);
  };
}

export function isTabRoute(url: string): url is TabRoutePath {
  return TAB_ROUTE_PATHS.has(normalizePath(url) as RoutePath);
}

/** Blocks duplicate taps only; first navigation is never delayed. */
const NAV_DEBOUNCE_MS = 120;
/** WeChat mini program page stack limit is 10 — redirect before hitting the cap. */
const WEAPP_PAGE_STACK_REDIRECT_THRESHOLD = 8;

let navigationChain: Promise<void> = Promise.resolve();
let isNavigating = false;
let lastNavAt = 0;
let lastNavUrl = '';
let preloadTimer: ReturnType<typeof setTimeout> | null = null;

function normalizePath(path: string): string {
  const base = path.split('?')[0] ?? path;
  return base.startsWith('/') ? base : `/${base}`;
}

function normalizeNavigationUrl(url: string): string {
  const [rawPath, rawQuery = ''] = url.split('?');
  const path = normalizePath(rawPath);
  if (!rawQuery) {
    return path;
  }
  const qs = normalizeQueryString(rawQuery);
  return qs ? `${path}?${qs}` : path;
}

function currentPageUrl(): string {
  const pages = Taro.getCurrentPages();
  const page = pages[pages.length - 1] as
    | { route?: string; options?: Record<string, string | undefined> }
    | undefined;
  if (!page?.route) {
    return '';
  }
  const path = normalizePath(page.route);
  const options = page.options ?? {};
  const query: Record<string, string> = {};
  for (const [key, value] of Object.entries(options)) {
    if (value != null && value !== '') {
      query[key] = String(value);
    }
  }
  const qs = buildQueryString(query);
  return qs ? `${path}?${qs}` : path;
}

function currentRoutePath(): string {
  return normalizePath(currentPageUrl());
}

function currentRoutePathOnly(): string {
  return normalizePath(currentPageUrl().split('?')[0] ?? currentPageUrl());
}

function isOnAiTravelGuidePage(): boolean {
  return currentRoutePathOnly() === normalizePath(ROUTES.AI_TRAVEL_GUIDE);
}

function isWebviewCountLimitError(err: unknown): boolean {
  const msg =
    typeof err === 'object' && err && 'errMsg' in err
      ? String((err as { errMsg?: string }).errMsg ?? '')
      : String(err ?? '');
  return msg.includes('webview count limit');
}

function shouldRedirectNavigation(url: string): boolean {
  if (process.env.TARO_ENV !== 'weapp') {
    return false;
  }
  const targetPath = normalizePath(url.split('?')[0] ?? url);
  if (currentRoutePathOnly() === targetPath) {
    return true;
  }
  return Taro.getCurrentPages().length >= WEAPP_PAGE_STACK_REDIRECT_THRESHOLD;
}

function openStackPageSafe(
  url: string,
  options?: { eventId?: number; replace?: boolean },
) {
  if (options?.replace || shouldRedirectNavigation(url)) {
    redirectToSafe(url);
    return;
  }
  navigateToSafe(url, options);
}

/** Resolve event-detail id from query params and optional navigation-store fallback. */
export function resolveEventDetailIdFromQuery(
  params: Record<string, string | undefined>,
  fallbackLegacyId?: number | null,
): number {
  const fromId = parseActivityLegacyId(params.id);
  if (fromId != null) {
    return fromId;
  }
  const fromLegacy = parseActivityLegacyId(params.activityLegacyId);
  if (fromLegacy != null) {
    return fromLegacy;
  }
  const fromStore = parseActivityLegacyId(fallbackLegacyId);
  if (fromStore != null) {
    return fromStore;
  }
  return NaN;
}

function resolveFallback(fallback: RoutePath | unknown): RoutePath {
  return typeof fallback === `string` ? (fallback as RoutePath) : ROUTES.HOME;
}

function buildPageUrl(path: RoutePath, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) {
    return path;
  }
  const qs = buildQueryString(query);
  return qs ? `${path}?${qs}` : path;
}

function shouldSkipNavigation(url: string): boolean {
  const target = normalizeNavigationUrl(url);
  const current = normalizeNavigationUrl(currentPageUrl());
  const targetPath = normalizePath(url.split('?')[0] ?? url);

  if (isTabRoute(targetPath as RoutePath)) {
    if (current && current === target && isOnTabRoot(targetPath as RoutePath)) {
      return true;
    }
    // In-flight switch to another tab — honor the new tap (don't debounce away).
    if (optimisticTabPath && optimisticTabPath !== targetPath) {
      return false;
    }
  } else if (current && current === target) {
    return true;
  }

  const now = Date.now();
  if (lastNavUrl === target && now - lastNavAt < NAV_DEBOUNCE_MS) {
    return true;
  }
  return false;
}

function markNavigationStart(url: string) {
  isNavigating = true;
  lastNavAt = Date.now();
  lastNavUrl = normalizeNavigationUrl(url);
}

function markNavigationEnd() {
  isNavigating = false;
}

function runSerializedNavigation(task: () => Promise<void>): void {
  const run = navigationChain.then(task);
  navigationChain = run.then(
    () => undefined,
    () => undefined,
  );
  void run;
}

/** WeChat preloadPage — warms page JS/WXML; never call immediately before navigateTo. */
export function preloadPageSafe(path: RoutePath, query?: Record<string, string>) {
  if (process.env.TARO_ENV !== 'weapp' || isNavigating) {
    return;
  }
  const preload = Taro.preloadPage as
    | ((options: { url: string }) => Promise<void>)
    | undefined;
  if (typeof preload !== 'function') {
    return;
  }
  const url = buildPageUrl(path, query);
  void preload({ url }).catch(() => {});
}

/** Preload stack targets for the current (or given) tab after settle. */
export function preloadHotRoutes(tabPath?: PreloadTabPath) {
  if (process.env.TARO_ENV !== 'weapp') {
    return;
  }
  const tab = tabPath ?? (resolvePreloadTab(currentRoutePath()) as PreloadTabPath);
  const routes =
    PRELOAD_PAGE_ROUTES_BY_TAB[tab] ?? PRELOAD_PAGE_ROUTES_BY_TAB[ROUTES.HOME];
  if (preloadTimer != null) {
    clearTimeout(preloadTimer);
  }
  preloadTimer = setTimeout(() => {
    preloadTimer = null;
    if (isNavigating) {
      return;
    }
    preloadSubpackagesForTab(tab);
    for (const route of routes) {
      preloadPageSafe(route);
    }
  }, PRELOAD_HOT_ROUTES_MS);
}

/** Zustand selector: only the target event card should re-render on transition. */
export function selectRouteTransitionActive(
  state: NavigationState,
  eventId?: number,
): boolean {
  const { active, eventId: transitionEventId } = state.routeTransition;
  if (!active) {
    return false;
  }
  if (eventId == null) {
    return true;
  }
  return transitionEventId === eventId;
}

export function beginRouteTransition(options?: {
  eventId?: number;
  tabTarget?: RoutePath;
}) {
  useNavigationStore.getState().beginRouteTransition(options);
}

/** Themed overlay while switching between tab-bar pages (BottomNav / switchTab). */
export function beginTabRouteTransition(target: RoutePath) {
  if (!isTabRoute(target) || shouldSkipNavigation(target)) {
    return;
  }
  beginRouteTransition({ tabTarget: target });
}

export function endRouteTransition() {
  useNavigationStore.getState().endRouteTransition();
}

const AUTH_PROTECTED_ROUTES: Partial<Record<RoutePath, LoginInterceptFeature>> = {
  [ROUTES.AI_ASSISTANT]: 'ai_assistant',
  [ROUTES.NOTIFICATIONS]: 'notification',
  [ROUTES.PROFILE_ACTIVITIES]: 'activity',
  [ROUTES.PROFILE_POSTS]: 'social',
  [ROUTES.EXCLUSIVE_ITINERARY]: 'activity',
  [ROUTES.MY_ITINERARY]: 'activity',
};

function loginFeatureForUrl(url: string): LoginInterceptFeature | null {
  const [rawPath = '', rawQuery = ''] = url.split('?');
  const path = normalizePath(rawPath) as RoutePath;

  if (path === ROUTES.SETTINGS) {
    const section = parseQueryString(rawQuery).section;
    if (section === 'notifications') return 'notification';
    if (section === 'privacy') return 'general';
    return null;
  }

  return AUTH_PROTECTED_ROUTES[path] ?? null;
}

function navigateToSafe(url: string, _options?: { eventId?: number }) {
  if (shouldSkipNavigation(url)) {
    return;
  }

  const loginFeature = loginFeatureForUrl(url);
  if (loginFeature && isAuthGated()) {
    requireAuth(() => navigateToSafe(url, _options), loginFeature);
    return;
  }

  markNavigationStart(url);

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.navigateTo({
          url,
          success: () => resolve(),
          fail: (err) => {
            if (isWebviewCountLimitError(err)) {
              lastNavAt = 0;
              redirectToSafe(url);
              resolve();
              return;
            }
            endRouteTransition();
            showAppToast('common.pageOpenFailed');
            resolve();
          },
          complete: () => {
            markNavigationEnd();
          },
        });
      }),
  );
}

function redirectToSafe(url: string) {
  if (shouldSkipNavigation(url)) {
    return;
  }

  const loginFeature = loginFeatureForUrl(url);
  if (loginFeature && isAuthGated()) {
    requireAuth(() => redirectToSafe(url), loginFeature);
    return;
  }

  markNavigationStart(url);

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.redirectTo({
          url,
          success: () => resolve(),
          fail: () => {
            endRouteTransition();
            showAppToast('common.pageOpenFailed');
            resolve();
          },
          complete: () => {
            markNavigationEnd();
          },
        });
      }),
  );
}

export type SwitchTabOptions = {
  /** Always invoke switchTab (e.g. home CTA) and resync custom tab bar highlight. */
  force?: boolean;
};

/** Tab pages: switchTab keeps tab stacks alive (smoother than reLaunch). */
/** Open activities tab on the list view (e.g. home 「全部」). */
export function goEventsListTab() {
  setEventsViewTabIntent('list');
  switchTabTo(ROUTES.EVENTS, { force: true });
}

/** Open activities tab with optional list search prefilled (from home 查节 / example chips). */
export function goEventsWithSearch(query?: string) {
  setEventsViewTabIntent('list');
  if (query?.trim()) {
    setEventsSearchQuery(query.trim());
  }
  switchTabTo(ROUTES.EVENTS, { force: true });
}

export function switchTabTo(url: RoutePath, options?: SwitchTabOptions) {
  if (!isTabRoute(url)) {
    reLaunchTo(url);
    return;
  }
  const targetPath = url as PreloadTabPath;
  if (!options?.force && shouldSkipNavigation(url)) {
    clearStuckTabSwitchState(url);
    const actualTab = resolveTabRouteFromPath(currentRoutePath());
    if (actualTab) {
      syncTabBarRoute(actualTab);
    }
    return;
  }

  if (!options?.force || !isOnTabRoot(url)) {
    beginTabRouteTransition(url);
  }

  if (process.env.TARO_ENV !== 'weapp') {
    syncTabBarRoute(targetPath);
    reLaunchTo(url);
    return;
  }

  markNavigationStart(url);
  syncTabBarRoute(targetPath);

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.switchTab({
          url,
          success: () => {
            syncTabBarRoute(targetPath);
            resolve();
          },
          fail: () => {
            optimisticTabPath = null;
            notifyTabRouteChange();
            endRouteTransition();
            Taro.reLaunch({
              url,
              complete: () => resolve(),
            });
          },
          complete: () => {
            markNavigationEnd();
          },
        });
      }),
  );
}

/** Non-tab or fallback: replace entire stack. Tab URLs on weapp use switchTabTo. */
export function reLaunchTo(url: RoutePath) {
  if (process.env.TARO_ENV === 'weapp' && isTabRoute(url)) {
    switchTabTo(url);
    return;
  }
  if (shouldSkipNavigation(url)) {
    return;
  }

  markNavigationStart(url);

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.reLaunch({
          url,
          success: () => resolve(),
          fail: () => resolve(),
          complete: () => {
            markNavigationEnd();
          },
        });
      }),
  );
}

export function go(url: RoutePath | string) {
  navigateToSafe(url);
}

/** Query params for event-detail; keep `id` + `activityLegacyId` in sync for preload/navigate. */
export function buildEventDetailQuery(
  legacyId: number,
  options?: {
    postId?: string;
    focusPosts?: boolean;
    openBuddyPost?: boolean;
    openComments?: boolean;
    openGuide?: boolean;
  },
): Record<string, string> {
  const query: Record<string, string> = {
    id: String(legacyId),
    activityLegacyId: String(legacyId),
  };
  const postId = options?.postId?.trim();
  if (postId) {
    query.postId = postId;
  }
  if (options?.focusPosts) {
    query.focusPosts = '1';
  }
  if (options?.openBuddyPost) {
    query.openBuddyPost = '1';
  }
  if (options?.openComments) {
    query.openComments = '1';
  }
  if (options?.openGuide) {
    query.openGuide = '1';
  }
  return query;
}

export function goEventDetail(
  eventId: number | string,
  options?: {
    postId?: string;
    focusPosts?: boolean;
    openBuddyPost?: boolean;
    openComments?: boolean;
    openGuide?: boolean;
    /** Replace current stack page instead of pushing (e.g. from ai-travel-guide). */
    replace?: boolean;
  },
) {
  const legacyId = parseActivityLegacyId(eventId);
  if (legacyId == null) {
    showAppToast('common.invalidActivity');
    return;
  }
  const activities = getCacheData<BackendActivity[]>(['activities']);
  const fromList = activities
    ? findBackendActivityByLegacyId(activities, legacyId)
    : undefined;
  if (fromList) {
    bindActivity(legacyId, { activity: fromList });
  } else {
    const summary = getCacheData<HomeSummary>(['home', 'summary']);
    const fromHome = summary?.signupEvents.find((event) => event.id === legacyId);
    if (fromHome) {
      seedActivityDetailFromHomeSignupEvent(fromHome);
    }
    bindActivity(legacyId);
  }
  const query = buildEventDetailQuery(legacyId, options);
  prefetchEventPostsPage(legacyId, { anchorPostId: options?.postId });
  preloadEventSubpackage();
  const url = buildPageUrl(ROUTES.EVENT_DETAIL, query);
  openStackPageSafe(url, {
    eventId: legacyId,
    replace: options?.replace || isOnAiTravelGuidePage(),
  });
}

export function goEventDetailWithBuddyPostPrefill(
  eventId: number | string,
  prefill: BuddyPostSheetPrefill,
) {
  const legacyId = parseActivityLegacyId(eventId);
  if (legacyId == null) {
    showAppToast('common.invalidActivity');
    return;
  }
  useNavigationStore.getState().setEventDetailBuddyPostIntent({
    activityLegacyId: legacyId,
    initialValues: prefill.form,
    prefillSummaryLines: prefill.summaryLines,
    prefillBannerTitle: prefill.prefillBannerTitle,
  });
  goEventDetail(legacyId, { openBuddyPost: true, focusPosts: true });
}

export function goExclusiveItinerary(
  activityLegacyId: number,
  selectedDjIds?: string[],
  options?: {
    focusDjName?: string;
    selectedDjNames?: string[];
    /** Skip auto-redirect to saved timetable (e.g. 重新选择). */
    reselect?: boolean;
  },
) {
  const legacyId = parseActivityLegacyId(activityLegacyId);
  if (legacyId == null) {
    showAppToast('common.invalidActivity');
    return;
  }
  const query: Record<string, string> = {
    id: String(legacyId),
    activityLegacyId: String(legacyId),
  };
  const ids = selectedDjIds?.map((id) => id.trim()).filter(Boolean) ?? [];
  const names =
    options?.selectedDjNames?.map((name) => name.trim()).filter(Boolean) ?? [];
  const focusDjName = options?.focusDjName?.trim();

  if (ids.length > 0 || names.length > 0 || focusDjName) {
    const intent: ExclusiveItineraryNavIntent = {
      activityLegacyId: legacyId,
      selectedDjIds: ids,
      selectedDjNames: names.length > 0 ? names : ids,
      focusDjName,
    };
    useNavigationStore.getState().setExclusiveItineraryIntent(intent);
  }

  if (ids.length > 0) {
    query.selectedDjIds = encodeSelectedDjList(ids);
  }
  if (focusDjName) {
    query.focusDjName = focusDjName;
  }
  if (names.length > 0) {
    query.selectedDjNames = encodeSelectedDjList(names);
  }
  if (options?.reselect) {
    query.reselect = '1';
  }
  bindActivity(legacyId);
  preloadEventSubpackage();
  navigateToSafe(buildPageUrl(ROUTES.EXCLUSIVE_ITINERARY, query));
}

export function goActivityLineup(activityLegacyId: number) {
  const legacyId = parseActivityLegacyId(activityLegacyId);
  if (legacyId == null) {
    showAppToast('common.invalidActivity');
    return;
  }
  const query: Record<string, string> = {
    id: String(legacyId),
    activityLegacyId: String(legacyId),
  };
  bindActivity(legacyId);
  preloadEventSubpackage();
  navigateToSafe(buildPageUrl(ROUTES.ACTIVITY_LINEUP, query));
}

export function goMyItinerary(
  activityLegacyId?: number,
  selectedDjIds?: string[],
  options?: { replace?: boolean; headcount?: number },
) {
  const query: Record<string, string> = {};
  const legacyId = parseActivityLegacyId(activityLegacyId);
  if (legacyId != null) {
    query.id = String(legacyId);
    query.activityLegacyId = String(legacyId);
    bindActivity(legacyId);
  }
  const ids = selectedDjIds?.map((id) => id.trim()).filter(Boolean) ?? [];
  if (ids.length > 0) {
    query.selectedDjIds = encodeSelectedDjList(ids);
  }
  if (
    options?.headcount != null &&
    Number.isFinite(options.headcount) &&
    options.headcount > 0
  ) {
    query.headcount = String(Math.round(options.headcount));
  }
  preloadEventSubpackage();
  const url = buildPageUrl(ROUTES.MY_ITINERARY, query);
  if (options?.replace) {
    redirectToSafe(url);
    return;
  }
  navigateToSafe(url);
}

export function goPersonalityTest(options?: { viewResult?: boolean }) {
  const query: Record<string, string> = {};
  if (options?.viewResult) {
    query.view = 'result';
  }
  const url = buildPageUrl(ROUTES.PERSONALITY_TEST, query);
  prefetchPersonalityTestAudioMedia();
  void ensureEventSubpackageLoaded().then(() => navigateToSafe(url));
}

export function goSetVote(
  activityLegacyId: number | string,
  options?: { sharePicks?: string[] },
) {
  const legacyId = parseActivityLegacyId(activityLegacyId);
  if (legacyId == null) {
    showAppToast('common.invalidActivity');
    return;
  }
  const query: Record<string, string> = {
    id: String(legacyId),
    activityLegacyId: String(legacyId),
    voteMode: '1',
  };
  if (options?.sharePicks?.length) {
    query.share = '1';
    query.voterPicks = encodeSelectedDjList(options.sharePicks);
  }
  bindActivity(legacyId);
  preloadEventSubpackage();
  const url = buildPageUrl(ROUTES.ACTIVITY_LINEUP, query);
  openStackPageSafe(url, { eventId: legacyId });
}

export function goAiTravelGuide(guideId: string) {
  const id = guideId.trim();
  if (!id) {
    showAppToast('common.invalidGuide');
    return;
  }
  requireAuth(() => {
    preloadEventSubpackage();
    openStackPageSafe(buildPageUrl(ROUTES.AI_TRAVEL_GUIDE, { guideId: id }));
  }, 'ai_assistant');
}

function resolveActivityLegacyId(meta?: NotificationMeta): number | null {
  return parseActivityLegacyId(meta?.activityLegacyId);
}

/** Navigate from notification meta; returns true when a route was opened. */
export async function navigateFromNotification(
  meta?: NotificationMeta,
): Promise<boolean> {
  if (!meta) return false;

  if (meta.type === 'post_hidden') {
    goProfile();
    return true;
  }

  const postId = meta.postId?.trim();

  if (meta.type === 'post_rejected') {
    const legacyId = resolveActivityLegacyId(meta);
    if (legacyId == null) return false;
    goEventDetail(legacyId, { focusPosts: true });
    return true;
  }

  const legacyId = resolveActivityLegacyId(meta);
  if (legacyId == null) return false;

  const opensPostThread = meta.type === 'comment' || meta.type === 'comment_reply';

  goEventDetail(
    legacyId,
    postId
      ? {
          postId,
          focusPosts: opensPostThread || undefined,
          openComments: opensPostThread || undefined,
        }
      : undefined,
  );
  return true;
}

export function goProfile() {
  switchTabTo(ROUTES.PROFILE);
}

export function goEventDetailTravelGuideSheet(
  activityLegacyId: number,
  prefill?: AiGuidePlanFormValues,
  regenerateGuideId?: string,
) {
  if (prefill) {
    useNavigationStore.getState().setEventDetailTravelGuideIntent({
      activityLegacyId,
      prefillTravelGuideForm: prefill,
      ...(regenerateGuideId?.trim()
        ? { regenerateGuideId: regenerateGuideId.trim() }
        : {}),
    });
  }
  goEventDetail(activityLegacyId, { openGuide: true });
}

/** Open performance schedule — saved itinerary if available, otherwise lineup browser. */
export function goActivitySchedule(
  activityLegacyId: number,
  options?: { hasItinerary?: boolean },
) {
  if (options?.hasItinerary) {
    goMyItinerary(activityLegacyId);
    return;
  }
  goExclusiveItinerary(activityLegacyId);
}

export function goNotifications() {
  preloadProfileSubpackage();
  preloadPageSafe(ROUTES.NOTIFICATIONS);
  navigateToSafe(ROUTES.NOTIFICATIONS);
}

function relaunchOrSwitchTab(target: RoutePath) {
  if (isTabRoute(target)) {
    switchTabTo(target);
    return;
  }
  reLaunchTo(target);
}

export function goBack(fallback: RoutePath = ROUTES.HOME) {
  endRouteTransition();
  const target = resolveFallback(fallback);
  const pages = Taro.getCurrentPages();
  if (pages.length <= 1) {
    relaunchOrSwitchTab(target);
    return;
  }

  markNavigationStart('__back__');

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.navigateBack({
          delta: 1,
          success: () => resolve(),
          fail: () => {
            relaunchOrSwitchTab(target);
            resolve();
          },
          complete: () => {
            markNavigationEnd();
          },
        });
      }),
  );
}

export function useActiveRoutePath(): TabRoutePath {
  const [path, setPath] = useState(() => resolveActiveRoutePath());
  const bump = useCallback(() => {
    setPath(resolveActiveRoutePath());
  }, []);

  useEffect(() => {
    return subscribeTabRouteChange(bump);
  }, [bump]);

  return path;
}

export function useRouteTransitionActive(eventId?: number): boolean {
  return useNavigationStore((state) => selectRouteTransitionActive(state, eventId));
}
