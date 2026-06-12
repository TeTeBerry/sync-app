import { useEffect, useRef } from 'react';
import { useOverlayLockStore } from '../stores/overlayLockStore';

/** When true, hides the global AI FAB and signals an overlay/form is active. */
export function useOverlayLock(open: boolean) {
  const acquire = useOverlayLockStore((state) => state.acquire);
  const release = useOverlayLockStore((state) => state.release);
  const heldRef = useRef(false);

  useEffect(() => {
    if (open && !heldRef.current) {
      acquire();
      heldRef.current = true;
    } else if (!open && heldRef.current) {
      release();
      heldRef.current = false;
    }

    return () => {
      if (heldRef.current) {
        release();
        heldRef.current = false;
      }
    };
  }, [open, acquire, release]);
}
