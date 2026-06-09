import type { MapProps } from '@tarojs/components';
import activityMapMarkerIcon from '../assets/activity-map-marker.png';
import type { ActivityMapRegion } from '../constants/activityMapRegion';
import { ACTIVITY_MAP_COORD_FALLBACK } from '../constants/activityMapRegion';
import type { EventCardUi } from './apiMappers';
import { resolveEventCardLegacyId } from './apiMappers';

const ACTIVITY_MAP_MARKER_SIZE = 16;

export type MappableActivity = EventCardUi & {
  latitude: number;
  longitude: number;
  region: ActivityMapRegion;
};

type MapMarker = NonNullable<MapProps['markers']>[number];

export function shortenActivityMapTitle(title: string): string {
  const trimmed = title.trim();
  if (/风暴|storm/i.test(trimmed)) return '风暴';
  if (/tomorrowland|tml|明日世界/i.test(trimmed)) return 'TML';
  if (/edc.*thailand|泰国edc/i.test(trimmed)) return 'EDC TH';
  return trimmed.length > 6 ? `${trimmed.slice(0, 6)}…` : trimmed;
}

export function resolveMappableActivity(event: EventCardUi): MappableActivity | null {
  const legacyId = resolveEventCardLegacyId(event.id);
  if (legacyId == null) return null;

  const fallback = ACTIVITY_MAP_COORD_FALLBACK[legacyId];
  const latitude = event.latitude ?? fallback?.latitude;
  const longitude = event.longitude ?? fallback?.longitude;
  const region = event.region ?? fallback?.region;

  if (
    latitude == null ||
    longitude == null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !region
  ) {
    return null;
  }

  return {
    ...event,
    latitude,
    longitude,
    region,
  };
}

export function filterMappableActivitiesByRegion(
  events: EventCardUi[],
  region: ActivityMapRegion,
): MappableActivity[] {
  return events
    .map(resolveMappableActivity)
    .filter((item): item is MappableActivity => item != null && item.region === region);
}

export function buildActivityMapMarkers(activities: MappableActivity[]): MapMarker[] {
  return activities.map((activity) => {
    const legacyId = resolveEventCardLegacyId(activity.id) ?? 0;
    const shortName = shortenActivityMapTitle(activity.title);
    const subtitle = `${activity.attendees}+人`;

    return {
      id: legacyId,
      latitude: activity.latitude,
      longitude: activity.longitude,
      title: activity.title,
      iconPath: activityMapMarkerIcon,
      width: ACTIVITY_MAP_MARKER_SIZE,
      height: ACTIVITY_MAP_MARKER_SIZE,
      anchor: { x: 0.5, y: 0.5 },
      zIndex: activity.hot ? 1000 : 500,
      callout: {
        content: `${shortName}\n${subtitle}`,
        color: '#ffffff',
        fontSize: 11,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ff4899',
        bgColor: '#120818ee',
        padding: 8,
        display: 'ALWAYS',
        textAlign: 'center',
        anchorX: 0,
        anchorY: 0,
      },
    } as MapMarker;
  });
}

export function computeActivityMapViewport(activities: MappableActivity[]): {
  latitude: number;
  longitude: number;
  scale: number;
  includePoints: { latitude: number; longitude: number }[];
} {
  const defaultCenter = { latitude: 22.5431, longitude: 114.0579 };

  if (!activities.length) {
    return { ...defaultCenter, scale: 10, includePoints: [] };
  }

  if (activities.length === 1) {
    const only = activities[0];
    return {
      latitude: only.latitude,
      longitude: only.longitude,
      scale: 12,
      includePoints: [{ latitude: only.latitude, longitude: only.longitude }],
    };
  }

  const lats = activities.map((item) => item.latitude);
  const lngs = activities.map((item) => item.longitude);
  const latitude = (Math.min(...lats) + Math.max(...lats)) / 2;
  const longitude = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const latSpan = Math.max(...lats) - Math.min(...lats);
  const lngSpan = Math.max(...lngs) - Math.min(...lngs);
  const span = Math.max(latSpan, lngSpan);

  let scale = 10;
  if (span > 8) scale = 4;
  else if (span > 3) scale = 6;
  else if (span > 1) scale = 8;

  return {
    latitude,
    longitude,
    scale,
    includePoints: activities.map((item) => ({
      latitude: item.latitude,
      longitude: item.longitude,
    })),
  };
}
