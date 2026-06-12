import { describe, expect, it } from 'vitest';
import type { ItineraryTimelineItem } from '@/domains/performance-itinerary/types/myItineraryUi';
import { FIXTURE_ITINERARY_DAYS } from '../../../../fixtures/itineraryUi.fixture';
import {
  buildWallpaperRows,
  buildWallpaperSectionsByDate,
  isPerformanceTimelineItem,
  parseTitleArtistStage,
  timelineItemToWallpaperRow,
} from '@/domains/performance-itinerary/utils/itineraryWallpaperParse';

describe('parseTitleArtistStage', () => {
  it('splits artist and stage on middle dot separator', () => {
    expect(parseTitleArtistStage('Marshmello · A舞台 (主舞台)')).toEqual({
      artist: 'Marshmello',
      stage: 'A舞台 (主舞台)',
    });
    expect(parseTitleArtistStage('Eric Prydz · B舞台')).toEqual({
      artist: 'Eric Prydz',
      stage: 'B舞台',
    });
  });

  it('uses subtitle as stage when title has no separator', () => {
    expect(parseTitleArtistStage('出发前往场馆', '建议提前 1.5 小时出发')).toEqual({
      artist: '出发前往场馆',
      stage: '建议提前 1.5 小时出发',
    });
  });

  it('returns empty stage when no subtitle and no separator', () => {
    expect(parseTitleArtistStage('户外区 Brunch 休息')).toEqual({
      artist: '户外区 Brunch 休息',
      stage: '',
    });
  });
});

describe('isPerformanceTimelineItem', () => {
  it('excludes departure and travel-reminder nodes', () => {
    expect(
      isPerformanceTimelineItem({
        id: 'depart',
        time: '17:30',
        dotColor: 'pink',
        title: '出发前往场馆',
        pill: { label: '出行提醒', variant: 'green' },
      }),
    ).toBe(false);
  });

  it('excludes items without artist · stage in title', () => {
    expect(
      isPerformanceTimelineItem({
        id: 'brunch',
        time: '12:00',
        dotColor: 'cyan',
        title: '午间休息',
        pill: { label: '休息推荐', variant: 'green' },
      }),
    ).toBe(false);
  });

  it('includes LLM-style items with timeTag but no middle dot in title', () => {
    expect(
      isPerformanceTimelineItem({
        id: 'slander',
        time: '21:00',
        dotColor: 'pink',
        title: 'SLANDER',
        subtitle: 'Brostep 专场',
        timeTag: '21:00-22:15',
        highlighted: true,
        pill: { label: '重点演出 · 必看', variant: 'pink' },
      }),
    ).toBe(true);
  });

  it('includes titles separated by hyphen', () => {
    expect(
      isPerformanceTimelineItem({
        id: 'excision',
        time: '19:00',
        dotColor: 'cyan',
        title: 'EXCISION - 主舞台',
        timeTag: '19:00-20:15',
      }),
    ).toBe(true);
  });

  it('includes performance items with artist and stage', () => {
    expect(
      isPerformanceTimelineItem({
        id: 'marshmello',
        time: '21:00',
        dotColor: 'pink',
        title: 'Marshmello · A舞台 (主舞台)',
        highlighted: true,
      }),
    ).toBe(true);
  });
});

describe('buildWallpaperRows', () => {
  const sample: ItineraryTimelineItem[] = [
    {
      id: 'a',
      time: '17:30',
      dotColor: 'pink',
      title: '出发前往场馆',
      pill: { label: '出行提醒', variant: 'green' },
    },
    {
      id: 'b',
      time: '21:00',
      dotColor: 'pink',
      title: 'Marshmello · A舞台 (主舞台)',
      highlighted: true,
    },
    {
      id: 'c',
      time: '22:30',
      dotColor: 'purple',
      title: 'ILLENIUM · A舞台 (主舞台)',
    },
  ];

  it('keeps performances in timeline order and skips travel nodes', () => {
    const rows = buildWallpaperRows(sample);
    expect(rows).toHaveLength(2);
    expect(rows[0]?.artist).toBe('Marshmello');
    expect(rows[1]?.artist).toBe('ILLENIUM');
    expect(rows.some((r) => r.artist.includes('出发'))).toBe(false);
  });

  it('does not reorder highlighted performances ahead of earlier slots', () => {
    const items: ItineraryTimelineItem[] = [
      {
        id: 'early',
        time: '20:00',
        dotColor: 'cyan',
        title: 'ILLENIUM · A舞台 (主舞台)',
      },
      {
        id: 'late',
        time: '21:00',
        dotColor: 'pink',
        title: 'Marshmello · A舞台 (主舞台)',
        highlighted: true,
      },
    ];
    const rows = buildWallpaperRows(items);
    expect(rows.map((r) => r.artist)).toEqual(['ILLENIUM', 'Marshmello']);
  });

  it('includes all performances without truncation', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      id: `id-${i}`,
      time: `1${i}:00`,
      dotColor: 'cyan' as const,
      title: `Artist ${i} · Stage ${i}`,
    }));
    const rows = buildWallpaperRows(many);
    expect(rows).toHaveLength(10);
  });
});

describe('buildWallpaperSectionsByDate', () => {
  it('groups performances by date and omits days without performances', () => {
    const sections = buildWallpaperSectionsByDate(
      FIXTURE_ITINERARY_DAYS.map((day) => ({
        dateKey: day.id,
        dateLabel: day.bannerDateLabel,
        items: day.items,
      })),
    );

    expect(sections).toHaveLength(2);
    expect(sections[0]?.dateLabel).toBe('6月13日');
    expect(sections[0]?.rows.map((r) => r.artist)).toEqual(['EXCISION', 'MARSHMELLO']);
    expect(sections[1]?.dateLabel).toBe('6月14日');
    expect(sections[1]?.rows.map((r) => r.artist)).toEqual(['ERIC PRYDZ', 'ILLENIUM']);
  });

  it('skips days with only travel or non-performance nodes', () => {
    const sections = buildWallpaperSectionsByDate([
      {
        dateKey: 'empty',
        dateLabel: '6月15日',
        items: [
          {
            id: 'depart',
            time: '17:30',
            dotColor: 'pink',
            title: '出发前往场馆',
            pill: { label: '出行提醒', variant: 'green' },
          },
        ],
      },
    ]);
    expect(sections).toHaveLength(0);
  });
});

describe('timelineItemToWallpaperRow', () => {
  it('maps timeline fields to wallpaper row', () => {
    const row = timelineItemToWallpaperRow({
      id: 'marshmello',
      time: '21:00',
      dotColor: 'pink',
      title: 'Marshmello · A舞台 (主舞台)',
      highlighted: true,
    });
    expect(row).toMatchObject({
      time: '21:00',
      artist: 'Marshmello',
      stage: 'A舞台 (主舞台)',
      dotColor: 'pink',
    });
    expect(row).not.toHaveProperty('highlighted');
  });
});
