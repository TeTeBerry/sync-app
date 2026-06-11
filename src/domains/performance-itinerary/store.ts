import { create } from 'zustand';
import type {
  GenerateItineraryResult,
  ItineraryConflict,
  ItineraryDay,
} from '@/types/itinerary';

export type PendingGeneratedItinerary = {
  activityLegacyId: number;
  selectedDjIds: string[];
  eventMeta: string;
  days: ItineraryDay[];
  conflicts: ItineraryConflict[];
  cached?: boolean;
};

interface ItineraryStoreState {
  pending: PendingGeneratedItinerary | null;
  setPending: (payload: PendingGeneratedItinerary | null) => void;
  setFromGenerateResult: (
    activityLegacyId: number,
    selectedDjIds: string[],
    result: GenerateItineraryResult,
  ) => void;
  consumePending: (activityLegacyId: number) => PendingGeneratedItinerary | null;
}

export const useItineraryStore = create<ItineraryStoreState>((set, get) => ({
  pending: null,

  setPending: (payload) => set({ pending: payload }),

  setFromGenerateResult: (activityLegacyId, selectedDjIds, result) =>
    set({
      pending: {
        activityLegacyId,
        selectedDjIds,
        eventMeta: result.itinerary.eventMeta,
        days: result.itinerary.days,
        conflicts: result.conflicts,
        cached: result.cached,
      },
    }),

  consumePending: (activityLegacyId) => {
    const pending = get().pending;
    if (!pending || pending.activityLegacyId !== activityLegacyId) {
      return null;
    }
    set({ pending: null });
    return pending;
  },
}));
