import type { ExclusiveItineraryDj } from '@/packageEvent/pages/exclusive-itinerary/types';
import type { ItineraryDj } from '@/types/backend';

export function mapItineraryDjFromApi(dj: ItineraryDj): ExclusiveItineraryDj {
  const stage = dj.stage?.trim() || 'main';
  return {
    id: dj.id,
    name: dj.name,
    genre: dj.genre,
    genreLabel: dj.genreLabel,
    stage,
    stageLabel: dj.stageLabel?.trim() || undefined,
    popularity: dj.popularity,
    avatarSeed: dj.avatarSeed,
    genreColor: dj.genreColor,
  };
}
