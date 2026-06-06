import { useEffect, useMemo, useState } from 'react';
import { isLiveApi } from '../../../constants/api';
import { useItineraryScheduleQuery } from '../../../hooks/useItineraryApi';
import {
  resolveCurrentStormPerformance,
  STORM_FLOOR_ACTIVITY_LEGACY_ID,
  STORM_FLOOR_MOCK_PERFORMANCES,
  type StormFloorPerformance,
} from './stormFloorSchedule';
import { buildStormFloorCrowdDots, type StormFloorDot } from './stormFloorZones';

function mapApiPerformances(
  performances: Array<{
    artistId: string;
    artistName: string;
    dateKey: string;
    startTime: string;
    endTime: string;
    startMinutes: number;
    endMinutes: number;
    genreColor: string;
  }>,
): StormFloorPerformance[] {
  return performances.map((p) => ({
    artistId: p.artistId,
    artistName: p.artistName,
    dateKey: p.dateKey,
    startTime: p.startTime,
    endTime: p.endTime,
    startMinutes: p.startMinutes,
    endMinutes: p.endMinutes,
    genreColor: p.genreColor,
  }));
}

export function useStormFloorLive() {
  const apiEnabled = isLiveApi();
  const scheduleQuery = useItineraryScheduleQuery(
    apiEnabled ? STORM_FLOOR_ACTIVITY_LEGACY_ID : null,
  );

  const performances = useMemo(() => {
    if (apiEnabled && scheduleQuery.data?.performances?.length) {
      return mapApiPerformances(scheduleQuery.data.performances);
    }
    return STORM_FLOOR_MOCK_PERFORMANCES;
  }, [apiEnabled, scheduleQuery.data?.performances]);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 30_000);
    return () => clearInterval(timer);
  }, []);

  const currentPerformance = useMemo(
    () => resolveCurrentStormPerformance(performances),
    [performances, tick],
  );

  const crowdDots = useMemo(() => buildStormFloorCrowdDots(), []);

  return {
    currentPerformance,
    crowdDots,
    isLoading: apiEnabled && scheduleQuery.isLoading,
  };
}

export type { StormFloorDot };
