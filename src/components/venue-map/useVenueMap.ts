import { useCallback, useEffect, useRef, useState } from 'react';
import Taro from '@tarojs/taro';
import type { CommonEventFunction, ITouchEvent } from '@tarojs/components';
import { VENUE_MAP_IMAGE_SRC } from './venueMapAsset';
import type { VenueMapMarker, VenueMapMarkerPhase } from './venueMapTypes';
import { markerContentPx } from './venueMapRegion';
import { isPointInVenuePin } from './venueMapPinMetrics';
import { touchStageXY, type StageRect } from './venueMapTouch';
import {
  clampMarkerNormalized,
  constrainVenueMapViewport,
  contentToScreen,
  fitVenueMapDisplaySize,
  initialVenueMapViewport,
  panViewport,
  screenToContent,
  stepVenueMapViewportZoom,
  type VenueMapViewport,
  zoomViewportAtScreen,
} from './venueMapViewport';

const LONG_PRESS_MS = 480;
const TAP_MOVE_THRESHOLD_PX = 12;
const EDGE_PAN_MARGIN_PX = 52;
const EDGE_PAN_STEP_PX = 2.4;
const STAGE_SELECTOR = '.s-event-map__stage';

type TouchPoint = { x: number; y: number };
type GestureMode = 'none' | 'pan' | 'pinch' | 'dragPin' | 'longPressWait';

function touchXY(touch: {
  x?: number;
  y?: number;
  clientX?: number;
  clientY?: number;
}): TouchPoint {
  return {
    x: touch.x ?? touch.clientX ?? 0,
    y: touch.y ?? touch.clientY ?? 0,
  };
}

