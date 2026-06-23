import { describe, expect, it } from 'vitest';
import { LINEUP_OTHER_GENRE_ID } from '@/packageEvent/pages/activity-lineup/utils/groupLineupByPrimaryGenre';
import {
  lineupGenreHeadDomId,
  lineupGenreSectionDomId,
} from '@/packageEvent/pages/activity-lineup/utils/lineupGenreSectionDomId';
import { sortLineupArtists } from '@/packageEvent/pages/activity-lineup/utils/sortLineupArtists';
import { detectActiveGenreIdFromScrollViewport } from '@/packageEvent/pages/activity-lineup/utils/scrollLineupSection';
import type { ItineraryDj } from '@/types/itinerary';

function makeDj(
  overrides: Partial<ItineraryDj> & Pick<ItineraryDj, 'id' | 'name'>,
): ItineraryDj {
  return {
    genre: 'House',
    genreLabel: 'House',
    stage: 'main',
    popularity: 50,
    avatarSeed: overrides.id,
    genreColor: '#7b61ff',
    ...overrides,
  };
}

describe('lineupGenreSectionDomId', () => {
  it('builds stable dom ids for genre section anchors', () => {
    expect(lineupGenreSectionDomId('House')).toBe('lineup-genre-house');
    expect(lineupGenreSectionDomId('Drum & Bass')).toBe('lineup-genre-drum-and-bass');
    expect(lineupGenreSectionDomId(LINEUP_OTHER_GENRE_ID)).toBe('lineup-genre-other');
    expect(lineupGenreHeadDomId('Hardstyle')).toBe('lineup-genre-head-hardstyle');
    expect(lineupGenreHeadDomId('Techno')).toBe('lineup-genre-head-techno');
  });
});

describe('sortLineupArtists', () => {
  it('sorts by popularity descending by default', () => {
    const sorted = sortLineupArtists(
      [
        makeDj({ id: 'a', name: 'A', popularity: 10 }),
        makeDj({ id: 'b', name: 'B', popularity: 90 }),
      ],
      'popularity',
    );
    expect(sorted.map((artist) => artist.id)).toEqual(['b', 'a']);
  });

  it('sorts by artist name when requested', () => {
    const sorted = sortLineupArtists(
      [makeDj({ id: 'z', name: 'Zedd' }), makeDj({ id: 'a', name: 'Afrojack' })],
      'name',
    );
    expect(sorted.map((artist) => artist.name)).toEqual(['Afrojack', 'Zedd']);
  });
});

describe('detectActiveGenreIdFromScrollViewport', () => {
  const viewportTop = 350;

  it('keeps the all chip active before the first section reaches the anchor', () => {
    expect(
      detectActiveGenreIdFromScrollViewport(viewportTop, [
        { id: 'House', top: 420 },
        { id: 'Techno', top: 920 },
      ]),
    ).toBe('all');
  });

  it('selects the section whose head interval contains the anchor', () => {
    expect(
      detectActiveGenreIdFromScrollViewport(viewportTop, [
        { id: 'House', top: 120 },
        { id: 'Techno', top: 358 },
        { id: 'Hardstyle', top: 920 },
      ]),
    ).toBe('Techno');
  });

  it('does not keep a scrolled-past section active when a later section is visible', () => {
    expect(
      detectActiveGenreIdFromScrollViewport(viewportTop, [
        { id: 'House', top: -120 },
        { id: 'Techno', top: 352 },
        { id: 'Hardstyle', top: 920 },
      ]),
    ).toBe('Techno');
  });
});
