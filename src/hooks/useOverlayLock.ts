import { useLayoutEffect } from 'react';
import {
  selectOverlayLockActive,
  useOverlayLockStore,
} from '../stores/overlayLockStore';

/** When true, hides the global AI FAB and signals an overlay/form is active. */
export function useOverlayLock(open: boolean) {
  const acquire = useOverlayLockStore((state) => state.acquire);
  const release = useOverlayLockStore((state) => state.release);

  useLayoutEffect(() => {
    if (!open) return;
    acquire();
    return () => {
      release();
    };
  }, [open, acquire, release]);
}

/** True while any overlay/sheet/dialog holds the global overlay lock. */
export function useIsOverlayLocked(): boolean {
  return useOverlayLockStore(selectOverlayLockActive);
}
