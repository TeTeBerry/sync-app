import type { CatalogLineupArtist } from '../types/backend';

export const CATALOG_ARTIST_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export type CatalogArtistLetterSection = {
  letter: string;
  artists: CatalogLineupArtist[];
};

function catalogArtistNameSortKey(name: string): string {
  return name.trim().toLowerCase();
}

/** First letter bucket for A-Z index — non-Latin or symbols map to #. */
export function getCatalogArtistNameLetter(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return '#';
  }

  const first = trimmed[0]?.toUpperCase() ?? '';
  return /[A-Z]/.test(first) ? first : '#';
}

export function catalogArtistLetterDomId(letter: string): string {
  if (letter === '#') {
    return 'catalog-artist-letter-other';
  }
  const safe = letter.replace(/[^a-z0-9]/gi, '').toLowerCase() || 'other';
  return `catalog-artist-letter-${safe}`;
}

/** Stable A-Z sort by artist display name. */
export function sortCatalogLineupArtistsByName(
  artists: CatalogLineupArtist[],
): CatalogLineupArtist[] {
  return [...artists].sort((a, b) =>
    catalogArtistNameSortKey(a.name).localeCompare(
      catalogArtistNameSortKey(b.name),
      'en',
      { sensitivity: 'base' },
    ),
  );
}

/** Group artists into letter sections for the A-Z index. */
export function groupCatalogArtistsByNameLetter(
  artists: CatalogLineupArtist[],
): CatalogArtistLetterSection[] {
  const sorted = sortCatalogLineupArtistsByName(artists);
  const sections = new Map<string, CatalogLineupArtist[]>();

  for (const artist of sorted) {
    const letter = getCatalogArtistNameLetter(artist.name);
    const list = sections.get(letter) ?? [];
    list.push(artist);
    sections.set(letter, list);
  }

  const letters = [...sections.keys()].sort((a, b) => {
    if (a === '#') {
      return 1;
    }
    if (b === '#') {
      return -1;
    }
    return a.localeCompare(b, 'en');
  });

  return letters.map((letter) => ({
    letter,
    artists: sections.get(letter) ?? [],
  }));
}
