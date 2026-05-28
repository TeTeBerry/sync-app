import Taro, { useDidShow } from "@tarojs/taro";
import { useCallback, useState } from "react";
import { useNavigationStore } from "../stores/navigationStore";
import type { NavigationState } from "../stores/navigationStore";
import type { AiAssistantNavIntent } from "../stores/types";
import type { NotificationMeta } from "../types/backend";
import { PRELOAD_HOT_ROUTES_MS } from "./timing";

export const ROUTES = {
  HOME: "/pages/index/index",
  EVENTS: "/pages/events/index",
  PROFILE: "/pages/profile/index",
  SETTINGS: "/pages/settings/index",
  AI_ASSISTANT: "/pages/ai-assistant/index",
  EVENT_DETAIL: "/pages/event-detail/index",
  NOTIFICATIONS: "/pages/notifications/index",
  ALL_POSTS: "/pages/posts/index",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

const PRELOAD_HOT_ROUTES: RoutePath[] = [
  ROUTES.EVENT_DETAIL,
  ROUTES.AI_ASSISTANT,
  ROUTES.NOTIFICATIONS,
];

/** Blocks duplicate taps only; first navigation is never delayed. */
const NAV_DEBOUNCE_MS = 120;

let navigationChain: Promise<void> = Promise.resolve();
let isNavigating = false;
let lastNavAt = 0;
let lastNavUrl = "";
let preloadTimer: ReturnType<typeof setTimeout> | null = null;

function normalizePath(path: string): string {
  const base = path.split("?")[0] ?? path;
  return base.startsWith("/") ? base : `/${base}`;
}

function pathsEqual(a: string, b: string): boolean {
  return normalizePath(a) === normalizePath(b);
}

function currentRoutePath(): string {
  const pages = Taro.getCurrentPages();
  const route = pages[pages.length - 1]?.route;
  return route ? `/${route}` : "";
}

function resolveFallback(fallback: RoutePath | unknown): RoutePath {
  return typeof fallback === `string` ? (fallback as RoutePath) : ROUTES.HOME;
}

function buildPageUrl(path: RoutePath, query?: Record<string, string>): string {
  if (!query || Object.keys(query).length === 0) {
    return path;
  }
  const params = new URLSearchParams(query);
  return `${path}?${params.toString()}`;
}

function shouldSkipNavigation(url: string): boolean {
  const path = normalizePath(url);
  if (pathsEqual(currentRoutePath(), path)) {
    return true;
  }
  const now = Date.now();
  if (lastNavUrl === url && now - lastNavAt < NAV_DEBOUNCE_MS) {
    return true;
  }
  return false;
}

function markNavigationStart(url: string) {
  isNavigating = true;
  lastNavAt = Date.now();
  lastNavUrl = url;
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
  if (process.env.TARO_ENV !== "weapp" || isNavigating) {
    return;
  }
  const preload = Taro.preloadPage as ((options: { url: string }) => Promise<void>) | undefined;
  if (typeof preload !== "function") {
    return;
  }
  const url = buildPageUrl(path, query);
  void preload({ url }).catch(() => {});
}

/** Preload common stack targets after tab pages settle (deferred to avoid webview races). */
export function preloadHotRoutes() {
  if (process.env.TARO_ENV !== "weapp") {
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

export function beginRouteTransition(options?: { eventId?: number }) {
  useNavigationStore.getState().beginRouteTransition(options);
}

export function endRouteTransition() {
  useNavigationStore.getState().endRouteTransition();
}

function navigateToSafe(url: string, options?: { eventId?: number }) {
  if (shouldSkipNavigation(url)) {
    return;
  }

  beginRouteTransition(
    options?.eventId != null ? { eventId: options.eventId } : undefined,
  );
  markNavigationStart(url);

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.navigateTo({
          url,
          success: () => resolve(),
          fail: () => {
            endRouteTransition();
            resolve();
          },
          complete: () => {
            markNavigationEnd();
          },
        });
      }),
  );
}

/** Bottom tabs: replace route without stacking history like the old SPA Router. */
export function reLaunchTo(url: RoutePath) {
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

export function goEventDetail(eventId: number, options?: { postId?: string }) {
  useNavigationStore.getState().setActiveActivityLegacyId(eventId);
  const query: Record<string, string> = { id: String(eventId) };
  const postId = options?.postId?.trim();
  if (postId) {
    query.postId = postId;
  }
  navigateToSafe(buildPageUrl(ROUTES.EVENT_DETAIL, query), { eventId });
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
  if (meta?.type === "post_hidden") {
    goProfile();
    return true;
  }

  const legacyId = resolveActivityLegacyId(meta);
  if (legacyId == null) {
    return false;
  }

  if (meta?.type === "match_recommendation") {
    goEventDetail(legacyId, meta?.postId ? { postId: meta.postId } : undefined);
    return true;
  }

  if (meta?.type === "post_rejected") {
    goAiAssistant({ activityLegacyId: legacyId });
    return true;
  }

  goEventDetail(legacyId, meta?.postId ? { postId: meta.postId } : undefined);
  return true;
}

export function goProfile() {
  reLaunchTo(ROUTES.PROFILE);
}

export type GoAiAssistantOptions = Pick<AiAssistantNavIntent, "initialMessage" | "activityLegacyId">;

export function goAiAssistant(options?: GoAiAssistantOptions) {
  const intent: AiAssistantNavIntent = {};
  if (options?.initialMessage?.trim()) {
    intent.initialMessage = options.initialMessage.trim();
  }
  if (options?.activityLegacyId != null && !Number.isNaN(options.activityLegacyId)) {
    intent.activityLegacyId = options.activityLegacyId;
    useNavigationStore.getState().setActiveActivityLegacyId(options.activityLegacyId);
  }
  if (intent.initialMessage || intent.activityLegacyId != null) {
    useNavigationStore.getState().setAiAssistantIntent(intent);
  }

  navigateToSafe(ROUTES.AI_ASSISTANT);
}

export function goNotifications() {
  navigateToSafe(ROUTES.NOTIFICATIONS);
}

export function goBack(fallback: RoutePath = ROUTES.HOME) {
  endRouteTransition();
  const target = resolveFallback(fallback);
  const pages = Taro.getCurrentPages();
  if (pages.length <= 1) {
    reLaunchTo(target);
    return;
  }

  markNavigationStart("__back__");

  runSerializedNavigation(
    () =>
      new Promise<void>((resolve) => {
        Taro.navigateBack({
          delta: 1,
          success: () => resolve(),
          fail: () => {
            reLaunchTo(target);
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
  return path;
}

export function useRouteTransitionActive(eventId?: number): boolean {
  return useNavigationStore((state) => selectRouteTransitionActive(state, eventId));
}
