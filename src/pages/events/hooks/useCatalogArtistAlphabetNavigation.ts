import { useCallback, useEffect, useRef, useState } from 'react';
import type { CatalogArtistLetterSection } from '../../../utils/catalogLineupArtistSort';
import {
  catalogArtistLetterScrollLockMs,
  createCatalogArtistScrollSpy,
  scrollCatalogArtistLetterToTop,
} from '../utils/scrollCatalogArtistSection';

export function useCatalogArtistAlphabetNavigation(
  sections: CatalogArtistLetterSection[],
  enabled: boolean,
) {
  const [scrollTop, setScrollTop] = useState<number | undefined>(undefined);
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const scrollSpyRef = useRef<ReturnType<typeof createCatalogArtistScrollSpy> | null>(
    null,
  );
  const letterScrollLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActiveLetter(null);
      return;
    }

    setActiveLetter(sections[0]?.letter ?? null);
  }, [enabled, sections]);

  useEffect(() => {
    scrollSpyRef.current?.dispose();
    if (!enabled || !sections.length) {
      scrollSpyRef.current = null;
      return;
    }

    scrollSpyRef.current = createCatalogArtistScrollSpy(sections, setActiveLetter);
    scrollSpyRef.current.onMainScroll();

    return () => {
      scrollSpyRef.current?.dispose();
      scrollSpyRef.current = null;
    };
  }, [enabled, sections]);

  useEffect(
    () => () => {
      if (letterScrollLockTimerRef.current) {
        clearTimeout(letterScrollLockTimerRef.current);
      }
    },
    [],
  );

  const handleLetterTap = useCallback((letter: string) => {
    setActiveLetter(letter);
    scrollSpyRef.current?.lock();

    if (letterScrollLockTimerRef.current) {
      clearTimeout(letterScrollLockTimerRef.current);
    }

    void scrollCatalogArtistLetterToTop(letter, setScrollTop).finally(() => {
      letterScrollLockTimerRef.current = setTimeout(() => {
        scrollSpyRef.current?.unlock();
        scrollSpyRef.current?.onMainScroll();
      }, catalogArtistLetterScrollLockMs);
    });
  }, []);

  const handleScroll = useCallback(() => {
    scrollSpyRef.current?.onMainScroll();
  }, []);

  return {
    scrollTop,
    activeLetter,
    handleLetterTap,
    handleScroll,
  };
}
