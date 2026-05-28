import Taro from "@tarojs/taro";
import { Canvas } from "@tarojs/components";
import { useMemo } from "react";
import { EVENT_MAP_CANVAS_ID } from "./eventMapCanvasId";
import { useEventMapGestures } from "./useEventMapGestures";

export type EventMapCanvasProps = {
  className?: string;
  eventTitle: string;
  onMarkerTap?: (marker: { name: string }) => void;
};

/** Canvas 2d layer; paint via `useEventMapPaint`, gestures built-in. */
export function EventMapCanvas({
  className,
  eventTitle,
  onMarkerTap,
}: EventMapCanvasProps) {
  const { windowWidth, windowHeight } = Taro.getWindowInfo();

  const canvasStyle = useMemo(
    () => ({
      width: `${windowWidth}px`,
      height: `${windowHeight}px`,
    }),
    [windowWidth, windowHeight],
  );

  const {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
  } = useEventMapGestures({
    eventTitle,
    mapWidth: windowWidth,
    mapHeight: windowHeight,
    onMarkerTap,
  });

  return (
    <Canvas
      type="2d"
      id={EVENT_MAP_CANVAS_ID}
      canvasId={EVENT_MAP_CANVAS_ID}
      className={className}
      style={canvasStyle}
      disableScroll
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    />
  );
}

export {
  createIsometricProjection,
  hitTestMarkerLogical,
  hitTestMarkerScreen,
} from "./isometricProjection";
export { findMarkerAtScreen } from "./eventMapHitTest";
export {
  screenToContent,
  contentToScreen,
  type EventMapViewport,
} from "./eventMapViewport";
