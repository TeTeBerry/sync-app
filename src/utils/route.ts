import Taro, { useDidShow } from "@tarojs/taro";
import { useCallback, useState } from "react";
import { useNavigationStore } from "../stores/navigationStore";
import type { AiAssistantNavIntent } from "../stores/types";
import type { NotificationMeta } from "../types/backend";

export const ROUTES = {
  HOME: "/pages/index/index",
  EVENTS: "/pages/events/index",
  EXPLORE: "/pages/explore/index",
  PROFILE: "/pages/profile/index",
  SETTINGS: "/pages/settings/index",
  AI_ASSISTANT: "/pages/ai-assistant/index",
  EVENT_DETAIL: "/pages/event-detail/index",
  NOTIFICATIONS: "/pages/notifications/index",
  ALL_POSTS: "/pages/posts/index",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

function currentRoutePath(): string {
  const pages = Taro.getCurrentPages();
  const route = pages[pages.length - 1]?.route;
  return route ? `/${route}` : "";
}

function resolveFallback(fallback: RoutePath | unknown): RoutePath {
  return typeof fallback === `string` ? (fallback as RoutePath) : ROUTES.HOME;
}

/** Bottom tabs: replace route without stacking history like the old SPA Router. */
export function reLaunchTo(url: RoutePath) {
  void Taro.reLaunch({ url }).catch(() => {
    void Taro.navigateTo({ url }).catch(() => {});
  });
}

export function go(url: RoutePath | string) {
  void Taro.navigateTo({ url });
}

export function goEventDetail(eventId: number, options?: { postId?: string }) {
  useNavigationStore.getState().setActiveActivityLegacyId(eventId);
  const params = new URLSearchParams({ id: String(eventId) });
  const postId = options?.postId?.trim();
  if (postId) {
    params.set("postId", postId);
  }
  void Taro.navigateTo({ url: `${ROUTES.EVENT_DETAIL}?${params.toString()}` });
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

  void Taro.navigateTo({ url: ROUTES.AI_ASSISTANT });
}

export function goBack(fallback: RoutePath = ROUTES.HOME) {
  const target = resolveFallback(fallback);
  const pages = Taro.getCurrentPages();
  if (pages.length <= 1) {
    reLaunchTo(target);
    return;
  }

  void Taro.navigateBack({
    delta: 1,
    fail: () => {
      reLaunchTo(target);
    },
  }).catch(() => {
    reLaunchTo(target);
  });
}

export function useActiveRoutePath(): string {
  const [path, setPath] = useState(() => currentRoutePath());
  const bump = useCallback(() => setPath(currentRoutePath()), []);
  useDidShow(() => bump());
  return path;
}
