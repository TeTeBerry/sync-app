import Taro, { useDidShow } from '@tarojs/taro';
import { useCallback, useEffect, useState } from 'react';
import { useNavigationStore } from '../stores/navigationStore';
import type { NavigationState } from '../stores/navigationStore';
import type { AiAssistantNavIntent } from '../stores/types';
import type { NotificationMeta } from '../types/backend';
import { parseActivityLegacyId } from './activityLegacyId';
import {
  buildQueryString,
  normalizeQueryString,
  parseQueryString,
} from './queryString';
import { getCacheData } from '../hooks/useApiQuery';
import { findBackendActivityByLegacyId } from './apiMappers';
import { seedActivityDetailCache } from './activityDetailCache';
import { PRELOAD_HOT_ROUTES_MS } from './timing';
import {
  preloadAiSubpackage,
  preloadEventSubpackage,
  preloadProfileSubpackage,
  preloadStackSubpackages,
} from './subpackagePreload';
import type { BackendActivity } from '../types/backend';
import { isAuthGated, requireAuth } from './authGate';
import type { LoginInterceptFeature } from '../stores/loginInterceptStore';

export { parseActivityLegacyId } from './activityLegacyId';

export const ROUTES = {
  HOME: '/pages/index/index',
  EVENTS: '/pages/events/index',
  PROFILE: '/pages/profile/index',
  PROFILE_ACTIVITIES: '/packageProfile/pages/profile-activities/index',
  PROFILE_BENEFITS: '/packageProfile/pages/profile-benefits/index',
  PROFILE_POSTS: '/packageProfile/pages/profile-posts/index',
  SETTINGS: '/packageProfile/pages/settings/index',
  AI_ASSISTANT: '/packageAi/pages/ai-assistant/index',
  EVENT_DETAIL: '/packageEvent/pages/event-detail/index',
  EVENT_MAP: '/packageEvent/pages/event-map/index',
  EXCLUSIVE_ITINERARY: '/packageEvent/pages/exclusive-itinerary/index',
  MY_ITINERARY: '/packageEvent/pages/my-itinerary/index',
  NOTIFICATIONS: '/packageProfile/pages/notifications/index',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

const TAB_ROUTE_PATHS = new Set<RoutePath>([
  ROUTES.HOME,
  ROUTES.EVENTS,
  ROUTES.PROFILE,
]);

/** Stack pages warmed after tab settle; event detail also preloaded on card touch. */
const PRELOAD_HOT_ROUTES: RoutePath[] = [
  ROUTES.EVENT_DETAIL,
  ROUTES.NOTIFICATIONS,
  ROUTES.AI_ASSISTANT,
];

const tabRouteListeners = new Set<() => void>();

function notifyTabRouteChange() {
  for (const listener of tabRouteListeners) {
    listener();
  }
}

export function subscribeTabRouteChange(listener: () => void): () => void {
  tabRouteListeners.add(listener);
  return () => {
    tabRouteListeners.delete(listener);
  };
}

export function isTabRoute(url: string): url is RoutePath {
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

/** Decode query params that WeChat may leave percent-encoded (e.g. Chinese titles). */
export function decodeRouteQueryParam(value?: string): string {
  if (!value?.trim()) {
    return '';
  }
  let decoded = value.trim();
  for (let pass = 0; pass < 2; pass += 1) {
    if (!/%[0-9A-Fa-f]{2}/.test(decoded)) {
      break;
    }
    try {
      const next = decodeURIComponent(decoded.replace(/\+/g, ' '));
      if (next === decoded) {
        break;
      }
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
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

/** Preload common stack targets after tab pages settle (deferred to avoid webview races). */
export function preloadHotRoutes() {
  if (process.env.TARO_ENV !== 'weapp') {
    return;
  }
  if (preloadTimer != null) {
    clearTimeout(preloadTimer);
  }
  preloadTimer = setTimeout(() => {
    preloadTimer = null;
    if (isNavigating) {
      return;
    }
    preloadStackSubpackages();
    for (const route of PRELOAD_HOT_ROUTES) {
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
  [ROUTES.AI_ASSISTANT]: 'ai_match',
  [ROUTES.NOTIFICATIONS]: 'notification',
  [ROUTES.PROFILE_ACTIVITIES]: 'activity',
  [ROUTES.PROFILE_POSTS]: 'post',
  [ROUTES.PROFILE_BENEFITS]: 'benefits',
  [ROUTES.EXCLUSIVE_ITINERARY]: 'activity',
  [ROUTES.MY_ITINERARY]: 'activity',
};

function loginFeatureForUrl(url: string): LoginInterceptFeature | null {
  const [rawPath = '', rawQuery = ''] = url.split('?');
  const path = normalizePath(rawPath) as RoutePath;

  if (path === ROUTES.SETTINGS) {
    const section = parseQueryString(rawQuery).section;
    if (section === 'notifications') return 'notification';
    if (section === 'privacy') return 'benefits';
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

/** Tab pages: switchTab keeps tab stacks alive (smoother than reLaunch). */
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
    reLaunchTo(url);
    return;
  }

  markNavigationStart(url);

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
  options?: { postId?: string },
): Record<string, string> {
  const query: Record<string, string> = {
    id: String(legacyId),
    activityLegacyId: String(legacyId),
  };
  const postId = options?.postId?.trim();
  if (postId) {
    query.postId = postId;
  }
  return query;
}

export function goEventDetail(eventId: number | string, options?: { postId?: string }) {
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
    seedActivityDetailCache(fromList);
  }
  useNavigationStore.getState().setActiveActivityLegacyId(legacyId);
  const query = buildEventDetailQuery(legacyId, options);
  preloadEventSubpackage();
  navigateToSafe(buildPageUrl(ROUTES.EVENT_DETAIL, query), {
    eventId: legacyId,
  });
}

export type GoEventMapOptions = {
  title?: string;
  dateRange?: string;
};

export function goExclusiveItinerary(activityLegacyId: number) {
  const legacyId = parseActivityLegacyId(activityLegacyId);
  if (legacyId == null) {
    void Taro.showToast({ title: '活动信息无效', icon: 'none' });
    return;
  }
  const query: Record<string, string> = {
    id: String(legacyId),
    activityLegacyId: String(legacyId),
  };
  useNavigationStore.getState().setActiveActivityLegacyId(legacyId);
  preloadEventSubpackage();
  navigateToSafe(buildPageUrl(ROUTES.EXCLUSIVE_ITINERARY, query));
}

export function goMyItinerary(activityLegacyId?: number, selectedDjIds?: string[]) {
  const query: Record<string, string> = {};
  const legacyId = parseActivityLegacyId(activityLegacyId);
  if (legacyId != null) {
    query.id = String(legacyId);
    query.activityLegacyId = String(legacyId);
    useNavigationStore.getState().setActiveActivityLegacyId(legacyId);
  }
  const ids = selectedDjIds?.map((id) => id.trim()).filter(Boolean) ?? [];
  if (ids.length > 0) {
    query.selectedDjIds = ids.join(',');
  }
  preloadEventSubpackage();
  navigateToSafe(buildPageUrl(ROUTES.MY_ITINERARY, query));
}

export function goEventMap(activityLegacyId: number, options?: GoEventMapOptions) {
  const query: Record<string, string> = {
    activityLegacyId: String(activityLegacyId),
  };
  const title = options?.title?.trim();
  if (title) {
    query.title = title;
  }
  const dateRange = options?.dateRange?.trim();
  if (dateRange) {
    query.dateRange = dateRange;
  }
  if (activityLegacyId > 0) {
    useNavigationStore.getState().setActiveActivityLegacyId(activityLegacyId);
  }
  navigateToSafe(buildPageUrl(ROUTES.EVENT_MAP, query));
}

function resolveActivityLegacyId(meta?: NotificationMeta): number | null {
  if (meta?.activityLegacyId != null && !Number.isNaN(meta.activityLegacyId)) {
    return meta.activityLegacyId;
  }
  const legacy = Number(meta?.activityId);
  return Number.isFinite(legacy) && legacy > 0 ? legacy : null;
}

/** Navigate from notification meta; returns true when a route was opened. */
export function navigateFromNotification(meta?: NotificationMeta): boolean {
  if (meta?.type === 'post_hidden') {
    goProfile();
    return true;
  }

  const legacyId = resolveActivityLegacyId(meta);
  if (legacyId == null) {
    return false;
  }

  if (meta?.type === 'match_recommendation') {
    goEventDetail(legacyId, meta?.postId ? { postId: meta.postId } : undefined);
    return true;
  }

  if (meta?.type === 'post_rejected') {
    goAiAssistant({ activityLegacyId: legacyId });
    return true;
  }

  goEventDetail(legacyId, meta?.postId ? { postId: meta.postId } : undefined);
  return true;
}

export function goProfile() {
  switchTabTo(ROUTES.PROFILE);
}

/** Full benefits list (e.g. from upgrade sheets or profile preview link). */
export function goProfileBenefits() {
  endRouteTransition();
  navigateToSafe(ROUTES.PROFILE_BENEFITS);
}

/** Profile tab with package upgrade sheet open. */
export function goProfileUpgrade() {
  requireAuth(() => {
    useNavigationStore.getState().setProfileIntent({ openPackageSheet: true });
    switchTabTo(ROUTES.PROFILE);
  }, 'benefits');
}

export type GoAiAssistantOptions = Pick<
  AiAssistantNavIntent,
  'initialMessage' | 'activityLegacyId'
>;

/** Pre-download AI subpackage and warm ai-assistant page (touch / mount). */
export function warmAiAssistant(): void {
  preloadAiSubpackage();
  preloadPageSafe(ROUTES.AI_ASSISTANT);
}

export function goAiAssistant(options?: GoAiAssistantOptions) {
  const intent: AiAssistantNavIntent = {};
  if (options?.initialMessage?.trim()) {
    intent.initialMessage = options.initialMessage.trim();
  }
  if (options?.activityLegacyId != null && !Number.isNaN(options.activityLegacyId)) {
    intent.activityLegacyId = options.activityLegacyId;
    useNavigationStore.getState().setActiveActivityLegacyId(options.activityLegacyId);
  } else {
    useNavigationStore.getState().setActiveActivityLegacyId(null);
  }
  if (intent.initialMessage || intent.activityLegacyId != null) {
    useNavigationStore.getState().setAiAssistantIntent(intent);
  }

  warmAiAssistant();
  navigateToSafe(ROUTES.AI_ASSISTANT);
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

export function useActiveRoutePath(): string {
  const [path, setPath] = useState(() => currentRoutePath());
  const bump = useCallback(() => setPath(currentRoutePath()), []);
  useDidShow(() => bump());

  useEffect(() => {
    return subscribeTabRouteChange(bump);
  }, [bump]);

  return path;
}

export function useRouteTransitionActive(eventId?: number): boolean {
  return useNavigationStore((state) => selectRouteTransitionActive(state, eventId));
}
