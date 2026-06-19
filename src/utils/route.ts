import Taro from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';
import { bindActivity, clearActivityScope } from '../domains/activity-scope';
import { useNavigationStore } from '../stores/navigationStore';
import type { ExclusiveItineraryNavIntent } from '../stores/types';
import type { PersonalityBuddyPostPrefill } from '../domains/personality-test/utils/buildPersonalityBuddyPostPrefill';
import { encodeSelectedDjList } from '../domains/performance-itinerary/utils/itineraryBanner';
import type { NavigationState } from '../stores/navigationStore';
import type { AiAssistantNavIntent } from '../stores/types';
import type { BackendActivity, HomeSummary, NotificationMeta } from '../types/backend';
import { PRELOAD_HOT_ROUTES_MS } from './timing';
import {
  ensureEventSubpackageLoaded,
  preloadAiSubpackage,
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
import { useLoginInterceptStore } from '../stores/loginInterceptStore';
import { setEventsViewTabIntent } from './eventsTabIntent';

export const ROUTES = {
  HOME: '/pages/index/index',
  AI: '/pages/ai/index',
  EVENTS: '/pages/events/index',
  PROFILE: '/pages/profile/index',
  PROFILE_ACTIVITIES: '/packageProfile/pages/profile-activities/index',
  PROFILE_POSTS: '/packageProfile/pages/profile-posts/index',
  SETTINGS: '/packageProfile/pages/settings/index',
  LEGAL_DOCUMENT: '/packageProfile/pages/legal-document/index',
  /** Legacy subpackage deep link — `packageAi/pages/ai-assistant` redirects to `ROUTES.AI`. */
  AI_ASSISTANT: '/packageAi/pages/ai-assistant/index',
  EVENT_DETAIL: '/packageEvent/pages/event-detail/index',
  EXCLUSIVE_ITINERARY: '/packageEvent/pages/exclusive-itinerary/index',
  MY_ITINERARY: '/packageEvent/pages/my-itinerary/index',
  PERSONALITY_TEST: '/packageEvent/pages/personality-test/index',
  AI_TRAVEL_GUIDE: '/packageEvent/pages/ai-travel-guide/index',
  NOTIFICATIONS: '/packageProfile/pages/notifications/index',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

const TAB_ROUTE_PATHS = new Set<RoutePath>([
  ROUTES.HOME,
  ROUTES.AI,
  ROUTES.EVENTS,
  ROUTES.PROFILE,
]);

type PreloadTabPath =
  | typeof ROUTES.HOME
  | typeof ROUTES.AI
  | typeof ROUTES.EVENTS
  | typeof ROUTES.PROFILE;

export type TabRoutePath = PreloadTabPath;

/** Stack pages per tab; event/profile subpackages preload on tab switch */
const PRELOAD_PAGE_ROUTES_BY_TAB: Record<PreloadTabPath, RoutePath[]> = {
  [ROUTES.HOME]: [
    ROUTES.EVENT_DETAIL,
    ROUTES.NOTIFICATIONS,
    ROUTES.PERSONALITY_TEST,
    ROUTES.AI_TRAVEL_GUIDE,
  ],
  [ROUTES.AI]: [ROUTES.EVENT_DETAIL, ROUTES.AI_TRAVEL_GUIDE],
  [ROUTES.EVENTS]: [ROUTES.EVENT_DETAIL],
  [ROUTES.PROFILE]: [ROUTES.NOTIFICATIONS],
};

function preloadSubpackagesForTab(tab: PreloadTabPath): void {
  preloadEventSubpackage();
  if (tab === ROUTES.AI) {
    preloadAiSubpackage();
  }
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
    return ROUTES.AI;
  }
  return null;
}

const tabRouteListeners = new Set<() => void>();
/** Tab highlight before `getCurrentPages()` reflects `switchTab` (custom tab bar). */
let optimisticTabPath: PreloadTabPath | null = null;

function notifyTabRouteChange() {
  for (const listener of tabRouteListeners) {
    listener();
  }
}

/** Tab pages call on useDidShow so the custom tab bar stays in sync. */
export function syncTabBarRoute(tabPath: PreloadTabPath): void {
  optimisticTabPath = tabPath;
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
    if (optimisticTabPath === tabFromCurrent) {
      optimisticTabPath = null;
    }
    return tabFromCurrent;
  }
  if (optimisticTabPath) {
    return optimisticTabPath;
  }
  return resolvePreloadTab(current);
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
  if (current && current === target) {
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
  [ROUTES.AI]: 'ai_assistant',
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
          fail: () => {
            endRouteTransition();
            void Taro.showToast({ title: '页面打开失败', icon: 'none' });
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
            void Taro.showToast({ title: '页面打开失败', icon: 'none' });
            resolve();
          },
          complete: () => {
            markNavigationEnd();
          },
        });
      }),
  );
}

