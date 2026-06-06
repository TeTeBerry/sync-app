import { useCallback, useRef } from 'react';

export type SwipeRowController = {
  close: () => void;
  isOpen: () => boolean;
};

export function useSwipeDeleteRegistry() {
  const openRowIdRef = useRef<string | null>(null);
  const controllersRef = useRef(new Map<string, SwipeRowController>());

  const registerRow = useCallback((rowId: string, controller: SwipeRowController) => {
    controllersRef.current.set(rowId, controller);
    return () => {
      const current = controllersRef.current.get(rowId);
      if (current === controller) {
        controllersRef.current.delete(rowId);
      }
    };
  }, []);

  const closeOpenRow = useCallback(() => {
    const openId = openRowIdRef.current;
    if (!openId) return;
    openRowIdRef.current = null;
    controllersRef.current.get(openId)?.close();
  }, []);

  const setOpenRow = useCallback((rowId: string | null) => {
    const prev = openRowIdRef.current;
    if (prev === rowId) return;

    if (prev) {
      controllersRef.current.get(prev)?.close();
    }

    openRowIdRef.current = rowId;
  }, []);

  return {
    openRowIdRef,
    registerRow,
    closeOpenRow,
    setOpenRow,
  };
}
