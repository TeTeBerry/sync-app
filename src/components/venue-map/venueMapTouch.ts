/** 将触摸点换算为地图舞台（.s-event-map__stage）内的坐标 */

export type StageRect = {
  left: number;
  top: number;
};

type TouchLike = {
  x?: number;
  y?: number;
  clientX?: number;
  clientY?: number;
  pageX?: number;
  pageY?: number;
};

export function touchPageXY(touch: TouchLike): { x: number; y: number } {
  return {
    x: touch.pageX ?? touch.clientX ?? touch.x ?? 0,
    y: touch.pageY ?? touch.clientY ?? touch.y ?? 0,
  };
}

export function touchStageXY(
  touch: TouchLike,
  stage: StageRect,
  stageTopFallbackPx = 0,
): { x: number; y: number } {
  const page = touchPageXY(touch);
  const left = stage.left > 0 ? stage.left : 0;
  const top = stage.top > 0 ? stage.top : stageTopFallbackPx;
  return {
    x: page.x - left,
    y: page.y - top,
  };
}
