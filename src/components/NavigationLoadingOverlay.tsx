import "./NavigationLoadingOverlay.scss";
import { useEffect } from "react";
import { useNavigationStore } from "../stores/navigationStore";
import { endRouteTransition } from "../utils/route";
import ThemedPageLoader from "./ThemedPageLoader";

const ROUTE_TRANSITION_MAX_MS = 12_000;

/** Global pink-on-black loader from navigate tap until destination page is ready. */
export default function NavigationLoadingOverlay() {
  const active = useNavigationStore((state) => state.routeTransition.active);

  useEffect(() => {
    if (!active) {
      return;
    }
    const timer = setTimeout(() => endRouteTransition(), ROUTE_TRANSITION_MAX_MS);
    return () => clearTimeout(timer);
  }, [active]);

  if (!active) {
    return null;
  }

  return (
    <ThemedPageLoader
      overlay
      variant="spinner"
      label="加载中…"
      showBrand
      className="s-nav-loading-overlay"
    />
  );
}
