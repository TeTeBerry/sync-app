import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Taro, { useDidHide, useDidShow, useLoad, useReady } from "@tarojs/taro";
import { EVENT_MAP_CANVAS_ID } from "./eventMapCanvasId";
import type { EventMapMarker } from "./eventMapMarkers";
import {
  bootstrapEventMapCanvas,
  disposeEventMapCanvas,
  getEventMapViewport,
  onEventMapCanvasReady,
  pauseEventMapCanvas,
  repaintEventMapNow,
  requestEventMapPaint,
  resumeEventMapCanvas,
  setEventMapPageScope,
  setEventMapViewport,
} from "./eventMapCanvasRuntime";
import { stepMapViewportZoom } from "./eventMapViewport";
import { getEventMapMapViewportHeight } from "./eventMapLayout";
import { useEventMapGestures } from "./useEventMapGestures";

export type UseEventMapControllerOptions = {
  eventTitle: string;
  onMarkerTap?: (marker: EventMapMarker) => void;
  /** 顶栏总高度（statusBar paddingTop + 内容区），用于 Canvas 尺寸 */
  topChromePx?: number;
};

/**
 * 地图页 Canvas 控制器（须在页面根组件调用；Canvas 为页面直接子节点）。
 */
export function useEventMapController({
  eventTitle,
  onMarkerTap,
  topChromePx,
}: UseEventMapControllerOptions) {
  const titleRef = useRef(eventTitle);
  const titlePaintReadyRef = useRef(false);
  titleRef.current = eventTitle;

  const [mapSize, setMapSize] = useState(() => {
    const { windowWidth, windowHeight } = Taro.getWindowInfo();
    return {
      width: windowWidth,
      height: getEventMapMapViewportHeight(windowHeight, topChromePx),
    };
  });

  useEffect(() => {
    const syncSize = () => {
      const { windowWidth, windowHeight } = Taro.getWindowInfo();
      setMapSize({
        width: windowWidth,
        height: getEventMapMapViewportHeight(windowHeight, topChromePx),
      });
    };
    syncSize();
    Taro.onWindowResize?.(syncSize);
    return () => {
      Taro.offWindowResize?.(syncSize);
    };
  }, [topChromePx]);

  useLoad(() => {
    const inst = Taro.getCurrentInstance();
    setEventMapPageScope(
      (inst?.page as object | undefined) ?? null,
      (inst as object | undefined) ?? null,
    );
  });

  useReady(() => {
    Taro.nextTick(() => {
      setTimeout(() => {
        bootstrapEventMapCanvas(titleRef.current);
      }, 50);
    });
  });

  useDidShow(() => {
    resumeEventMapCanvas(titleRef.current);
  });

  useDidHide(() => {
    pauseEventMapCanvas();
  });

  useEffect(() => {
    if (!titlePaintReadyRef.current) {
      titlePaintReadyRef.current = true;
      return;
    }
    requestEventMapPaint(titleRef.current);
  }, [eventTitle]);

  useEffect(() => {
    return () => {
      disposeEventMapCanvas();
    };
  }, []);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(() => {
        requestEventMapPaint(titleRef.current);
      }, 150);
    };
    Taro.onWindowResize?.(onResize);
    return () => {
      Taro.offWindowResize?.(onResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
    };
  }, []);

  const handleCanvasReady = useCallback(() => {
    onEventMapCanvasReady(titleRef.current);
  }, []);

  const { handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel } =
    useEventMapGestures({
      eventTitle,
      mapWidth: mapSize.width,
      mapHeight: mapSize.height,
      onMarkerTap,
    });

  const canvasStyle = useMemo(
    () =>
      ({
        width: `${mapSize.width}px`,
        height: `${mapSize.height}px`,
      }) as const,
    [mapSize.width, mapSize.height],
  );

  const zoomAtMapCenter = useCallback(
    (direction: "in" | "out") => {
      const anchorX = mapSize.width / 2;
      const anchorY = mapSize.height / 2;
      const next = stepMapViewportZoom(getEventMapViewport(), direction, anchorX, anchorY);
      setEventMapViewport(next);
      repaintEventMapNow(titleRef.current);
    },
    [mapSize.width, mapSize.height],
  );

  const handleZoomIn = useCallback(() => {
    zoomAtMapCenter("in");
  }, [zoomAtMapCenter]);

  const handleZoomOut = useCallback(() => {
    zoomAtMapCenter("out");
  }, [zoomAtMapCenter]);

  return {
    canvasId: EVENT_MAP_CANVAS_ID,
    canvasStyle,
    handleCanvasReady,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    handleZoomIn,
    handleZoomOut,
  };
}
