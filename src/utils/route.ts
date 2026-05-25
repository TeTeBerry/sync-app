import Taro, { useDidShow } from "@tarojs/taro";
import { useCallback, useState } from "react";
import { useNavigationStore } from "../stores/navigationStore";
import type { AimatchNavIntent } from "../stores/types";

export const ROUTES = {
  HOME: "/pages/index/index",
  EVENTS: "/pages/events/index",
  EXPLORE: "/pages/explore/index",
  PROFILE: "/pages/profile/index",
  SETTINGS: "/pages/settings/index",
  CHAT: "/pages/chat/index",
  PINDAN: "/pages/pindan/index",
  AIMATCH: "/pages/aimatch/index",
  TICKETS: "/pages/tickets/index",
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

export type GoAiMatchOptions = AimatchNavIntent;

export function goAiMatch(options?: GoAiMatchOptions) {
  if (options && Object.values(options).some((value) => value != null && value !== ``)) {
    useNavigationStore.getState().setAimatchIntent(options);
  }

  void Taro.navigateTo({ url: ROUTES.AIMATCH });
}

export type PinDanTabType = "package" | "hotel" | "transport";

export type GoPindanOptions = {
  activityId?: number;
  type?: PinDanTabType;
  highlightId?: number;
};

function buildPindanUrl(options?: number | GoPindanOptions): string {
  if (options == null) return ROUTES.PINDAN;

  const params =
    typeof options === "number"
      ? { activityId: String(options) }
      : Object.entries(options).reduce<Record<string, string>>(
          (acc, [key, value]) => {
            if (value != null) acc[key] = String(value);
            return acc;
          },
          {},
        );

  const query = new URLSearchParams(params).toString();
  return query ? `${ROUTES.PINDAN}?${query}` : ROUTES.PINDAN;
}

export function goPindan(options?: number | GoPindanOptions) {
  const intent: GoPindanOptions | null =
    options == null
      ? null
      : typeof options === "number"
        ? { activityId: options }
        : options;

  if (intent && (intent.activityId != null || intent.type || intent.highlightId != null)) {
    useNavigationStore.getState().setPindanIntent(intent);
  }

  void Taro.navigateTo({ url: buildPindanUrl(options) });
}

export function goProfilePindan(highlightId?: number) {
  if (highlightId != null) {
    useNavigationStore.getState().setProfileIntent({
      tab: "pindan",
      highlightId,
    });
  }

  const params = new URLSearchParams({ tab: `pindan` });
  if (highlightId != null) params.set(`highlightId`, String(highlightId));
  reLaunchTo(`${ROUTES.PROFILE}?${params.toString()}` as RoutePath);
}

export function goProfileTickets(highlightTicketId?: string) {
  if (highlightTicketId) {
    useNavigationStore.getState().setProfileIntent({
      tab: "tickets",
      highlightTicketId,
    });
  }

  const params = new URLSearchParams({ tab: `tickets` });
  if (highlightTicketId) params.set(`highlightTicketId`, highlightTicketId);
  reLaunchTo(`${ROUTES.PROFILE}?${params.toString()}` as RoutePath);
}

export function goTickets() {
  void Taro.navigateTo({ url: ROUTES.TICKETS });
}

export function goBack(fallback: RoutePath = ROUTES.HOME) {
  const target = resolveFallback(fallback);
  const pages = Taro.getCurrentPages();
  // H5 SPA：栈深为 1 时 Taro 内部会 history.go(0)，返回无效
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
