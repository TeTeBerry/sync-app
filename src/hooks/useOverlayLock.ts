import { useEffect, useRef } from 'react';
import {
  selectOverlayLockActive,
  useOverlayLockStore,
} from '../stores/overlayLockStore';

/** When true, hides the global AI FAB and signals an overlay/form is active. */
export function useOverlayLock(open: boolean) {
  const acquire = useOverlayLockStore((state) => state.acquire);
  const release = useOverlayLockStore((state) => state.release);
  const heldRef = useRef(false);

  if (open && !heldRef.current) {
    acquire();
    heldRef.current = true;
  } else if (!open && heldRef.current) {
    release();
    heldRef.current = false;
  }

  useEffect(() => {
    return () => {
      if (heldRef.current) {
        release();
        heldRef.current = false;
      }
    };
  }, [release]);
}

/** True while any overlay/sheet/dialog holds the global overlay lock. */
export function useIsOverlayLocked(): boolean {
  return useOverlayLockStore(selectOverlayLockActive);
}
