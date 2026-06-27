import { applyScrollTop } from '../../../utils/scrollToCenter';
import { catalogArtistLetterDomId } from '../../../utils/catalogLineupArtistSort';
import type { CatalogArtistLetterSection } from '../../../utils/catalogLineupArtistSort';
import { createEventsSelectorQuery } from './createEventsSelectorQuery';

export const EVENTS_ARTISTS_SCROLL_SELECTOR = '.s-events__artists-scroll';
export const CATALOG_ARTIST_SCROLL_GAP_PX = 8;
const SCROLL_SPY_THROTTLE_MS = 80;
const LETTER_SCROLL_LOCK_MS = 900;

type ElementRect = {
  top?: number;
  height?: number;
};

export function detectActiveLetterFromScrollViewport(
  scrollViewportTop: number,
  sections: Array<{ letter: string; top: number }>,
  gapPx = CATALOG_ARTIST_SCROLL_GAP_PX,
): string | null {
  const anchorY = scrollViewportTop + gapPx;
  const ordered = [...sections]
    .filter((section) => Number.isFinite(section.top))
    .sort((a, b) => a.top - b.top);

  if (!ordered.length) {
    return null;
  }

  if (anchorY < ordered[0].top) {
    return ordered[0].letter;
  }

  for (let index = 0; index < ordered.length; index += 1) {
    const current = ordered[index];
    const nextTop = ordered[index + 1]?.top ?? Number.POSITIVE_INFINITY;
    if (current.top <= anchorY && anchorY < nextTop) {
      return current.letter;
    }
  }

  return ordered[ordered.length - 1]?.letter ?? null;
}

function measureScrollTopToSection(
  scrollViewSelector: string,
  targetSelector: string,
  gapPx = CATALOG_ARTIST_SCROLL_GAP_PX,
): Promise<number | null> {
  return new Promise((resolve) => {
    const query = createEventsSelectorQuery();
    query
      .select(scrollViewSelector)
      .fields({ size: true, scrollOffset: true, rect: true });
    query.select(targetSelector).boundingClientRect();
    query.exec((res) => {
      const scrollView = res?.[0] as
        | (ElementRect & {
            scrollTop?: number;
            height?: number;
          })
        | null;
      const target = res?.[1] as ElementRect | null;
      if (
        !scrollView ||
        !target ||
        scrollView.scrollTop == null ||
        scrollView.top == null ||
        target.top == null
      ) {
        resolve(null);
        return;
      }

      const offsetInView = target.top - scrollView.top;
      resolve(Math.max(0, Math.round(scrollView.scrollTop + offsetInView - gapPx)));
    });
  });
}

export async function scrollCatalogArtistLetterToTop(
  letter: string,
  setScrollTop: (value: number | undefined) => void,
): Promise<boolean> {
  const headDomId = catalogArtistLetterDomId(letter);
  const top = await measureScrollTopToSection(
    EVENTS_ARTISTS_SCROLL_SELECTOR,
    `#${headDomId}`,
  );
  if (top == null) {
    return false;
  }

  applyScrollTop(setScrollTop, top);
  return true;
}

export function createCatalogArtistScrollSpy(
  sections: CatalogArtistLetterSection[],
  onActiveLetterChange: (letter: string | null) => void,
): {
  lock: () => void;
  unlock: () => void;
  onMainScroll: () => void;
  dispose: () => void;
} {
  let locked = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const onMainScroll = () => {
    if (locked || !sections.length) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      const query = createEventsSelectorQuery();
      query.select(EVENTS_ARTISTS_SCROLL_SELECTOR).boundingClientRect();
      for (const section of sections) {
        query
          .select(`#${catalogArtistLetterDomId(section.letter)}`)
          .boundingClientRect();
      }

      query.exec((res) => {
        const scrollViewport = res?.[0] as ElementRect | null;
        if (scrollViewport?.top == null) {
          return;
        }

        const viewportSections = sections.map((section, index) => ({
          letter: section.letter,
          top:
            (res?.[index + 1] as ElementRect | null)?.top ?? Number.POSITIVE_INFINITY,
        }));

        onActiveLetterChange(
          detectActiveLetterFromScrollViewport(scrollViewport.top, viewportSections),
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

export const catalogArtistLetterScrollLockMs = LETTER_SCROLL_LOCK_MS;
