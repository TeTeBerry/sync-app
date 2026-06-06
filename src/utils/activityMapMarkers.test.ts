import { describe, expect, it } from 'vitest';
import {
  buildActivityMapMarkers,
  filterMappableActivitiesByRegion,
  resolveMappableActivity,
  shortenActivityMapTitle,
} from './activityMapMarkers';
import type { EventCardUi } from './apiMappers';

function event(
  partial: Partial<EventCardUi> & Pick<EventCardUi, 'id' | 'title'>,
): EventCardUi {
  return {
    date: '06/13-14',
    location: '深圳',
    distance: '',
    image: '',
    attendees: 420,
    category: '电音节',
    hot: true,
    going: false,
    ...partial,
  };
}

describe('activityMapMarkers', () => {
  it('shortens known festival titles for map callouts', () => {
    expect(shortenActivityMapTitle('风暴电音节 深圳站')).toBe('风暴');
    expect(shortenActivityMapTitle('Tomorrowland Thailand 2026')).toBe('TML');
  });

  it('resolves fallback coords for storm activity', () => {
    const mapped = resolveMappableActivity(
      event({ id: '4', title: '风暴电音节 深圳站' }),
    );
    expect(mapped?.latitude).toBeCloseTo(22.704518);
    expect(mapped?.region).toBe('domestic');
  });

  it('filters activities by region', () => {
    const items = [
      event({ id: '4', title: '风暴电音节 深圳站' }),
      event({ id: '5', title: 'EDC Thailand 2026' }),
    ];
    expect(filterMappableActivitiesByRegion(items, 'domestic')).toHaveLength(1);
    expect(filterMappableActivitiesByRegion(items, 'overseas')).toHaveLength(1);
    expect(filterMappableActivitiesByRegion(items, 'hmt')).toHaveLength(0);
  });

  it('builds native map markers with callouts', () => {
    const markers = buildActivityMapMarkers([
      resolveMappableActivity(event({ id: '4', title: '风暴电音节 深圳站' }))!,
    ]);
    expect(markers).toHaveLength(1);
    expect(markers[0]?.id).toBe(4);
    expect(markers[0]?.width).toBe(16);
    expect(markers[0]?.height).toBe(16);
    expect(markers[0]?.iconPath).toBeTruthy();
    expect(markers[0]?.callout?.content).toContain('风暴');
  });
});
