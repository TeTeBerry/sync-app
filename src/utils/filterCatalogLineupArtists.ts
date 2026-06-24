import type { CatalogLineupArtist } from '../types/backend';
import {
  catalogArtistMatchesGenreChip,
  scoreCatalogArtistGenrePreference,
} from './catalogLineupArtistGenres';

function normalizeArtistSearchKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeChineseSearchKey(text: string): string {
  return text.trim().toLowerCase();
}

function matchChineseAliases(
  aliases: string[] | undefined,
  query: string,
): { score: number; position: number; nameLength: number } | null {
  const normalizedQuery = normalizeChineseSearchKey(query);
  if (!normalizedQuery || !aliases?.length) {
    return null;
  }

  for (const alias of aliases) {
    const aliasKey = normalizeChineseSearchKey(alias);
    if (aliasKey === normalizedQuery) {
      return { score: 100, position: 0, nameLength: aliasKey.length };
    }
    const position = aliasKey.indexOf(normalizedQuery);
    if (position >= 0) {
      return { score: 90, position, nameLength: aliasKey.length };
    }
  }

  return null;
}

function artistMatchMeta(
  artist: CatalogLineupArtist,
  query: string,
): { score: number; position: number; nameLength: number } {
  const aliasMatch = matchChineseAliases(artist.chineseAliases, query);
  if (aliasMatch) {
    return aliasMatch;
  }

  const normalizedQuery = normalizeArtistSearchKey(query);
  if (!normalizedQuery) {
    return {
      score: 0,
      position: Number.POSITIVE_INFINITY,
      nameLength: Number.POSITIVE_INFINITY,
    };
  }

  const nameKey = normalizeArtistSearchKey(artist.name);
  if (nameKey.startsWith(normalizedQuery)) {
    return { score: 100, position: 0, nameLength: nameKey.length };
  }

  const position = nameKey.indexOf(normalizedQuery);
  if (position >= 0) {
    return { score: 80, position, nameLength: nameKey.length };
  }

  return {
    score: 0,
    position: Number.POSITIVE_INFINITY,
    nameLength: Number.POSITIVE_INFINITY,
  };
}

/** Client-side filter for catalog lineup artists tab (name + optional genre chip). */
export function filterCatalogLineupArtists(
  artists: CatalogLineupArtist[],
  query: string,
  genreChip?: string | null,
  favorGenres?: string[] | null,
): CatalogLineupArtist[] {
  const genreFiltered = genreChip
    ? artists.filter((artist) => catalogArtistMatchesGenreChip(artist, genreChip))
    : artists;

  const trimmed = query.trim();
  if (!trimmed) {
    return genreFiltered;
  }

  return genreFiltered
    .map((artist, index) => ({
      artist,
      index,
      preferenceScore: scoreCatalogArtistGenrePreference(artist, favorGenres),
      ...artistMatchMeta(artist, trimmed),
    }))
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.position - b.position ||
        a.nameLength - b.nameLength ||
        b.preferenceScore - a.preferenceScore ||
        a.index - b.index,
    )
    .map((entry) => entry.artist);
}
