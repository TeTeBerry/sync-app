import { describe, expect, it } from 'vitest';
import type { CatalogLineupArtist } from '@/types/backend';
import {
  buildCatalogArtistGenreChips,
  catalogArtistMatchesGenreChip,
  scoreCatalogArtistGenrePreference,
  sortCatalogLineupArtistsByGenrePreference,
} from '@/utils/catalogLineupArtistGenres';
import { filterCatalogLineupArtists } from '@/utils/filterCatalogLineupArtists';

function artist(
  partial: Partial<CatalogLineupArtist> & Pick<CatalogLineupArtist, 'name'>,
): CatalogLineupArtist {
  return {
    id: partial.id ?? partial.name.toLowerCase().replace(/\s+/g, '-'),
    name: partial.name,
    genreLabel: partial.genreLabel ?? 'House',
    activityCount: partial.activityCount ?? 1,
    thumbnail: partial.thumbnail ?? 'https://example.com/a.jpg',
  };
}

describe('catalogLineupArtistGenres', () => {
  const artists = [
    artist({ name: 'AFROJACK', genreLabel: 'Big Room · Dutch House' }),
    artist({ name: 'CHARLOTTE DE WITTE', genreLabel: 'Techno · Peak Time' }),
    artist({ name: 'VINI VICI', genreLabel: 'Psytrance · Progressive' }),
  ];

  it('matches artists by primary genre bucket', () => {
    expect(catalogArtistMatchesGenreChip(artists[0], 'House')).toBe(true);
    expect(catalogArtistMatchesGenreChip(artists[1], 'Techno')).toBe(true);
    expect(catalogArtistMatchesGenreChip(artists[0], 'Techno')).toBe(false);
  });

  it('builds genre chips sorted by artist count', () => {
    const chips = buildCatalogArtistGenreChips([
      ...artists,
      artist({ name: 'MARTIN GARRIX', genreLabel: 'Progressive House' }),
    ]);

    expect(chips.map((chip) => chip.label)).toEqual(['House', 'Techno', 'Trance']);
    expect(chips[0]?.count).toBe(2);
  });

  it('scores artists that match saved genre preferences', () => {
    expect(scoreCatalogArtistGenrePreference(artists[1], ['Techno'])).toBeGreaterThan(
      0,
    );
    expect(scoreCatalogArtistGenrePreference(artists[0], ['Techno'])).toBe(0);
  });

  it('sorts preference-matching artists ahead of others', () => {
    const sorted = sortCatalogLineupArtistsByGenrePreference(artists, ['Techno']);
    expect(sorted[0]?.name).toBe('CHARLOTTE DE WITTE');
  });
});

describe('filterCatalogLineupArtists', () => {
  const artists = [
    artist({ name: 'MARTIN GARRIX', genreLabel: 'Big Room · Progressive House' }),
    artist({ name: 'AFROJACK', genreLabel: 'Big Room · Dutch House' }),
    artist({ name: 'DIMITRI VEGAS & LIKE MIKE', genreLabel: 'Electro House' }),
    artist({ name: 'VINI VICI', genreLabel: 'Psytrance · Progressive' }),
  ];

  it('returns all artists when query is empty', () => {
    expect(filterCatalogLineupArtists(artists, '')).toHaveLength(4);
    expect(filterCatalogLineupArtists(artists, '   ')).toHaveLength(4);
  });

  it('filters by artist name substring', () => {
    expect(filterCatalogLineupArtists(artists, 'martin')).toEqual([artists[0]]);
  });

  it('matches names with ampersand when query omits it', () => {
    expect(filterCatalogLineupArtists(artists, 'dimitri vegas')).toEqual([artists[2]]);
  });

  it('does not filter by genre label alone', () => {
    expect(filterCatalogLineupArtists(artists, 'psytrance')).toEqual([]);
  });

  it('filters by genre chip', () => {
    expect(filterCatalogLineupArtists(artists, '', 'House')).toEqual([
      artists[0],
      artists[1],
      artists[2],
    ]);
    expect(filterCatalogLineupArtists(artists, '', 'Trance')).toEqual([artists[3]]);
  });

  it('combines genre chip with name search', () => {
    expect(filterCatalogLineupArtists(artists, 'martin', 'House')).toEqual([
      artists[0],
    ]);
    expect(filterCatalogLineupArtists(artists, 'martin', 'Techno')).toEqual([]);
  });

  it('uses genre preference as a tiebreaker during name search', () => {
    const list = [
      artist({ name: 'MARSH', genreLabel: 'Techno' }),
      artist({ name: 'MARTIN GARRIX', genreLabel: 'Big Room · Progressive House' }),
      artist({ name: 'MARTIN', genreLabel: 'Techno · Peak Time' }),
    ];
    expect(
      filterCatalogLineupArtists(list, 'martin', null, ['Techno']).map(
        (item) => item.name,
      ),
    ).toEqual(['MARTIN', 'MARTIN GARRIX']);
  });

  it('ranks prefix matches before contains matches', () => {
    const list = [
      artist({ name: 'AFROJACK' }),
      artist({ name: 'MARTIN GARRIX' }),
      artist({ name: 'MARSH' }),
    ];
    expect(filterCatalogLineupArtists(list, 'mar').map((item) => item.name)).toEqual([
      'MARSH',
      'MARTIN GARRIX',
    ]);
  });
});
