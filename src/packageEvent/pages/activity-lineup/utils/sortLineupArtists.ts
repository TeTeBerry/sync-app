import type { ItineraryDj } from '@/types/itinerary';

export type LineupArtistSortMode = 'popularity' | 'name';

export function sortLineupArtists(
  artists: ItineraryDj[],
  mode: LineupArtistSortMode,
): ItineraryDj[] {
  const sorted = [...artists];
  if (mode === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  } else {
    sorted.sort((a, b) => b.popularity - a.popularity);
  }
  return sorted;
}
