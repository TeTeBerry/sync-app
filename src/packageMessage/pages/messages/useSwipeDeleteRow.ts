import { useCallback, useEffect, useRef, useState } from 'react';

const LOCK_THRESHOLD_PX = 8;

type UseSwipeDeleteRowOptions = {
  rowId: string;
  openRowId: string | null;
  setOpenRowId: (id: string | null) => void;
  actionWidth?: number;
};

export function useSwipeDeleteRow({
  rowId,
  openRowId,
  setOpenRowId,
  actionWidth = 80,
}: UseSwipeDeleteRowOptions) {
  const [offsetX, setOffsetX] = useState(0);
  const [catchMove, setCatchMove] = useState(false);
  const [dragging, setDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lockRef = useRef<'h' | 'v' | null>(null);
  const offsetRef = useRef(0);

  const isOpen = openRowId === rowId;

  const close = useCallback(() => {
    setOpenRowId(null);
    offsetRef.current = 0;
    setOffsetX(0);
    setCatchMove(false);
  }, [setOpenRowId]);

  useEffect(() => {
    if (openRowId !== rowId && offsetRef.current !== 0) {
      offsetRef.current = 0;
      setOffsetX(0);
      setCatchMove(false);
    }
  }, [openRowId, rowId]);

  const onTouchStart = useCallback((clientX: number, clientY: number) => {
    startXRef.current = clientX;
    startYRef.current = clientY;
    startOffsetRef.current = offsetRef.current;
    lockRef.current = null;
  }, []);

  const onTouchMove = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - startXRef.current;
      const dy = clientY - startYRef.current;

      if (!lockRef.current) {
        if (Math.abs(dx) > LOCK_THRESHOLD_PX || Math.abs(dy) > LOCK_THRESHOLD_PX) {
          lockRef.current = Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
        }
      }

      if (lockRef.current !== 'h') {
        return;
      }

      setDragging(true);
      setCatchMove(true);
      const next = Math.min(0, Math.max(-actionWidth, startOffsetRef.current + dx));
      offsetRef.current = next;
      setOffsetX(next);
    },
    [actionWidth],
  );

  const onTouchEnd = useCallback(() => {
    if (lockRef.current !== 'h') {
      lockRef.current = null;
      setCatchMove(false);
      return;
    }

    const shouldOpen = offsetRef.current <= -actionWidth / 2;
    if (shouldOpen) {
      setOpenRowId(rowId);
      offsetRef.current = -actionWidth;
      setOffsetX(-actionWidth);
    } else {
      close();
    }

    lockRef.current = null;
    setCatchMove(false);
    setDragging(false);
  }, [actionWidth, close, rowId, setOpenRowId]);

  return {
    offsetX,
    catchMove,
    dragging,
    isOpen,
    close,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