function touchDistance(a: TouchPoint, b: TouchPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function touchCenter(a: TouchPoint, b: TouchPoint): TouchPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function asTouchHandler(fn: (event: ITouchEvent) => void): CommonEventFunction {
  return fn as CommonEventFunction;
}

export type UseVenueMapOptions = {
  viewWidth: number;
  viewHeight: number;
  /** 舞台距页面顶部的近似偏移（measure 未完成时的回退） */
  stageTopFallbackPx?: number;
};

export function useVenueMap({
  viewWidth,
  viewHeight,
  stageTopFallbackPx = 0,
}: UseVenueMapOptions) {
  const [mapSize, setMapSize] = useState({ width: 0, height: 0 });
  const [viewport, setViewport] = useState<VenueMapViewport>({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [marker, setMarker] = useState<VenueMapMarker | null>(null);
  const [phase, setPhase] = useState<VenueMapMarkerPhase>('idle');
  const [nameSheetOpen, setNameSheetOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');

  const viewportRef = useRef(viewport);
  viewportRef.current = viewport;
  const mapSizeRef = useRef(mapSize);
  mapSizeRef.current = mapSize;
  const markerRef = useRef(marker);
  markerRef.current = marker;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const modeRef = useRef<GestureMode>('none');
  const viewportStartRef = useRef(viewport);
  const panStartTouchRef = useRef<TouchPoint | null>(null);
  const pinchStartDistRef = useRef(0);
  const pinchStartCenterRef = useRef<TouchPoint>({ x: 0, y: 0 });
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressPointRef = useRef<TouchPoint | null>(null);
  const movedRef = useRef(false);
  const stageRectRef = useRef<StageRect>({ left: 0, top: 0 });
  const stageTopFallbackRef = useRef(stageTopFallbackPx);
  stageTopFallbackRef.current = stageTopFallbackPx;

  const syncStageRect = useCallback(() => {
    Taro.createSelectorQuery()
      .select(STAGE_SELECTOR)
      .boundingClientRect()
      .exec((res) => {
        const rect = res?.[0] as { left?: number; top?: number } | undefined;
        if (
          rect != null &&
          typeof rect.left === 'number' &&
          typeof rect.top === 'number'
        ) {
          stageRectRef.current = { left: rect.left, top: rect.top };
        }
      });
  }, []);

  const toStageTouch = useCallback(
    (touch: Parameters<typeof touchXY>[0]): TouchPoint => {
      return touchStageXY(touch, stageRectRef.current, stageTopFallbackRef.current);
    },
    [],
  );

  const commitViewport = useCallback(
    (next: VenueMapViewport) => {
      const { width, height } = mapSizeRef.current;
      if (!width || !height) {
        setViewport(next);
        return;
      }
      setViewport(
        constrainVenueMapViewport(next, width, height, viewWidth, viewHeight),
      );
    },
    [viewWidth, viewHeight],
  );

  useEffect(() => {
    let cancelled = false;
    void Taro.getImageInfo({ src: VENUE_MAP_IMAGE_SRC })
      .then((info) => {
        if (cancelled) return;
        const { width, height } = fitVenueMapDisplaySize(
          info.width,
          info.height,
          viewWidth,
        );
        setMapSize({ width, height });
        setViewport(initialVenueMapViewport(width, height, viewWidth, viewHeight));
      })
      .catch(() => {
        if (cancelled) return;
        const { width, height } = fitVenueMapDisplaySize(710, 1024, viewWidth);
        setMapSize({ width, height });
        setViewport(initialVenueMapViewport(width, height, viewWidth, viewHeight));
      });
    return () => {
      cancelled = true;
    };
  }, [viewWidth, viewHeight]);

  useEffect(() => {
    if (mapSize.width <= 0) return;
    Taro.nextTick(() => {
      syncStageRect();
    });
  }, [mapSize.width, mapSize.height, syncStageRect, viewport, viewWidth, viewHeight]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const markerScreenPosition = useCallback((m: VenueMapMarker) => {
    const { width, height } = mapSizeRef.current;
    if (!width || !height) {
      return { x: 0, y: 0 };
    }
    const content = markerContentPx(m, width, height);
    return contentToScreen(content.x, content.y, viewportRef.current);
  }, []);

  const canDragMarker = useCallback(() => {
    const p = phaseRef.current;
    return p === 'naming' || p === 'placed';
  }, []);

  const isNearPin = useCallback(
    (screenX: number, screenY: number) => {
      const m = markerRef.current;
      if (!m || !canDragMarker()) return false;
      const anchor = markerScreenPosition(m);
      return isPointInVenuePin(screenX, screenY, anchor.x, anchor.y);
    },
    [canDragMarker, markerScreenPosition],
  );

  const placeMarkerAtScreen = useCallback((screenX: number, screenY: number) => {
    const { width, height } = mapSizeRef.current;
    if (!width || !height) return;
    const content = screenToContent(screenX, screenY, viewportRef.current);
    const normalized = clampMarkerNormalized(content.x / width, content.y / height);
    setMarker({
      nx: normalized.nx,
      ny: normalized.ny,
      label: '',
    });
    setPhase('naming');
    setDraftLabel('');
    setNameSheetOpen(false);
  }, []);

  const openNameSheet = useCallback(() => {
    if (phaseRef.current !== 'naming' || !markerRef.current) return;
    setNameSheetOpen(true);
  }, []);

  const updateMarkerFromScreen = useCallback((screenX: number, screenY: number) => {
    const { width, height } = mapSizeRef.current;
    if (!width || !height) return;
    const content = screenToContent(screenX, screenY, viewportRef.current);
    const normalized = clampMarkerNormalized(content.x / width, content.y / height);
    setMarker((prev) =>
      prev
        ? {
            ...prev,
            nx: normalized.nx,
            ny: normalized.ny,
          }
        : null,
    );
  }, []);

  const applyEdgePan = useCallback(
    (screenX: number, screenY: number) => {
      let dx = 0;
      let dy = 0;
      if (screenX < EDGE_PAN_MARGIN_PX) {
        dx = EDGE_PAN_STEP_PX;
      } else if (screenX > viewWidth - EDGE_PAN_MARGIN_PX) {
        dx = -EDGE_PAN_STEP_PX;
      }
      if (screenY < EDGE_PAN_MARGIN_PX) {
        dy = EDGE_PAN_STEP_PX;
      } else if (screenY > viewHeight - EDGE_PAN_MARGIN_PX) {
        dy = -EDGE_PAN_STEP_PX;
      }
      if (dx !== 0 || dy !== 0) {
        commitViewport(panViewport(viewportRef.current, dx, dy));
      }
    },
    [commitViewport, viewWidth, viewHeight],
  );

  const handleTouchStart = useCallback(
    (event: ITouchEvent) => {
      const touches = event.touches ?? [];
      if (touches.length === 0) return;

      syncStageRect();
      clearLongPressTimer();
      viewportStartRef.current = viewportRef.current;
      movedRef.current = false;

      if (touches.length >= 2) {
        modeRef.current = 'pinch';
        const a = toStageTouch(touches[0]);
        const b = toStageTouch(touches[1]);
        pinchStartDistRef.current = Math.max(1, touchDistance(a, b));
        pinchStartCenterRef.current = touchCenter(a, b);
        return;
      }

      const p = toStageTouch(touches[0]);
      panStartTouchRef.current = p;

      if (isNearPin(p.x, p.y)) {
        modeRef.current = 'dragPin';
        return;
      }

      modeRef.current = 'longPressWait';
      longPressPointRef.current = p;
      longPressTimerRef.current = setTimeout(() => {
        longPressTimerRef.current = null;
        if (modeRef.current !== 'longPressWait' || movedRef.current) return;
        const point = longPressPointRef.current;
        if (!point) return;
        modeRef.current = 'none';
        placeMarkerAtScreen(point.x, point.y);
      }, LONG_PRESS_MS);
    },
    [clearLongPressTimer, isNearPin, placeMarkerAtScreen, toStageTouch, syncStageRect],
  );

  const handleTouchMove = useCallback(
    (event: ITouchEvent) => {
      const touches = event.touches ?? [];

      if (touches.length >= 2) {
        clearLongPressTimer();
        if (modeRef.current !== 'pinch') {
          modeRef.current = 'pinch';
          viewportStartRef.current = viewportRef.current;
          const a = toStageTouch(touches[0]);
          const b = toStageTouch(touches[1]);
          pinchStartDistRef.current = Math.max(1, touchDistance(a, b));
          pinchStartCenterRef.current = touchCenter(a, b);
        }
        const a = toStageTouch(touches[0]);
        const b = toStageTouch(touches[1]);
        const dist = touchDistance(a, b);
        const ratio = dist / pinchStartDistRef.current;
        const start = viewportStartRef.current;
        const next = zoomViewportAtScreen(
          start,
          pinchStartCenterRef.current.x,
          pinchStartCenterRef.current.y,
          start.scale * ratio,
        );
        movedRef.current = true;
        commitViewport(next);
        return;
      }

      if (touches.length !== 1) return;
      const p = toStageTouch(touches[0]);

      if (modeRef.current === 'dragPin') {
        movedRef.current = true;
        updateMarkerFromScreen(p.x, p.y);
        applyEdgePan(p.x, p.y);
        return;
      }

      if (modeRef.current === 'longPressWait' && panStartTouchRef.current) {
        const dx = p.x - panStartTouchRef.current.x;
        const dy = p.y - panStartTouchRef.current.y;
        if (
          Math.abs(dx) > TAP_MOVE_THRESHOLD_PX ||
          Math.abs(dy) > TAP_MOVE_THRESHOLD_PX
        ) {
          movedRef.current = true;
          clearLongPressTimer();
          modeRef.current = 'pan';
        }
      }

      if (modeRef.current === 'pan' && panStartTouchRef.current) {
        const dx = p.x - panStartTouchRef.current.x;
        const dy = p.y - panStartTouchRef.current.y;
        const start = viewportStartRef.current;
        commitViewport(panViewport(start, dx, dy));
        return;
      }

      if (modeRef.current === 'longPressWait' && !movedRef.current) {
        return;
      }
    },
    [
      applyEdgePan,
      clearLongPressTimer,
      commitViewport,
      toStageTouch,
      updateMarkerFromScreen,
    ],
  );

  const endGesture = useCallback(() => {
    clearLongPressTimer();
    modeRef.current = 'none';
    panStartTouchRef.current = null;
    longPressPointRef.current = null;
  }, [clearLongPressTimer]);

  const handleTouchEnd = useCallback(
    (event: ITouchEvent) => {
      const remaining = event.touches?.length ?? 0;
      if (remaining >= 1) {
        if (remaining === 1 && modeRef.current === 'pinch') {
          modeRef.current = 'pan';
          const p = toStageTouch(event.touches[0]);
          panStartTouchRef.current = p;
          viewportStartRef.current = viewportRef.current;
        }
        return;
      }
      endGesture();
    },
    [endGesture, toStageTouch],
  );

  const handleTouchCancel = useCallback(() => {
    endGesture();
  }, [endGesture]);

  const handleZoomIn = useCallback(() => {
    commitViewport(
      stepVenueMapViewportZoom(
        viewportRef.current,
        'in',
        viewWidth / 2,
        viewHeight / 2,
      ),
    );
  }, [commitViewport, viewWidth, viewHeight]);

  const handleZoomOut = useCallback(() => {
    commitViewport(
      stepVenueMapViewportZoom(
        viewportRef.current,
        'out',
        viewWidth / 2,
        viewHeight / 2,
      ),
    );
  }, [commitViewport, viewWidth, viewHeight]);

  const confirmMarkerName = useCallback(() => {
    const label = draftLabel.trim();
    if (!label) {
      void Taro.showToast({ title: '请为标记命名', icon: 'none' });
      return;
    }
    setMarker((prev) => (prev ? { ...prev, label } : null));
    setPhase('placed');
    setNameSheetOpen(false);
  }, [draftLabel]);

  const cancelMarkerNaming = useCallback(() => {
    setMarker(null);
    setPhase('idle');
    setDraftLabel('');
    setNameSheetOpen(false);
  }, []);

  const scaledMapWidth = mapSize.width * viewport.scale;
  const scaledMapHeight = mapSize.height * viewport.scale;

  const worldLayoutStyle = {
    left: `${viewport.offsetX}px`,
    top: `${viewport.offsetY}px`,
    width: `${scaledMapWidth}px`,
    height: `${scaledMapHeight}px`,
  } as const;

  const pinScreen = marker && mapSize.width > 0 ? markerScreenPosition(marker) : null;

  return {
    mapSize,
    viewport,
    worldLayoutStyle,
    marker,
    phase,
    pinScreen,
    nameSheetOpen,
    draftLabel,
    setDraftLabel,
    confirmMarkerName,
    cancelMarkerNaming,
    openNameSheet,
    handleTouchStart: asTouchHandler(handleTouchStart),
    handleTouchMove: asTouchHandler(handleTouchMove),
    handleTouchEnd: asTouchHandler(handleTouchEnd),
    handleTouchCancel: asTouchHandler(handleTouchCancel),
    handleZoomIn,
    handleZoomOut,
    canShare: phase === 'placed' && Boolean(marker?.label),
  };
}
