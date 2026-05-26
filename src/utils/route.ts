import Taro, { useDidShow } from "@tarojs/taro";
import { useCallback, useState } from "react";
import { useNavigationStore } from "../stores/navigationStore";
import type { AiAssistantNavIntent } from "../stores/types";

export const ROUTES = {
  HOME: "/pages/index/index",
  EVENTS: "/pages/events/index",
  EXPLORE: "/pages/explore/index",
  PROFILE: "/pages/profile/index",
  SETTINGS: "/pages/settings/index",
  AI_ASSISTANT: "/pages/ai-assistant/index",
  EVENT_DETAIL: "/pages/event-detail/index",
  NOTIFICATIONS: "/pages/notifications/index",
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

export function goEventDetail(eventId: number) {
  void Taro.navigateTo({ url: `${ROUTES.EVENT_DETAIL}?id=${eventId}` });
}

export type GoAiAssistantOptions = Pick<AiAssistantNavIntent, "initialMessage">;

export function goAiAssistant(options?: GoAiAssistantOptions) {
  if (options?.initialMessage?.trim()) {
    useNavigationStore.getState().setAiAssistantIntent({ initialMessage: options.initialMessage.trim() });
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
