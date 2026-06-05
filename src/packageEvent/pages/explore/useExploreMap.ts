import type { MapProps } from '@tarojs/components';
import Taro, { useReady } from '@tarojs/taro';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildExploreDemoUsers } from './exploreMapDemoUsers';
import { EXPLORE_VENUE_GLOW_RGB } from './exploreMapColors';
import {
  EXPLORE_HALL_GLOW_POLYGON,
  EXPLORE_HALL_POLYGON,
  EXPLORE_MAP_ID,
  EXPLORE_MAP_SCALE,
  EXPLORE_VENUE_ADDRESS,
  EXPLORE_VENUE_CENTER,
  EXPLORE_VENUE_MARKER_ID,
  EXPLORE_VENUE_NAME,
} from './exploreMapVenue';
import type { ExploreMapUser, MapRegionBounds } from './exploreMapTypes';
import {
  EXPLORE_MARKER_FRAME_COUNT,
  getMarkerIconPath,
  getMarkerIconSet,
  getVenueHallPinIcon,
  type MarkerIconSet,
} from './exploreMarkerArt';

type ClusterMarker = MapProps.marker & { clusterId: number };

type ExploreMarker = MapProps.marker & { joinCluster?: boolean };

const ANIM_MS = 140;
const FLOAT_AMPLITUDE = 5;

