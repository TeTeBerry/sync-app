import { beforeEach, describe, expect, it, vi } from "vitest";
import Taro from "@tarojs/taro";
import {
  HOME_CACHE_MAX_AGE_MS,
  HOME_POPULAR_POSTS_PERSIST_LIMIT,
  hydrateHomeCachesFromStorage,
  persistHomeSummary,
  persistPopularPosts,
} from "./homeCacheStorage";
import { getCacheData, invalidateCache } from "../hooks/useApiQuery";
import type { HomeFeedPost, HomeSummary } from "../types/backend";

vi.mock("@tarojs/taro", () => ({
  default: {
    getStorageSync: vi.fn(),
    setStorageSync: vi.fn(),
  },
}));

vi.mock("../constants/api", () => ({
  isApiEnabled: () => true,
}));

vi.mock("./session", () => ({
  getClientUserId: () => "user-1",
}));

const mockSummary: HomeSummary = {
  heat: { people: 10, growthPercent: 0 },
  signupEvents: [
    {
      id: 1,
      title: "Test Fest",
      date: "06/01",
      location: "SZ",
      image: "",
      category: "edm",
      hot: false,
      attendees: 0,
      going: false,
    },
  ],
};

const mockPosts: HomeFeedPost[] = Array.from({ length: 10 }, (_, index) => ({
  id: `post-${index}`,
  name: "User",
  body: `body ${index}`,
}));

describe("homeCacheStorage", () => {
  beforeEach(() => {
    vi.mocked(Taro.getStorageSync).mockReturnValue("");
    vi.mocked(Taro.setStorageSync).mockClear();
    invalidateCache(["home"]);
    invalidateCache(["posts"]);
  });

  it("persists and hydrates home summary", () => {
    persistHomeSummary(mockSummary);
    expect(Taro.setStorageSync).toHaveBeenCalled();

    const stored = vi.mocked(Taro.setStorageSync).mock.calls[0]?.[1] as string;
    vi.mocked(Taro.getStorageSync).mockImplementation((key: string) => {
      if (key === "sync:home:summary:v1") return stored;
      return "";
    });

    hydrateHomeCachesFromStorage();
    expect(getCacheData<HomeSummary>(["home", "summary"])).toEqual(mockSummary);
  });

  it("persists at most HOME_POPULAR_POSTS_PERSIST_LIMIT posts", () => {
    persistPopularPosts(mockPosts);
    const stored = vi.mocked(Taro.setStorageSync).mock.calls[0]?.[1] as string;
    const envelope = JSON.parse(stored) as { data: HomeFeedPost[] };
    expect(envelope.data).toHaveLength(HOME_POPULAR_POSTS_PERSIST_LIMIT);
  });

  it("skips expired envelope on hydrate", () => {
    const expired = JSON.stringify({
      savedAt: Date.now() - HOME_CACHE_MAX_AGE_MS - 1,
      data: mockSummary,
    });
    vi.mocked(Taro.getStorageSync).mockReturnValue(expired);

    hydrateHomeCachesFromStorage();
    expect(getCacheData<HomeSummary>(["home", "summary"])).toBeUndefined();
  });
});
