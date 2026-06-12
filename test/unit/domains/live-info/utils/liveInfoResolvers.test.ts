import { describe, expect, it } from 'vitest';
import {
  resolveLiveInfoCertCount,
  resolveLiveInfoFeed,
  resolveLiveInfoSummary,
  resolveLiveInfoZones,
} from '@/domains/live-info/utils/liveInfoResolvers';

describe('liveInfoResolvers', () => {
  it('returns empty feed when API feed is empty', () => {
    expect(resolveLiveInfoFeed([])).toEqual([]);
    expect(resolveLiveInfoFeed(undefined)).toEqual([]);
  });

  it('keeps non-empty API feed', () => {
    const apiFeed = [
      {
        id: 'api-1',
        userName: 'Tester',
        authorOnSiteVerified: true,
        zoneTag: 'venue',
        zoneLabel: '全场',
        timeLabel: '刚刚',
        ratings: [{ categoryId: 'entry_crowd' as const, score: 3 }],
        likes: 0,
      },
    ];
    expect(resolveLiveInfoFeed(apiFeed)).toEqual(apiFeed);
  });

  it('returns empty summary when API summary is empty', () => {
    expect(resolveLiveInfoSummary([])).toEqual([]);
    expect(resolveLiveInfoSummary(undefined)).toEqual([]);
  });

  it('uses cert count from API or zero', () => {
    expect(resolveLiveInfoCertCount(undefined)).toBe(0);
    expect(resolveLiveInfoCertCount(12)).toBe(12);
  });

  it('falls back to default venue zone', () => {
    expect(resolveLiveInfoZones([])).toEqual([{ id: 'venue', label: '全场' }]);
  });
});
