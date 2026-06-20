import { beforeEach, describe, expect, it } from 'vitest';
import {
  getCacheData,
  setCacheDataByKey,
  getCacheKey,
  invalidateCache,
} from '@/hooks/useApiQuery';
import {
  patchActivitySelectionInCaches,
  patchProfileSummaryOnSelection,
} from '@/cache/activityCache';
import type { BackendActivity, HomeSummary, ProfileSummary } from '@/types/backend';

const legacyId = 4;

const homeSummary: HomeSummary = {
  heat: { people: 10, growthPercent: 0 },
  signupEvents: [
    {
      id: legacyId,
      title: '风暴电音节',
      date: '2026-07-01',
      location: '上海',
      image: '',
      category: '电音节',
      hot: true,
      attendees: 5,
      going: false,
    },
  ],
};

const activities: BackendActivity[] = [
  {
    _id: 'activity-4',
    legacyId,
    name: '风暴电音节',
    code: 'storm',
    alias: [],
    date: '2026-07-01',
    location: '上海',
    hot: true,
    attendees: 5,
  },
];

const profileSummary: ProfileSummary = {
  name: 'Test',
  handle: 'test',
  location: '上海',
  bio: '',
  avatar: '',
  stats: { events: 2, posts: 1 },
};

describe('activityCache', () => {
  beforeEach(() => {
    setCacheDataByKey(getCacheKey(['home', 'summary']), homeSummary);
    setCacheDataByKey(getCacheKey(['activities']), activities);
    setCacheDataByKey(getCacheKey(['profile', 'summary']), profileSummary);
  });

  it('patchActivitySelectionInCaches sets attendees and going from server total', () => {
    patchActivitySelectionInCaches({
      legacyId,
      attendees: 6,
      going: true,
    });

    const summary = getCacheData<HomeSummary>(['home', 'summary']);
    expect(summary?.signupEvents[0]?.attendees).toBe(6);
    expect(summary?.signupEvents[0]?.going).toBe(true);
    expect(summary?.heat.people).toBe(11);

    const list = getCacheData<BackendActivity[]>(['activities']);
    expect(list?.[0]?.attendees).toBe(6);
  });

  it('updates going without changing attendees when total unchanged', () => {
    patchActivitySelectionInCaches({
      legacyId,
      attendees: 5,
      going: true,
    });

    const summary = getCacheData<HomeSummary>(['home', 'summary']);
    expect(summary?.signupEvents[0]?.attendees).toBe(5);
    expect(summary?.signupEvents[0]?.going).toBe(true);
    expect(summary?.heat.people).toBe(10);
  });

  it('decrements attendees on unregister', () => {
    patchActivitySelectionInCaches({
      legacyId,
      attendees: 4,
      going: false,
    });

    const summary = getCacheData<HomeSummary>(['home', 'summary']);
    expect(summary?.signupEvents[0]?.attendees).toBe(4);
    expect(summary?.signupEvents[0]?.going).toBe(false);
    expect(summary?.heat.people).toBe(9);
  });

  it('patchProfileSummaryOnSelection increments events stat for new selection', () => {
    const patched = patchProfileSummaryOnSelection({ isNewSelection: true });
    expect(patched).toBe(true);

    const summary = getCacheData<ProfileSummary>(['profile', 'summary']);
    expect(summary?.stats.events).toBe(3);
  });

  it('patchProfileSummaryOnSelection skips stat bump when already registered', () => {
    const patched = patchProfileSummaryOnSelection({ isNewSelection: false });
    expect(patched).toBe(true);

    const summary = getCacheData<ProfileSummary>(['profile', 'summary']);
    expect(summary?.stats.events).toBe(2);
  });

  it('patchProfileSummaryOnSelection returns false without cached summary', () => {
    invalidateCache(['profile', 'summary']);
    const patched = patchProfileSummaryOnSelection({ isNewSelection: true });
    expect(patched).toBe(false);
  });
});
