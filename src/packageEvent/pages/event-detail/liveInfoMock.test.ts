import { describe, expect, it } from 'vitest';
import {
  MOCK_LIVE_INFO_CERT_COUNT,
  MOCK_LIVE_INFO_FEED,
  MOCK_LIVE_INFO_SUMMARY,
  resolveLiveInfoCertCount,
  resolveLiveInfoFeed,
  resolveLiveInfoSummary,
} from './liveInfoMock';

describe('resolveLiveInfoFeed', () => {
  it('returns mock feed when API feed is empty', () => {
    expect(resolveLiveInfoFeed([])).toBe(MOCK_LIVE_INFO_FEED);
    expect(resolveLiveInfoFeed(undefined)).toBe(MOCK_LIVE_INFO_FEED);
    expect(resolveLiveInfoFeed(null)).toBe(MOCK_LIVE_INFO_FEED);
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
});

describe('resolveLiveInfoSummary', () => {
  it('returns mock summary when API summary is empty', () => {
    expect(resolveLiveInfoSummary([])).toBe(MOCK_LIVE_INFO_SUMMARY);
    expect(resolveLiveInfoSummary(undefined)).toBe(MOCK_LIVE_INFO_SUMMARY);
  });

  it('keeps non-empty API summary', () => {
    const rows = [{ categoryId: 'entry_crowd' as const, score: 4 }];
    expect(resolveLiveInfoSummary(rows)).toEqual(rows);
  });
});

describe('resolveLiveInfoCertCount', () => {
  it('returns mock cert count when certCount is missing and feed is empty', () => {
    expect(resolveLiveInfoCertCount(undefined, [])).toBe(MOCK_LIVE_INFO_CERT_COUNT);
    expect(resolveLiveInfoCertCount(undefined, undefined)).toBe(
      MOCK_LIVE_INFO_CERT_COUNT,
    );
  });

  it('uses positive certCount from API', () => {
    expect(resolveLiveInfoCertCount(12, [])).toBe(12);
  });

  it('preserves zero certCount when feed has items', () => {
    const feed = MOCK_LIVE_INFO_FEED.slice(0, 1);
    expect(resolveLiveInfoCertCount(0, feed)).toBe(0);
  });
});
