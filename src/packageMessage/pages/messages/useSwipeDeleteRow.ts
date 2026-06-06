import { useCallback, useEffect, useRef, useState } from 'react';
import { applySwipeOffset, swipeContentId } from './swipeDeleteMotion';
import {
  clampSwipeOffset,
  detectSwipeLock,
  resolveSwipeOffset,
} from './swipeDeleteMath';

const USE_DOM_MOTION = process.env.TARO_ENV === 'weapp';

type UseSwipeDeleteRowOptions = {
  rowId: string;
  actionWidth?: number;
  setOpenRow: (rowId: string | null) => void;
};

export function useSwipeDeleteRow({
  rowId,
  setOpenRow,
  actionWidth = 80,
}: UseSwipeDeleteRowOptions) {
  const contentId = swipeContentId(rowId);
  const [offsetX, setOffsetX] = useState(0);
  const [catchMove, setCatchMove] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lockRef = useRef<'h' | 'v' | null>(null);
  const offsetRef = useRef(0);
  const catchMoveRef = useRef(false);

  const syncOffset = useCallback(
    (next: number, options?: { dragging?: boolean; animate?: boolean }) => {
      offsetRef.current = next;
      if (USE_DOM_MOTION) {
        applySwipeOffset(contentId, next, options);
        return;
      }
      setOffsetX(next);
    },
    [contentId],
  );

  const close = useCallback(() => {
    catchMoveRef.current = false;
    setCatchMove(false);
    lockRef.current = null;
    syncOffset(0, { dragging: false, animate: true });
    if (!USE_DOM_MOTION) {
      setOffsetX(0);
    }
  }, [syncOffset]);

  useEffect(() => {
    syncOffset(offsetRef.current, { animate: false });
  }, [syncOffset]);

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
        lockRef.current = detectSwipeLock(dx, dy);
      }

      if (lockRef.current !== 'h') {
        return;
      }

      if (!catchMoveRef.current) {
        catchMoveRef.current = true;
        setCatchMove(true);
      }

      const next = clampSwipeOffset(actionWidth, startOffsetRef.current, dx);
      if (next === offsetRef.current) {
        return;
      }
      syncOffset(next, { dragging: true, animate: false });
    },
    [actionWidth, syncOffset],
  );

  const onTouchEnd = useCallback(() => {
    if (lockRef.current !== 'h') {
      lockRef.current = null;
      if (catchMoveRef.current) {
        catchMoveRef.current = false;
        setCatchMove(false);
      }
      return;
    }

    const { open, offset } = resolveSwipeOffset(offsetRef.current, actionWidth);
    if (open) {
      setOpenRow(rowId);
    } else {
      setOpenRow(null);
    }

    catchMoveRef.current = false;
    setCatchMove(false);
    lockRef.current = null;
    syncOffset(offset, { dragging: false, animate: true });
    if (!USE_DOM_MOTION) {
      setOffsetX(offset);
    }
  }, [actionWidth, rowId, setOpenRow, syncOffset]);

  const isShifted = useCallback(() => offsetRef.current < 0, []);

  return {
    contentId,
    offsetX: USE_DOM_MOTION ? offsetRef.current : offsetX,
    catchMove,
    isShifted,
    close,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    useDomMotion: USE_DOM_MOTION,
  };
}
