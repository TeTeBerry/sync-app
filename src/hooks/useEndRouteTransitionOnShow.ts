import { useDidShow } from "@tarojs/taro";
import { endRouteTransition } from "../utils/route";

/** Clears global route-transition overlay when a stack page becomes visible. */
export function useEndRouteTransitionOnShow() {
  useDidShow(() => {
    endRouteTransition();
  });
}
