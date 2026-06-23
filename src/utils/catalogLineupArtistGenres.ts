import { resolvePrimaryGenreCategory } from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryFilters';
import type { CatalogLineupArtist } from '../types/backend';

export type CatalogArtistGenreChip = {
  id: string;
  label: string;
  count: number;
};

const GENRE_TOKEN_SPLIT = /\s*[·•|/]\s*/;

export function extractCatalogArtistGenreTokens(genreLabel: string): string[] {
  const trimmed = genreLabel?.trim() ?? '';
  if (!trimmed || trimmed === '风格待补充') {
    return [];
  }

  const parts = trimmed
    .split(GENRE_TOKEN_SPLIT)
    .map((part) => part.trim())
    .filter(Boolean);
  const tokens = new Set<string>();

  for (const part of parts.length ? parts : [trimmed]) {
    tokens.add(part);
    const primary = resolvePrimaryGenreCategory(part);
    if (primary) {
      tokens.add(primary);
    }
  }

  const wholePrimary = resolvePrimaryGenreCategory(trimmed);
  if (wholePrimary) {
    tokens.add(wholePrimary);
  }

  return [...tokens];
}

/** Secondary ranking signal from the viewer's saved genre preferences. */
export function scoreCatalogArtistGenrePreference(
  artist: CatalogLineupArtist,
  favorGenres?: string[] | null,
): number {
  const userGenres = (favorGenres ?? [])
    .map((genre) => genre.trim().toLowerCase())
    .filter(Boolean);
  if (!userGenres.length) {
    return 0;
  }

  const userSet = new Set(userGenres);
  const tokens = extractCatalogArtistGenreTokens(artist.genreLabel);
  let hits = 0;

  for (const token of tokens) {
    const lower = token.toLowerCase();
    if (userSet.has(lower)) {
      hits += 1;
      continue;
    }
    const primary = resolvePrimaryGenreCategory(token);
    if (primary && userSet.has(primary.toLowerCase())) {
      hits += 1;
    }
  }

  return Math.min(45, hits * 15);
}

/** Stable preference boost while preserving API default order as tiebreaker. */
export function sortCatalogLineupArtistsByGenrePreference(
  artists: CatalogLineupArtist[],
  favorGenres?: string[] | null,
): CatalogLineupArtist[] {
  if (!favorGenres?.length) {
    return artists;
  }

  return artists
    .map((artist, index) => ({
      artist,
      index,
      preferenceScore: scoreCatalogArtistGenrePreference(artist, favorGenres),
    }))
    .sort((a, b) => b.preferenceScore - a.preferenceScore || a.index - b.index)
    .map((entry) => entry.artist);
}

export function catalogArtistMatchesGenreChip(
  artist: CatalogLineupArtist,
  genreChip: string | null | undefined,
): boolean {
  if (!genreChip?.trim()) {
    return true;
  }

  const artistPrimary = resolvePrimaryGenreCategory(artist.genreLabel);
  const selected = resolvePrimaryGenreCategory(genreChip);
  if (!artistPrimary || !selected) {
    return false;
  }

  return artistPrimary.toLowerCase() === selected.toLowerCase();
}

/** Build genre chips from catalog lineup artists, sorted by artist count. */
export function buildCatalogArtistGenreChips(
  artists: CatalogLineupArtist[],
): CatalogArtistGenreChip[] {
  const counts = new Map<string, number>();
  const labels = new Map<string, string>();

  for (const artist of artists) {
    const primary = resolvePrimaryGenreCategory(artist.genreLabel);
    if (!primary) {
      continue;
    }
    const key = primary.toLowerCase();
    labels.set(key, primary);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.keys()]
    .sort((a, b) => {
      const countDiff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0);
      if (countDiff !== 0) {
        return countDiff;
      }
      return (labels.get(a) ?? a).localeCompare(labels.get(b) ?? b, 'en');
    })
    .map((key) => ({
      id: labels.get(key) ?? key,
      label: labels.get(key) ?? key,
      count: counts.get(key) ?? 0,
    }));
}
