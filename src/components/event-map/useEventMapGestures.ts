import { useCallback, useRef } from "react";
import type { CanvasTouchEvent } from "@tarojs/components";
import {
  getEventMapViewport,
  repaintEventMapNow,
  setEventMapInteracting,
  setEventMapViewport,
} from "./eventMapCanvasRuntime";
import { findMarkerAtScreen } from "./eventMapHitTest";
import type { EventMapMarker } from "./eventMapMarkers";
import {
  panViewport,
  zoomViewportAtScreen,
  type EventMapViewport,
} from "./eventMapViewport";

const TAP_MOVE_THRESHOLD_PX = 10;
const TAP_DURATION_MS = 280;

type TouchPoint = { x: number; y: number };

type GestureMode = "none" | "pan" | "pinch";

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

export type UseEventMapGesturesOptions = {
  eventTitle: string;
  mapWidth: number;
  mapHeight: number;
  onMarkerTap?: (marker: EventMapMarker) => void;
};

export function useEventMapGestures({
  eventTitle,
  mapWidth,
  mapHeight,
  onMarkerTap,
}: UseEventMapGesturesOptions) {
  const titleRef = useRef(eventTitle);
  titleRef.current = eventTitle;

  const modeRef = useRef<GestureMode>("none");
  const viewportStartRef = useRef<EventMapViewport>(getEventMapViewport());
  const panStartTouchRef = useRef<TouchPoint | null>(null);
  const pinchStartDistRef = useRef(0);
  const pinchStartCenterRef = useRef<TouchPoint>({ x: 0, y: 0 });
  const tapStartRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const movedRef = useRef(false);

  const commitViewport = useCallback((viewport: EventMapViewport) => {
    setEventMapViewport(viewport);
    repaintEventMapNow(titleRef.current);
  }, []);

  const handleTouchStart = useCallback((event: CanvasTouchEvent) => {
    const touches = event.touches ?? [];
    if (touches.length === 0) {
      return;
    }

    setEventMapInteracting(true);
    viewportStartRef.current = getEventMapViewport();
    movedRef.current = false;

    if (touches.length >= 2) {
      modeRef.current = "pinch";
      const a = touchXY(touches[0]);
      const b = touchXY(touches[1]);
      pinchStartDistRef.current = Math.max(1, touchDistance(a, b));
      pinchStartCenterRef.current = touchCenter(a, b);
      tapStartRef.current = null;
      return;
    }

    modeRef.current = "pan";
    const p = touchXY(touches[0]);
    panStartTouchRef.current = p;
    tapStartRef.current = { x: p.x, y: p.y, t: Date.now() };
  }, []);

  const handleTouchMove = useCallback(
    (event: CanvasTouchEvent) => {
      const touches = event.touches ?? [];

      if (touches.length >= 2) {
        if (modeRef.current !== "pinch") {
          modeRef.current = "pinch";
          viewportStartRef.current = getEventMapViewport();
          const a = touchXY(touches[0]);
          const b = touchXY(touches[1]);
          pinchStartDistRef.current = Math.max(1, touchDistance(a, b));
          pinchStartCenterRef.current = touchCenter(a, b);
        }
      }

      if (touches.length >= 2 && modeRef.current === "pinch") {
        const a = touchXY(touches[0]);
        const b = touchXY(touches[1]);
        const dist = touchDistance(a, b);
        const center = touchCenter(a, b);
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

      if (
        touches.length === 1 &&
        modeRef.current === "pan" &&
        panStartTouchRef.current
      ) {
        const p = touchXY(touches[0]);
        const dx = p.x - panStartTouchRef.current.x;
        const dy = p.y - panStartTouchRef.current.y;

        if (
          Math.abs(dx) > TAP_MOVE_THRESHOLD_PX ||
          Math.abs(dy) > TAP_MOVE_THRESHOLD_PX
        ) {
          movedRef.current = true;
        }

        const start = viewportStartRef.current;
        commitViewport(panViewport(start, dx, dy));
      }
    },
    [commitViewport],
  );

  const handleTouchEnd = useCallback(
    (event: CanvasTouchEvent) => {
      const remaining = event.touches?.length ?? 0;

      if (remaining >= 2) {
        return;
      }

      if (remaining === 1) {
        modeRef.current = "pan";
        const p = touchXY(event.touches[0]);
        panStartTouchRef.current = p;
        viewportStartRef.current = getEventMapViewport();
        return;
      }

      const tap = tapStartRef.current;
      const wasPan = modeRef.current === "pan";
      modeRef.current = "none";
      panStartTouchRef.current = null;
      tapStartRef.current = null;
      setEventMapInteracting(false);
      repaintEventMapNow(titleRef.current);

      if (
        wasPan &&
        !movedRef.current &&
        tap &&
        Date.now() - tap.t <= TAP_DURATION_MS &&
        onMarkerTap
      ) {
        const marker = findMarkerAtScreen(
          tap.x,
          tap.y,
          mapWidth,
          mapHeight,
          getEventMapViewport(),
        );
        if (marker) {
          onMarkerTap(marker);
        }
      }
    },
    [mapHeight, mapWidth, onMarkerTap],
  );

  const handleTouchCancel = useCallback(() => {
    modeRef.current = "none";
    panStartTouchRef.current = null;
    tapStartRef.current = null;
    setEventMapInteracting(false);
    repaintEventMapNow(titleRef.current);
  }, []);

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  };
}
