import { LINEUP_GENRE_NAV_DOM_ID } from './lineupGenreSectionDomId';
import { createLineupSelectorQuery } from './createLineupSelectorQuery';

export const ACTIVITY_LINEUP_SCROLL_SELECTOR = '.s-activity-lineup__scroll';

export const LINEUP_SCROLL_GAP_PX = 8;
const SCROLL_SPY_THROTTLE_MS = 80;
const CHIP_SCROLL_LOCK_MS = 900;

export type ElementRect = {
  top?: number;
  height?: number;
  bottom?: number;
};

export function detectActiveGenreIdFromScrollViewport(
  scrollViewportTop: number,
  sections: Array<{ id: string; top: number }>,
  gapPx = LINEUP_SCROLL_GAP_PX,
): string {
  const anchorY = scrollViewportTop + gapPx;
  const ordered = [...sections]
    .filter((section) => Number.isFinite(section.top))
    .sort((a, b) => a.top - b.top);

  if (!ordered.length) {
    return 'all';
  }

  if (anchorY < ordered[0].top) {
    return 'all';
  }

  for (let index = 0; index < ordered.length; index += 1) {
    const current = ordered[index];
    const nextTop = ordered[index + 1]?.top ?? Number.POSITIVE_INFINITY;
    if (current.top <= anchorY && anchorY < nextTop) {
      return current.id;
    }
  }

  return ordered[ordered.length - 1]?.id ?? 'all';
}

export function scrollLineupHeadIntoView(
  headDomId: string,
  setScrollIntoViewId: (value: string) => void,
): void {
  setScrollIntoViewId('');
  setTimeout(() => setScrollIntoViewId(headDomId), 0);
  setTimeout(() => setScrollIntoViewId(''), 900);
}

export function createLineupScrollSpy(
  genreGroups: Array<{ id: string }>,
  resolveHeadDomId: (groupId: string) => string,
  onActiveGenreChange: (genreId: string) => void,
): {
  lock: () => void;
  unlock: () => void;
  onMainScroll: () => void;
  dispose: () => void;
} {
  let locked = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const onMainScroll = () => {
    if (locked || genreGroups.length <= 1) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const query = createLineupSelectorQuery();
      query.select(ACTIVITY_LINEUP_SCROLL_SELECTOR).boundingClientRect();
      for (const group of genreGroups) {
        query.select(`#${resolveHeadDomId(group.id)}`).boundingClientRect();
      }

      query.exec((res) => {
        const scrollViewport = res?.[0] as ElementRect | null;
        if (scrollViewport?.top == null) {
          return;
        }

        const sections = genreGroups.map((group, index) => ({
          id: group.id,
          top:
            (res?.[index + 1] as ElementRect | null)?.top ?? Number.POSITIVE_INFINITY,
        }));

        onActiveGenreChange(
          detectActiveGenreIdFromScrollViewport(scrollViewport.top, sections),
        );
      });
    }, SCROLL_SPY_THROTTLE_MS);
  };

  return {
    lock: () => {
      locked = true;
    },
    unlock: () => {
      locked = false;
    },
    onMainScroll,
    dispose: () => {
      if (timer) {
        clearTimeout(timer);
      }
    },
  };
}

export const lineupChipScrollLockMs = CHIP_SCROLL_LOCK_MS;
export const lineupGenreNavDomId = LINEUP_GENRE_NAV_DOM_ID;
