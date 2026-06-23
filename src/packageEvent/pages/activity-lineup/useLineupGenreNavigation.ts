import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ItineraryDj } from '@/types/itinerary';
import { groupLineupByPrimaryGenre } from './utils/groupLineupByPrimaryGenre';
import { lineupGenreHeadDomId } from './utils/lineupGenreSectionDomId';
import {
  createLineupScrollSpy,
  lineupChipScrollLockMs,
  scrollLineupHeadIntoView,
} from './utils/scrollLineupSection';
import type { LineupArtistSortMode } from './utils/sortLineupArtists';

export function useLineupGenreNavigation(artists: ItineraryDj[]) {
  const [scrollIntoViewId, setScrollIntoViewId] = useState('');
  const [activeGenreId, setActiveGenreId] = useState('all');
  const [sortMode, setSortMode] = useState<LineupArtistSortMode>('popularity');
  const chipScrollLockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollSpyRef = useRef<ReturnType<typeof createLineupScrollSpy> | null>(null);

  const genreGroups = useMemo(() => groupLineupByPrimaryGenre(artists), [artists]);
  const showGenreNav = genreGroups.length > 1;

  useEffect(() => {
    setActiveGenreId('all');
    setSortMode('popularity');
  }, [artists]);

  useEffect(() => {
    scrollSpyRef.current?.dispose();
    scrollSpyRef.current = createLineupScrollSpy(
      genreGroups,
      lineupGenreHeadDomId,
      setActiveGenreId,
    );

    return () => {
      scrollSpyRef.current?.dispose();
      scrollSpyRef.current = null;
    };
  }, [genreGroups]);

  const handleGenreChipTap = useCallback(
    (chipId: string) => {
      setActiveGenreId(chipId);

      if (chipId === 'all' || !showGenreNav) {
        return;
      }

      scrollSpyRef.current?.lock();
      if (chipScrollLockTimerRef.current) {
        clearTimeout(chipScrollLockTimerRef.current);
      }

      scrollLineupHeadIntoView(lineupGenreHeadDomId(chipId), setScrollIntoViewId);

      chipScrollLockTimerRef.current = setTimeout(() => {
        scrollSpyRef.current?.unlock();
        scrollSpyRef.current?.onMainScroll();
      }, lineupChipScrollLockMs);
    },
    [showGenreNav],
  );

  const handleMainScroll = useCallback(() => {
    scrollSpyRef.current?.onMainScroll();
  }, []);

  useEffect(
    () => () => {
      if (chipScrollLockTimerRef.current) {
        clearTimeout(chipScrollLockTimerRef.current);
      }
    },
    [],
  );

  return {
    scrollIntoViewId,
    activeGenreId,
    sortMode,
    setSortMode,
    handleGenreChipTap,
    handleMainScroll,
    showGenreNav,
  };
}
