import { document } from '@tarojs/runtime';

const DRAGGING_CLASS = 's-messages__swipe-content--dragging';

type ApplySwipeOffsetOptions = {
  dragging?: boolean;
  animate?: boolean;
};

type MotionElement = {
  style: {
    transform: string;
    transition: string;
  };
  classList: {
    add: (className: string) => void;
    remove: (className: string) => void;
  };
};

function asMotionElement(node: unknown): MotionElement | null {
  if (node == null || typeof node !== 'object') return null;
  const candidate = node as Partial<MotionElement>;
  if (!candidate.style || !candidate.classList) return null;
  return candidate as MotionElement;
}

export function applySwipeOffset(
  elementId: string,
  offsetX: number,
  options?: ApplySwipeOffsetOptions,
): boolean {
  const el = asMotionElement(document.getElementById(elementId));
  if (!el) return false;

  el.style.transform = `translate3d(${offsetX}px, 0, 0)`;
  if (options?.animate === false) {
    el.style.transition = 'none';
  } else if (options?.animate) {
    el.style.transition = 'transform 0.18s ease-out';
  }

  if (options?.dragging === true) {
    el.classList.add(DRAGGING_CLASS);
  } else if (options?.dragging === false) {
    el.classList.remove(DRAGGING_CLASS);
  }

  return true;
}

export function swipeContentId(rowId: string): string {
  return `msg-swipe-${rowId}`;
}
