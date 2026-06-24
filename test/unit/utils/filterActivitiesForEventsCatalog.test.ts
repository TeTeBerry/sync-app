import { beforeAll, describe, expect, it } from 'vitest';
import { loadMessages } from '@/i18n/messages';
import { useLocaleStore } from '@/i18n/localeStore';
import type { EventCardUi } from '@/utils/apiMappers';
import {
  filterActivitiesByRegion,
  filterActivitiesByTimeChip,
  formatActivityAreaLabel,
  HOT_CAROUSEL_MIN_COUNT,
  isAsianCatalogActivity,
  selectRecentAsianCatalogEvents,
} from '@/utils/filterActivitiesForEventsCatalog';

function event(
  partial: Partial<EventCardUi> & Pick<EventCardUi, 'title'>,
): EventCardUi {
  return {
    id: partial.id ?? '1',
    title: partial.title,
    date: partial.date ?? '06/13-14',
    location: partial.location ?? 'Bangkok',
    image: '',
    attendees: 0,
    category: '电音节',
    hot: partial.hot ?? false,
    going: false,
    region: partial.region,
    area: partial.area,
    alias: partial.alias,
  };
}

describe('filterActivitiesForEventsCatalog', () => {
  beforeAll(async () => {
    await loadMessages('zh-CN');
    useLocaleStore.setState({ locale: 'zh-CN' });
  });

  const events = [
    event({
      id: '1',
      title: 'EDC Thailand',
      region: 'overseas',
      area: '泰国',
      hot: true,
    }),
    event({
      id: '4',
      title: 'Storm',
      region: 'domestic',
      area: '中国',
      hot: true,
      date: '06/13-14',
    }),
    event({
      id: '8',
      title: 'EDC Korea',
      region: 'overseas',
      area: '韩国',
      hot: false,
      date: '10/03-04',
    }),
    event({
      id: '2',
      title: 'Defqon.1',
      region: 'overseas',
      area: '荷兰',
      hot: false,
      date: '06/25-28',
    }),
  ];

  it('filterActivitiesByRegion returns all for "all"', () => {
    expect(filterActivitiesByRegion(events, 'all')).toHaveLength(4);
  });

  it('filterActivitiesByRegion filters by region', () => {
    expect(filterActivitiesByRegion(events, 'domestic')).toEqual([events[1]]);
    expect(filterActivitiesByRegion(events, 'overseas')).toHaveLength(3);
  });

  it('filterActivitiesByTimeChip filters hot events', () => {
    expect(filterActivitiesByTimeChip(events, 'hot')).toHaveLength(2);
  });

  it('isAsianCatalogActivity uses area labels', () => {
    expect(isAsianCatalogActivity({ area: '泰国', region: 'overseas' })).toBe(true);
    expect(isAsianCatalogActivity({ area: '荷兰', region: 'overseas' })).toBe(false);
    expect(isAsianCatalogActivity({ region: 'domestic' })).toBe(true);
  });

  it('formatActivityAreaLabel prefers area over map region', () => {
    expect(formatActivityAreaLabel({ area: '日本', region: 'overseas' })).toBe('日本');
    expect(formatActivityAreaLabel({ region: 'overseas' })).toBe('海外');
  });

  it('selectRecentAsianCatalogEvents returns recent upcoming asian events sorted by date', () => {
    const now = new Date('2026-06-01T12:00:00.000Z');
    const recent = selectRecentAsianCatalogEvents(events, 5, now);
    expect(recent).toHaveLength(2);
    expect(recent.every((item) => isAsianCatalogActivity(item))).toBe(true);
    expect(recent.some((item) => item.area === '韩国')).toBe(false);
    expect(recent.some((item) => item.area === '荷兰')).toBe(false);
    expect(recent[0]?.title).toBe('EDC Thailand');
    expect(recent[1]?.title).toBe('Storm');
  });

  it('selectRecentAsianCatalogEvents includes non-hot asian events within recent window', () => {
    const now = new Date('2026-06-01T12:00:00.000Z');
    const withKorea = [
      ...events,
      event({
        id: '9',
        title: 'Ultra Korea',
        region: 'overseas',
        area: '韩国',
        hot: false,
        date: '07/10-11',
      }),
    ];
    const recent = selectRecentAsianCatalogEvents(withKorea, 5, now);
    expect(recent.some((item) => item.title === 'Ultra Korea')).toBe(true);
    expect(recent.some((item) => item.hot === false)).toBe(true);
  });

  it('recent carousel requires at least HOT_CAROUSEL_MIN_COUNT events', () => {
    const now = new Date('2026-06-01T12:00:00.000Z');
    const recent = selectRecentAsianCatalogEvents(events, 5, now);
    expect(recent.length >= HOT_CAROUSEL_MIN_COUNT).toBe(false);
  });
});
