import { resolvePrimaryGenreCategory } from '@/packageEvent/pages/exclusive-itinerary/exclusiveItineraryFilters';
import type { ItineraryDj } from '@/types/itinerary';

export const LINEUP_OTHER_GENRE_ID = '__other__';

export type LineupGenreGroup = {
  id: string;
  label: string;
  accentColor: string;
  artists: ItineraryDj[];
};

const GENRE_ACCENT_COLORS: Record<string, string> = {
  house: 'var(--primary)',
  techno: '#7b61ff',
  trance: '#22d3ee',
  dubstep: '#f97316',
  'drum & bass': '#22c55e',
  hardstyle: '#ef4444',
  bass: '#fb923c',
};

export function resolveLineupGenreAccentColor(
  category: string,
  fallback?: string,
): string {
  if (!category) {
    return fallback ?? '#8e8e93';
  }
  const key = category.toLowerCase();
  return GENRE_ACCENT_COLORS[key] ?? fallback ?? '#8e8e93';
}

export function groupLineupByPrimaryGenre(artists: ItineraryDj[]): LineupGenreGroup[] {
  const buckets = new Map<string, { label: string; artists: ItineraryDj[] }>();

  for (const artist of artists) {
    const primary = resolvePrimaryGenreCategory(artist.genre);
    const key = primary ? primary.toLowerCase() : LINEUP_OTHER_GENRE_ID;
    const label = primary || '';

    if (!buckets.has(key)) {
      buckets.set(key, { label, artists: [] });
    }
    buckets.get(key)!.artists.push(artist);
  }

  return [...buckets.entries()]
    .map(([key, { label, artists: groupArtists }]) => ({
      id: key === LINEUP_OTHER_GENRE_ID ? LINEUP_OTHER_GENRE_ID : label,
      label,
      accentColor: resolveLineupGenreAccentColor(
        key === LINEUP_OTHER_GENRE_ID ? '' : label,
        groupArtists[0]?.genreColor,
      ),
      artists: groupArtists,
    }))
    .sort((a, b) => {
      const countDiff = b.artists.length - a.artists.length;
      if (countDiff !== 0) {
        return countDiff;
      }
      return a.label.localeCompare(b.label, 'en');
    });
}