/** Tab pages: switchTab keeps tab stacks alive (smoother than reLaunch). */
/** Open activities tab on the list view (e.g. home 「全部」). */
export function goEventsListTab() {
  setEventsViewTabIntent('list');
  switchTabTo(ROUTES.EVENTS);
}

export function switchTabTo(url: RoutePath) {
  if (!isTabRoute(url)) {
    reLaunchTo(url);
    return;
  }
  if (shouldSkipNavigation(url)) {
    return;
  }

  beginTabRouteTransition(url);

  if (process.env.TARO_ENV !== 'weapp') {
    optimisticTabPath = url;
    notifyTabRouteChange();
    reLaunchTo(url);
    return;
  }

  markNavigationStart(url);
  optimisticTabPath = url;
  notifyTabRouteChange();

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.switchTab({
          url,
          success: () => {
            notifyTabRouteChange();
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
  },
) {
  const legacyId = parseActivityLegacyId(eventId);
  if (legacyId == null) {
    void Taro.showToast({ title: '活动信息无效', icon: 'none' });
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
  navigateToSafe(buildPageUrl(ROUTES.EVENT_DETAIL, query), {
    eventId: legacyId,
  });
}

export function goEventDetailWithBuddyPostPrefill(
  eventId: number | string,
  prefill: PersonalityBuddyPostPrefill,
) {
  const legacyId = parseActivityLegacyId(eventId);
  if (legacyId == null) {
    void Taro.showToast({ title: '活动信息无效', icon: 'none' });
    return;
  }
  useNavigationStore.getState().setEventDetailBuddyPostIntent({
    activityLegacyId: legacyId,
    initialValues: prefill.form,
    prefillSummaryLines: prefill.summaryLines,
    prefillBannerTitle: prefill.bannerTitle,
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
    void Taro.showToast({ title: '活动信息无效', icon: 'none' });
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

export function goMyItinerary(
  activityLegacyId?: number,
  selectedDjIds?: string[],
  options?: { replace?: boolean },
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
  void ensureEventSubpackageLoaded().then(() => navigateToSafe(url));
}

export function goAiTravelGuide(guideId: string) {
  const id = guideId.trim();
  if (!id) {
    void Taro.showToast({ title: '攻略信息无效', icon: 'none' });
    return;
  }
  requireAuth(() => {
    preloadEventSubpackage();
    navigateToSafe(buildPageUrl(ROUTES.AI_TRAVEL_GUIDE, { guideId: id }));
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
    goAiAssistant({ activityLegacyId: legacyId });
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

export type GoAiAssistantOptions = Pick<
  AiAssistantNavIntent,
  | 'initialMessage'
  | 'activityLegacyId'
  | 'openAiGuideSheet'
  | 'prefillTravelGuideForm'
  | 'autoRunTravelGuideForm'
>;

/** Pre-download AI subpackage (touch / mount). */
export function warmAiAssistant(): void {
  preloadAiSubpackage();
}

export function goAiAssistant(options?: GoAiAssistantOptions) {
  const intent: AiAssistantNavIntent = {};
  if (options?.initialMessage?.trim()) {
    intent.initialMessage = options.initialMessage.trim();
  }
  if (options?.activityLegacyId != null && !Number.isNaN(options.activityLegacyId)) {
    intent.activityLegacyId = options.activityLegacyId;
    bindActivity(options.activityLegacyId);
  } else {
    clearActivityScope();
  }
  if (options?.openAiGuideSheet) {
    intent.openAiGuideSheet = true;
  }
  if (options?.prefillTravelGuideForm) {
    intent.prefillTravelGuideForm = options.prefillTravelGuideForm;
  }
  if (options?.autoRunTravelGuideForm) {
    intent.autoRunTravelGuideForm = options.autoRunTravelGuideForm;
  }
  if (
    intent.initialMessage ||
    intent.activityLegacyId != null ||
    intent.openAiGuideSheet ||
    intent.prefillTravelGuideForm ||
    intent.autoRunTravelGuideForm
  ) {
    useNavigationStore.getState().setAiAssistantIntent(intent);
  }

  warmAiAssistant();
  switchTabTo(ROUTES.AI);
  if (isAuthGated()) {
    useLoginInterceptStore.getState().show('ai_assistant', () => {});
  }
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
