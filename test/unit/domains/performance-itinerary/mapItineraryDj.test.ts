import { describe, expect, it } from 'vitest';
import { mapItineraryDjFromApi } from '@/domains/performance-itinerary/utils/mapItineraryDj';

describe('mapItineraryDjFromApi', () => {
  it('preserves festival stage ids instead of collapsing to main', () => {
    const dj = mapItineraryDjFromApi({
      id: 'wildstylez',
      name: 'WILDSTYLEZ',
      genre: 'Hardstyle',
      genreLabel: 'Hardstyle · Euphoric',
      stage: 'uv',
      stageLabel: 'UV',
      popularity: 91,
      avatarSeed: 'wildstylez',
      genreColor: '#a855f7',
    });

    expect(dj.stage).toBe('uv');
    expect(dj.stageLabel).toBe('UV');
  });

  it('keeps legacy main stage ids', () => {
    const dj = mapItineraryDjFromApi({
      id: 'marshmello',
      name: 'MARSHMELLO',
      genre: 'Future Bass',
      genreLabel: 'Trap',
      stage: 'main',
      popularity: 98,
      avatarSeed: 'marshmello',
      genreColor: '#ff2d55',
    });

    expect(dj.stage).toBe('main');
  });
});
