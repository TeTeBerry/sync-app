import { create } from 'zustand';
import type {
  EventDetailBuddyPostNavIntent,
  EventDetailTravelGuideNavIntent,
  ExclusiveItineraryNavIntent,
} from './types';

export type RouteTransitionState = {
  active: boolean;
  eventId?: number;
  /** Bottom tab being switched to (HOME / EVENTS / PROFILE). */
  tabTarget?: string;
};

export interface NavigationState {
  exclusiveItineraryIntent: ExclusiveItineraryNavIntent | null;
  eventDetailBuddyPostIntent: EventDetailBuddyPostNavIntent | null;
  eventDetailTravelGuideIntent: EventDetailTravelGuideNavIntent | null;
  activeActivityLegacyId: number | null;
  routeTransition: RouteTransitionState;
  setExclusiveItineraryIntent: (intent: ExclusiveItineraryNavIntent | null) => void;
  consumeExclusiveItineraryIntent: () => ExclusiveItineraryNavIntent | null;
  setEventDetailBuddyPostIntent: (intent: EventDetailBuddyPostNavIntent | null) => void;
  consumeEventDetailBuddyPostIntent: () => EventDetailBuddyPostNavIntent | null;
  setEventDetailTravelGuideIntent: (
    intent: EventDetailTravelGuideNavIntent | null,
  ) => void;
  consumeEventDetailTravelGuideIntent: () => EventDetailTravelGuideNavIntent | null;
  setActiveActivityLegacyId: (legacyId: number | null) => void;
  beginRouteTransition: (options?: { eventId?: number; tabTarget?: string }) => void;
  endRouteTransition: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  exclusiveItineraryIntent: null,
  eventDetailBuddyPostIntent: null,
  eventDetailTravelGuideIntent: null,
  activeActivityLegacyId: null,
  routeTransition: { active: false },

  setExclusiveItineraryIntent: (intent) => set({ exclusiveItineraryIntent: intent }),
  consumeExclusiveItineraryIntent: () => {
    const intent = get().exclusiveItineraryIntent;
    if (intent) set({ exclusiveItineraryIntent: null });
    return intent;
  },

  setEventDetailBuddyPostIntent: (intent) =>
    set({ eventDetailBuddyPostIntent: intent }),
  consumeEventDetailBuddyPostIntent: () => {
    const intent = get().eventDetailBuddyPostIntent;
    if (intent) set({ eventDetailBuddyPostIntent: null });
    return intent;
  },

  setEventDetailTravelGuideIntent: (intent) =>
    set({ eventDetailTravelGuideIntent: intent }),
  consumeEventDetailTravelGuideIntent: () => {
    const intent = get().eventDetailTravelGuideIntent;
    if (intent) set({ eventDetailTravelGuideIntent: null });
    return intent;
  },

  setActiveActivityLegacyId: (legacyId) => set({ activeActivityLegacyId: legacyId }),

  beginRouteTransition: (options) =>
    set({
      routeTransition: {
        active: true,
        ...(options?.eventId != null ? { eventId: options.eventId } : {}),
        ...(options?.tabTarget ? { tabTarget: options.tabTarget } : {}),
      },
    }),

  endRouteTransition: () => set({ routeTransition: { active: false } }),
}));