function hexAlpha(r: number, g: number, b: number, alpha: number): string {
  const a = Math.round(Math.max(0, Math.min(1, alpha)) * 255)
    .toString(16)
    .padStart(2, '0');
  const c = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}${a}`;
}

function isInRegion(lat: number, lng: number, region: MapRegionBounds | null): boolean {
  if (!region) return true;
  const { northeast, southwest } = region;
  return (
    lat <= northeast.latitude &&
    lat >= southwest.latitude &&
    lng >= southwest.longitude &&
    lng <= northeast.longitude
  );
}

function buildPulseLabel(
  text: string,
  floatOffset: number,
  visible: boolean,
): MapProps.marker['label'] | undefined {
  if (!visible) return undefined;
  return {
    content: text,
    color: '#ffffff',
    fontSize: 10,
    anchorX: 0,
    anchorY: -52 + floatOffset,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 10,
    bgColor: 'rgba(123, 77, 255, 0.9)',
    padding: 5,
    textAlign: 'center',
  };
}

type UserIconSets = {
  self: MarkerIconSet;
  onsite: MarkerIconSet;
  want: MarkerIconSet;
  pulse: MarkerIconSet;
};

function userToMarker(
  user: ExploreMapUser,
  icons: UserIconSets,
  frameIndex: number,
  floatOffset: number,
  region: MapRegionBounds | null,
): ExploreMarker {
  const set = user.isSelf ? icons.self : icons[user.status];
  const size = set.size;
  const inView = isInRegion(user.latitude, user.longitude, region);
  const showPulse = Boolean(user.pulseText) && inView;

  return {
    id: user.id,
    latitude: user.latitude,
    longitude: user.longitude,
    iconPath: getMarkerIconPath(set, frameIndex),
    width: size,
    height: size,
    anchor: { x: 0.5, y: 0.5 },
    joinCluster: !user.isSelf,
    zIndex: user.isSelf ? 999 : user.status === 'pulse' ? 120 : 80,
    label: user.pulseText
      ? buildPulseLabel(user.pulseText, floatOffset, showPulse)
      : undefined,
  };
}

export function useExploreMap() {
  const usersRef = useRef(buildExploreDemoUsers());
  const mapCtxRef = useRef<Taro.MapContext | null>(null);
  const regionRef = useRef<MapRegionBounds | null>(null);
  const frameRef = useRef(0);
  const floatRef = useRef(0);
  const iconsRef = useRef<
    (UserIconSets & { cluster: MarkerIconSet; venuePin: string }) | null
  >(null);
  const clusterHandlerRef = useRef<
    ((res: Taro.MapContext.MapEventMarkerClusterCreate) => void) | null
  >(null);
  const animTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const glowTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [glowPhase, setGlowPhase] = useState(0);

  const venueSubtitle = `${EXPLORE_VENUE_ADDRESS} · STORM`;

  const polygons = useMemo((): MapProps.polygon[] => {
    const pulse = 0.5 + 0.5 * Math.sin(glowPhase);
    const innerAlpha = 0.22 + pulse * 0.2;
    const outerAlpha = 0.1 + pulse * 0.14;
    const { r, g, b } = EXPLORE_VENUE_GLOW_RGB;
    return [
      {
        points: [...EXPLORE_HALL_GLOW_POLYGON],
        fillColor: hexAlpha(r, g, b, outerAlpha),
        strokeColor: hexAlpha(255, 120, 180, 0.35 + pulse * 0.2),
        strokeWidth: 2,
        zIndex: 1,
      },
      {
        points: [...EXPLORE_HALL_POLYGON],
        fillColor: hexAlpha(r, g, b, innerAlpha),
        strokeColor: hexAlpha(255, 72, 153, 0.75 + pulse * 0.15),
        strokeWidth: 2,
        zIndex: 2,
      },
    ];
  }, [glowPhase]);

  const pushUserMarkers = useCallback(() => {
    const ctx = mapCtxRef.current;
    const icons = iconsRef.current;
    if (!ctx || !icons) return;

    const frameIndex = frameRef.current;
    const floatOffset = floatRef.current;
    const region = regionRef.current;
    const userMarkers = usersRef.current.map((u) =>
      userToMarker(u, icons, frameIndex, floatOffset, region),
    );
    const venueMarker: ExploreMarker = {
      id: EXPLORE_VENUE_MARKER_ID,
      latitude: EXPLORE_VENUE_CENTER.latitude,
      longitude: EXPLORE_VENUE_CENTER.longitude,
      iconPath: icons.venuePin,
      width: 32,
      height: 32,
      anchor: { x: 0.5, y: 0.9 },
      joinCluster: false,
      zIndex: 200,
      callout: {
        content: EXPLORE_VENUE_NAME,
        color: '#ffffff',
        fontSize: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,72,153,0.6)',
        bgColor: 'rgba(18, 8, 32, 0.92)',
        padding: 8,
        display: 'ALWAYS',
        textAlign: 'center',
        anchorX: 0,
        anchorY: -4,
      },
    };

    void ctx.addMarkers({
      markers: [venueMarker, ...userMarkers] as MapProps.marker[],
      clear: true,
    });
  }, []);

  const initMap = useCallback(async () => {
    if (iconsRef.current) return;

    try {
      const [selfSet, onsiteSet, wantSet, pulseSet, clusterSet, venuePin] =
        await Promise.all([
          getMarkerIconSet({ status: 'pulse', isSelf: true, initial: '我' }),
          getMarkerIconSet({ status: 'onsite', isSelf: false, initial: 'S' }),
          getMarkerIconSet({ status: 'want', isSelf: false, initial: 'S' }),
          getMarkerIconSet({ status: 'pulse', isSelf: false, initial: 'S' }),
          getMarkerIconSet({ status: 'onsite', isSelf: false, cluster: true }),
          getVenueHallPinIcon(),
        ]);
      iconsRef.current = {
        self: selfSet,
        onsite: onsiteSet,
        want: wantSet,
        pulse: pulseSet,
        cluster: clusterSet,
        venuePin,
      };
    } catch (err) {
      console.warn('[explore-map] icon preload failed', err);
      return;
    }

    const ctx = Taro.createMapContext(EXPLORE_MAP_ID);
    mapCtxRef.current = ctx;

    const onClusterCreate = (
      res:
        | Taro.MapContext.MapEventMarkerClusterCreate
        | Taro.MapContext.MapEventMarkerClusterClick,
    ) => {
      if (!('clusters' in res)) return;
      const icons = iconsRef.current;
      if (!icons) return;
      const frameIndex = frameRef.current;
      const clusterMarkers: ClusterMarker[] = res.clusters.map((cluster) => ({
        clusterId: cluster.clusterId,
        latitude: cluster.center.lat,
        longitude: cluster.center.lng,
        iconPath: getMarkerIconPath(icons.cluster, frameIndex),
        width: icons.cluster.size,
        height: icons.cluster.size,
        anchor: { x: 0.5, y: 0.5 },
        label: {
          content:
            cluster.markerIds.length > 99 ? '99+' : String(cluster.markerIds.length),
          color: '#ffffff',
          fontSize: 12,
          anchorX: 0,
          anchorY: 0,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.25)',
          borderRadius: 12,
          bgColor: 'rgba(18, 8, 32, 0.88)',
          padding: 6,
          textAlign: 'center',
        },
      }));
      void ctx.addMarkers({ markers: clusterMarkers, clear: false });
    };

    clusterHandlerRef.current = onClusterCreate;
    ctx.on('markerClusterCreate', onClusterCreate);

    await ctx.initMarkerCluster({
      enableDefaultStyle: false,
      zoomOnClick: true,
      gridSize: 52,
    });

    setMapReady(true);
    pushUserMarkers();

    void ctx.getRegion({
      success: (r) => {
        regionRef.current = {
          northeast: r.northeast,
          southwest: r.southwest,
        };
      },
    });
  }, [pushUserMarkers]);

  useReady(() => {
    void initMap();
  });

  useEffect(() => {
    if (!mapReady) return undefined;

    animTimerRef.current = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % EXPLORE_MARKER_FRAME_COUNT;
      floatRef.current =
        Math.sin((frameRef.current / EXPLORE_MARKER_FRAME_COUNT) * Math.PI * 2) *
        FLOAT_AMPLITUDE;
      pushUserMarkers();
    }, ANIM_MS);

    glowTimerRef.current = setInterval(() => {
      setGlowPhase((p) => p + 0.12);
    }, 220);

    return () => {
      if (animTimerRef.current) clearInterval(animTimerRef.current);
      if (glowTimerRef.current) clearInterval(glowTimerRef.current);
    };
  }, [mapReady, pushUserMarkers]);

  const onRegionChange: MapProps['onRegionChange'] = (e) => {
    const detail = e.detail as {
      type?: string;
      causedBy?: string;
      northeast?: { latitude: number; longitude: number };
      southwest?: { latitude: number; longitude: number };
    };
    if (detail.type !== 'end') return;
    if (detail.northeast && detail.southwest) {
      regionRef.current = {
        northeast: detail.northeast,
        southwest: detail.southwest,
      };
      pushUserMarkers();
    } else {
      mapCtxRef.current?.getRegion({
        success: (r) => {
          regionRef.current = {
            northeast: r.northeast,
            southwest: r.southwest,
          };
          pushUserMarkers();
        },
      });
    }
  };

  const mapProps: MapProps = {
    id: EXPLORE_MAP_ID,
    className: 's-explore-map__map',
    latitude: EXPLORE_VENUE_CENTER.latitude,
    longitude: EXPLORE_VENUE_CENTER.longitude,
    scale: EXPLORE_MAP_SCALE,
    minScale: 14,
    maxScale: 20,
    enableZoom: true,
    enableScroll: true,
    enableRotate: false,
    showLocation: true,
    polygons,
    onRegionChange,
    onError: () => {},
    subkey: process.env.TARO_APP_QQ_MAP_KEY || undefined,
  };

  return {
    mapProps,
    venueTitle: EXPLORE_VENUE_NAME,
    venueSubtitle,
    mapReady,
  };
}
