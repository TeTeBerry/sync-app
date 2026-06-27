import {
  extractDjStyleTokens,
  resolvePrimaryGenreCategory,
} from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryFilters';
import type { CatalogLineupArtist } from '../types/backend';
import { buildUserGenreMatchSet } from './buddyMatchProfile';
import { sanitizeCatalogGenreTokens } from './catalogGenreNormalize';

export type CatalogArtistGenreChip = {
  id: string;
  label: string;
  count: number;
};

const GENRE_PLACEHOLDER = '风格待补充';
const GENRE_TOKEN_SPLIT = /\s*[·•|/]\s*/;

function collectRawCatalogArtistGenreTokens(
  artist: Pick<CatalogLineupArtist, 'genre' | 'genreLabel'>,
): string[] {
  const raw: string[] = [];
  const genre = artist.genre?.trim() ?? '';
  const genreLabel = artist.genreLabel?.trim() ?? '';
  if (genre && genre !== GENRE_PLACEHOLDER) {
    raw.push(genre);
  }
  if (genreLabel && genreLabel !== GENRE_PLACEHOLDER) {
    raw.push(genreLabel);
  }
  return raw;
}

/** Sanitized catalog genre fields for artist tab display and filtering. */
export function getSanitizedCatalogArtistGenres(
  artist: Pick<CatalogLineupArtist, 'genre' | 'genreLabel'>,
): { genre: string; genreLabel: string } {
  const tokens = sanitizeCatalogGenreTokens(collectRawCatalogArtistGenreTokens(artist));
  if (!tokens.length) {
    return { genre: '', genreLabel: '' };
  }

  return {
    genre: tokens[0] ?? '',
    genreLabel: tokens.slice(0, 4).join(' · '),
  };
}

/** Primary filter bucket — uses sanitized primary genre token. */
export function resolveCatalogArtistPrimaryGenre(
  artist: Pick<CatalogLineupArtist, 'genre' | 'genreLabel'>,
): string {
  const { genre, genreLabel } = getSanitizedCatalogArtistGenres(artist);
  if (genre) {
    return resolvePrimaryGenreCategory(genre);
  }

  const [firstToken] = extractDjStyleTokens(genreLabel);
  return firstToken ? resolvePrimaryGenreCategory(firstToken) : '';
}

/** Card label — sanitized primary genre token (e.g. Future Bass, House). */
export function getCatalogArtistPrimaryGenreLabel(
  artist: Pick<CatalogLineupArtist, 'genre' | 'genreLabel'>,
): string {
  const { genre } = getSanitizedCatalogArtistGenres(artist);
  if (genre) {
    return genre;
  }
  return resolveCatalogArtistPrimaryGenre(artist);
}

/** Profile sheet label — sanitized multi-token genre line. */
export function getCatalogArtistDisplayGenreLabel(
  artist: Pick<CatalogLineupArtist, 'genre' | 'genreLabel'>,
): string {
  const { genre, genreLabel } = getSanitizedCatalogArtistGenres(artist);
  return genreLabel || genre || '';
}

export function extractCatalogArtistGenreTokens(genreLabel: string): string[] {
  const trimmed = genreLabel?.trim() ?? '';
  if (!trimmed || trimmed === GENRE_PLACEHOLDER) {
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
  const userSet = buildUserGenreMatchSet(favorGenres);
  if (!userSet.size) {
    return 0;
  }

  const tokens = extractCatalogArtistGenreTokens(
    getSanitizedCatalogArtistGenres(artist).genreLabel,
  );
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

  const artistPrimary = resolveCatalogArtistPrimaryGenre(artist);
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
    const primary = resolveCatalogArtistPrimaryGenre(artist);
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
