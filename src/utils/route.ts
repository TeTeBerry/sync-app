import Taro, { useDidShow } from "@tarojs/taro";
import { useCallback, useState } from "react";

export const ROUTES = {
  HOME: "/pages/index/index",
  EVENTS: "/pages/events/index",
  EXPLORE: "/pages/explore/index",
  PROFILE: "/pages/profile/index",
  CHAT: "/pages/chat/index",
  PINDAN: "/pages/pindan/index",
  AIMATCH: "/pages/aimatch/index",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

function currentRoutePath(): string {
  const pages = Taro.getCurrentPages();
  const route = pages[pages.length - 1]?.route;
  return route ? `/${route}` : "";
}

/** Bottom tabs: replace route without stacking history like the old SPA Router. */
export function reLaunchTo(url: RoutePath) {
  void Taro.reLaunch({ url });
}

export function go(url: RoutePath | string) {
  void Taro.navigateTo({ url });
}

export function goPindan(activityId?: number) {
  const url = activityId ? `${ROUTES.PINDAN}?activityId=${activityId}` : ROUTES.PINDAN;
  void Taro.navigateTo({ url });
}

export function goBack() {
  void Taro.navigateBack();
}

export function useActiveRoutePath(): string {
  const [path, setPath] = useState(() => currentRoutePath());
  const bump = useCallback(() => setPath(currentRoutePath()), []);
  useDidShow(() => bump());
  return path;
}
