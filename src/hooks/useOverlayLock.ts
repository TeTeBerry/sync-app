import { useEffect } from "react";

/** Prevent background scroll while an overlay is open (H5). */
export function useOverlayLock(open: boolean) {
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);
}
