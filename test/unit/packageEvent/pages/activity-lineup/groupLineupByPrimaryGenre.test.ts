import { describe, expect, it } from 'vitest';
import {
  groupLineupByPrimaryGenre,
  LINEUP_OTHER_GENRE_ID,
  resolveLineupGenreAccentColor,
} from '@/packageEvent/pages/activity-lineup/utils/groupLineupByPrimaryGenre';
import type { ItineraryDj } from '@/types/itinerary';

function makeDj(
  overrides: Partial<ItineraryDj> & Pick<ItineraryDj, 'id' | 'name' | 'genre'>,
): ItineraryDj {
  return {
    genreLabel: overrides.genre,
    stage: 'main',
    popularity: 50,
    avatarSeed: overrides.id,
    genreColor: '#7b61ff',
    ...overrides,
  };
}

describe('groupLineupByPrimaryGenre', () => {
  it('groups artists into primary genre buckets sorted by count', () => {
    const artists = [
      makeDj({ id: 'mg', name: 'Martin Garrix', genre: 'Progressive House' }),
      makeDj({ id: 'tiesto', name: 'Tiësto', genre: 'Progressive Trance' }),
      makeDj({ id: 'cdw', name: 'Charlotte De Witte', genre: 'Techno' }),
      makeDj({ id: 'sub', name: 'Subtronics', genre: 'Dubstep' }),
      makeDj({ id: 'odd', name: 'Odd Mob', genre: 'Tech House' }),
    ];

    const groups = groupLineupByPrimaryGenre(artists);
    expect(groups.map((group) => group.label)).toEqual([
      'House',
      'Dubstep',
      'Techno',
      'Trance',
    ]);
    expect(groups[0]?.artists.map((artist) => artist.name)).toEqual([
      'Martin Garrix',
      'Odd Mob',
    ]);
  });

  it('places uncategorized artists in the other bucket', () => {
    const groups = groupLineupByPrimaryGenre([
      makeDj({ id: 'a', name: 'Artist A', genre: '' }),
      makeDj({ id: 'b', name: 'Artist B', genre: '风格待补充' }),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0]?.id).toBe(LINEUP_OTHER_GENRE_ID);
    expect(groups[0]?.artists).toHaveLength(2);
  });
});

describe('resolveLineupGenreAccentColor', () => {
  it('returns canonical accent colors for primary genres', () => {
    expect(resolveLineupGenreAccentColor('Techno')).toBe('#7b61ff');
    expect(resolveLineupGenreAccentColor('Dubstep')).toBe('#f97316');
  });

  it('falls back to artist genre color for unknown categories', () => {
    expect(resolveLineupGenreAccentColor('Synthwave', '#abcdef')).toBe('#abcdef');
  });
});
