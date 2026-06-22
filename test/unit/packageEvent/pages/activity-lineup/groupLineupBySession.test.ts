import { describe, expect, it } from 'vitest';
import {
  formatLineupTimeRange,
  groupPerformancesBySession,
} from '@/packageEvent/pages/activity-lineup/utils/groupLineupBySession';

describe('groupLineupBySession', () => {
  it('groups performances by session order and sorts by start time', () => {
    const groups = groupPerformancesBySession({
      sessions: [
        { dateKey: 'jun14', label: '6月14日', bannerDateLabel: '6月14日' },
        { dateKey: 'jun13', label: '6月13日', bannerDateLabel: '6月13日' },
      ],
      performances: [
        {
          artistId: 'b',
          artistName: 'B',
          dateKey: 'jun13',
          dateLabel: '6月13日',
          genre: 'house',
          genreLabel: 'House',
          stage: 'main',
          stageLabel: '主舞台',
          startTime: '20:00',
          endTime: '21:00',
          startMinutes: 1200,
          endMinutes: 1260,
          popularity: 80,
          avatarSeed: 'b',
          genreColor: '#fff',
        },
        {
          artistId: 'a',
          artistName: 'A',
          dateKey: 'jun13',
          dateLabel: '6月13日',
          genre: 'house',
          genreLabel: 'House',
          stage: 'main',
          stageLabel: '主舞台',
          startTime: '18:00',
          endTime: '19:00',
          startMinutes: 1080,
          endMinutes: 1140,
          popularity: 70,
          avatarSeed: 'a',
          genreColor: '#fff',
        },
      ],
    });

    expect(groups).toHaveLength(1);
    expect(groups[0].performances.map((item) => item.artistName)).toEqual(['A', 'B']);
  });

  it('formats lineup time range', () => {
    expect(formatLineupTimeRange('20:30', '22:00')).toBe('20:30 — 22:00');
    expect(formatLineupTimeRange('OPEN', '')).toBe('OPEN');
  });
});
