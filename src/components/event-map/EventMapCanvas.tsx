/**
 * @deprecated Canvas 已移至 `packageEvent/pages/event-map/index.tsx` 页面根节点（微信须页面级 Canvas 2d）。
 * 保留导出供类型/工具引用。
 */
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
