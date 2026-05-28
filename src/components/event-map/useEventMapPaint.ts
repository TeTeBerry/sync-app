import { useCallback, useEffect, useRef } from "react";
import Taro, { useDidShow, useReady } from "@tarojs/taro";
import {
  disposeEventMapCanvas,
  requestEventMapPaint,
  resumeEventMapCanvas,
} from "./eventMapCanvasRuntime";

/** Page-level hook: WeChat-safe Canvas 2d init + optimized repaint. */
export function useEventMapPaint(eventTitle: string) {
  const titleRef = useRef(eventTitle);
  titleRef.current = eventTitle;

  const paint = useCallback(() => {
    requestEventMapPaint(titleRef.current);
  }, []);

  useReady(() => {
    resumeEventMapCanvas(titleRef.current);
    Taro.nextTick(paint);
    setTimeout(paint, 100);
    setTimeout(paint, 280);
  });

  useDidShow(() => {
    resumeEventMapCanvas(titleRef.current);
    paint();
  });

  useEffect(() => {
    paint();
  }, [eventTitle, paint]);

  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(paint, 150);
    };
    Taro.onWindowResize?.(handleResize);
    return () => {
      Taro.offWindowResize?.(handleResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
      }
      disposeEventMapCanvas();
    };
  }, [paint]);
}
