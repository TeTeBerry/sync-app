import Taro from "@tarojs/taro";
import { getCacheKey, setCacheDataByKey } from "../hooks/useApiQuery";
import { isApiEnabled } from "../constants/api";
import { getClientUserId } from "./session";
import type { HomeFeedPost, HomeSummary } from "../types/backend";

export const HOME_POPULAR_POSTS_PERSIST_LIMIT = 8;
export const HOME_CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const SUMMARY_STORAGE_KEY = "sync:home:summary:v1";

function popularStorageKey(userId: string): string {
  return `sync:home:popular:v1:${userId}`;
}

type CacheEnvelope<T> = {
  savedAt: number;
  data: T;
};

function readEnvelope<T>(storageKey: string): T | undefined {
  try {
    const raw = Taro.getStorageSync(storageKey);
    if (!raw) return undefined;
    const parsed =
      typeof raw === "string"
        ? (JSON.parse(raw) as CacheEnvelope<T>)
        : (raw as CacheEnvelope<T>);
    if (!parsed?.data || typeof parsed.savedAt !== "number") {
      return undefined;
    }
    if (Date.now() - parsed.savedAt > HOME_CACHE_MAX_AGE_MS) {
      return undefined;
    }
    return parsed.data;
  } catch {
    return undefined;
  }
}

function writeEnvelope<T>(storageKey: string, data: T): void {
  try {
    const payload: CacheEnvelope<T> = {
      savedAt: Date.now(),
      data,
    };
    Taro.setStorageSync(storageKey, JSON.stringify(payload));
  } catch {
    // storage full or unavailable
  }
}

export function hydrateHomeCachesFromStorage(): void {
  if (!isApiEnabled()) {
    return;
  }

  const summary = readEnvelope<HomeSummary>(SUMMARY_STORAGE_KEY);
  if (summary) {
    setCacheDataByKey(getCacheKey(["home", "summary"]), summary);
  }

  const userId = getClientUserId();
  if (!userId) {
    return;
  }

  const popular = readEnvelope<HomeFeedPost[]>(popularStorageKey(userId));
  if (popular?.length) {
    setCacheDataByKey(getCacheKey(["posts", "popular", userId]), popular);
  }
}

export function persistHomeSummary(data: HomeSummary): void {
  if (!isApiEnabled()) {
    return;
  }
  writeEnvelope(SUMMARY_STORAGE_KEY, data);
}

export function persistPopularPosts(data: HomeFeedPost[]): void {
  if (!isApiEnabled()) {
    return;
  }
  const userId = getClientUserId();
  if (!userId) {
    return;
  }
  const trimmed = data.slice(0, HOME_POPULAR_POSTS_PERSIST_LIMIT);
  writeEnvelope(popularStorageKey(userId), trimmed);
}
