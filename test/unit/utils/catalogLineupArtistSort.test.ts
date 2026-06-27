import { describe, expect, it } from 'vitest';
import type { CatalogLineupArtist } from '@/types/backend';
import {
  catalogArtistLetterDomId,
  getCatalogArtistNameLetter,
  groupCatalogArtistsByNameLetter,
  sortCatalogLineupArtistsByName,
} from '@/utils/catalogLineupArtistSort';

function artist(name: string): CatalogLineupArtist {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    genre: 'House',
    genreLabel: 'House',
    activityCount: 1,
    thumbnail: 'https://example.com/a.jpg',
  };
}

describe('catalogLineupArtistSort', () => {
  it('sorts artists by name A-Z', () => {
    const sorted = sortCatalogLineupArtistsByName([
      artist('ZEDD'),
      artist('ALESSO'),
      artist('MARSHMELLO'),
    ]);
    expect(sorted.map((item) => item.name)).toEqual(['ALESSO', 'MARSHMELLO', 'ZEDD']);
  });

  it('groups artists into letter sections', () => {
    const sections = groupCatalogArtistsByNameLetter([
      artist('ZEDD'),
      artist('ALESSO'),
      artist('AFROJACK'),
      artist('MARSHMELLO'),
      artist('123 Crew'),
    ]);

    expect(sections.map((section) => section.letter)).toEqual(['A', 'M', 'Z', '#']);
    expect(sections[0]?.artists.map((item) => item.name)).toEqual([
      'AFROJACK',
      'ALESSO',
    ]);
    expect(getCatalogArtistNameLetter('123 Crew')).toBe('#');
  });

  it('builds stable dom ids for scroll targets', () => {
    expect(catalogArtistLetterDomId('A')).toBe('catalog-artist-letter-a');
    expect(catalogArtistLetterDomId('#')).toBe('catalog-artist-letter-other');
  });
});
