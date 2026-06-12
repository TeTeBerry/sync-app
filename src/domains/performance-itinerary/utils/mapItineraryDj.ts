import type { ExclusiveItineraryDj } from '@/packageEvent/pages/exclusive-itinerary/types';
import type { ItineraryDj } from '@/types/backend';

export function mapItineraryDjFromApi(dj: ItineraryDj): ExclusiveItineraryDj {
  const stage = dj.stage as ExclusiveItineraryDj['stage'];
  return {
    id: dj.id,
    name: dj.name,
    genre: dj.genre,
    genreLabel: dj.genreLabel,
    stage:
      stage === 'main' || stage === 'bass' || stage === 'late' || stage === 'outdoor'
        ? stage
        : 'main',
    popularity: dj.popularity,
    avatarSeed: dj.avatarSeed,
    genreColor: dj.genreColor,
  };
}
