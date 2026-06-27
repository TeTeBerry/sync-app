import { describe, expect, it } from 'vitest';
import type { CatalogLineupArtist } from '@/types/backend';
import {
  buildCatalogArtistGenreChips,
  catalogArtistMatchesGenreChip,
  getCatalogArtistDisplayGenreLabel,
  getCatalogArtistPrimaryGenreLabel,
  scoreCatalogArtistGenrePreference,
  sortCatalogLineupArtistsByGenrePreference,
} from '@/utils/catalogLineupArtistGenres';
import { buildUserGenreMatchSet } from '@/utils/buddyMatchProfile';
import { filterCatalogLineupArtists } from '@/utils/filterCatalogLineupArtists';

function artist(
  partial: Partial<CatalogLineupArtist> & Pick<CatalogLineupArtist, 'name'>,
): CatalogLineupArtist {
  return {
    id: partial.id ?? partial.name.toLowerCase().replace(/\s+/g, '-'),
    name: partial.name,
    genre:
      partial.genre ?? partial.genreLabel?.split(/\s*[·/]\s*/)[0]?.trim() ?? 'House',
    genreLabel: partial.genreLabel ?? 'House',
    activityCount: partial.activityCount ?? 1,
    thumbnail: partial.thumbnail ?? 'https://example.com/a.jpg',
    ...partial,
  };
}

describe('catalogLineupArtistGenres', () => {
  const artists = [
    artist({
      name: 'AFROJACK',
      genre: 'House',
      genreLabel: 'Big Room · Dutch House',
    }),
    artist({
      name: 'CHARLOTTE DE WITTE',
      genre: 'Techno',
      genreLabel: 'Techno · Peak Time',
    }),
    artist({
      name: 'VINI VICI',
      genre: 'Trance',
      genreLabel: 'Psytrance · Progressive',
    }),
  ];

  it('matches artists by primary genre bucket from seed genre field', () => {
    expect(catalogArtistMatchesGenreChip(artists[0], 'House')).toBe(true);
    expect(catalogArtistMatchesGenreChip(artists[1], 'Techno')).toBe(true);
    expect(catalogArtistMatchesGenreChip(artists[0], 'Techno')).toBe(false);
    expect(catalogArtistMatchesGenreChip(artists[2], 'Trance')).toBe(true);
    expect(catalogArtistMatchesGenreChip(artists[2], 'House')).toBe(false);
  });

  it('prefers seed genre over misleading Discogs genreLabel tokens', () => {
    const marshmello = artist({
      name: 'MARSHMELLO',
      genre: 'Future Bass',
      genreLabel: 'Future Bass · Melodic Trap · Future House · Electro Pop',
    });
    expect(getCatalogArtistPrimaryGenreLabel(marshmello)).toBe('Future Bass');
    expect(catalogArtistMatchesGenreChip(marshmello, 'Bass')).toBe(true);
    expect(catalogArtistMatchesGenreChip(marshmello, 'Breakbeat')).toBe(false);
  });

  it('sanitizes Hermes web-only noise from artist tab genre labels', () => {
    const tigerDrama = artist({
      name: 'TIGER DRAMA',
      genre: 'Web',
      genreLabel:
        'Beatport — delivering high-impact energy packed dancefloor presence on mainstage EDM sets',
    });
    expect(getCatalogArtistPrimaryGenreLabel(tigerDrama)).toBe('Big Room');
    expect(getCatalogArtistDisplayGenreLabel(tigerDrama)).toBe('Big Room');
    expect(catalogArtistMatchesGenreChip(tigerDrama, 'House')).toBe(true);
    expect(catalogArtistMatchesGenreChip(tigerDrama, 'Techno')).toBe(false);

    const pixzy = artist({
      name: 'PIXZY',
      genre: 'Electronic',
      genreLabel: 'Electronic (bass music · future bass · trap)',
    });
    expect(getCatalogArtistPrimaryGenreLabel(pixzy)).toBe('Bass');
    expect(getCatalogArtistDisplayGenreLabel(pixzy)).toContain('Bass');

    const maysaa = artist({
      name: 'MAYSAA',
      genre: 'Web',
      genreLabel: 'Web',
    });
    expect(getCatalogArtistPrimaryGenreLabel(maysaa)).toBe('');
    expect(getCatalogArtistDisplayGenreLabel(maysaa)).toBe('');

    const xenia = artist({
      name: 'XENIA DIA',
      genre: 'DJ',
      genreLabel: 'DJ · producer',
    });
    expect(getCatalogArtistPrimaryGenreLabel(xenia)).toBe('');
    expect(getCatalogArtistDisplayGenreLabel(xenia)).toBe('');
  });

  it('builds genre chips sorted by artist count', () => {
    const chips = buildCatalogArtistGenreChips([
      ...artists,
      artist({
        name: 'MARTIN GARRIX',
        genre: 'House',
        genreLabel: 'Progressive House',
      }),
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

  it('matches saved sub-genres via primary buckets and drum and bass aliases', () => {
    const dnbArtist = artist({
      name: 'SUB FOCUS',
      genre: 'Drum & Bass',
      genreLabel: 'Drum & Bass · Neurofunk',
    });
    expect(
      scoreCatalogArtistGenrePreference(dnbArtist, ['Drum and Bass']),
    ).toBeGreaterThan(0);

    const melodicTechnoArtist = artist({
      name: 'CHARLOTTE DE WITTE',
      genre: 'Techno',
      genreLabel: 'Techno · Peak Time',
    });
    expect(
      scoreCatalogArtistGenrePreference(melodicTechnoArtist, ['Melodic Techno']),
    ).toBeGreaterThan(0);
    expect(buildUserGenreMatchSet(['Melodic Techno']).has('techno')).toBe(true);
  });
});

describe('filterCatalogLineupArtists', () => {
  const artists = [
    artist({
      name: 'MARTIN GARRIX',
      genre: 'House',
      genreLabel: 'Big Room · Progressive House',
    }),
    artist({
      name: 'AFROJACK',
      genre: 'House',
      genreLabel: 'Big Room · Dutch House',
    }),
    artist({
      name: 'DIMITRI VEGAS & LIKE MIKE',
      genre: 'House',
      genreLabel: 'Electro House',
    }),
    artist({
      name: 'VINI VICI',
      genre: 'Trance',
      genreLabel: 'Psytrance · Progressive',
    }),
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

  it('filters by Chinese nickname aliases', () => {
    const list = [
      artist({
        name: 'MARTIN GARRIX',
        chineseAliases: ['小马丁'],
      }),
      artist({
        name: 'MARSHMELLO',
        chineseAliases: ['棉花糖', '老棉'],
      }),
    ];

    expect(filterCatalogLineupArtists(list, '小马丁')).toEqual([list[0]]);
    expect(filterCatalogLineupArtists(list, '老棉')).toEqual([list[1]]);
  });
});
