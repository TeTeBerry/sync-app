import { create } from 'zustand';
import type {
  AiAssistantNavIntent,
  EventDetailBuddyPostNavIntent,
  ExclusiveItineraryNavIntent,
} from './types';

export type RouteTransitionState = {
  active: boolean;
  eventId?: number;
  /** Bottom tab being switched to (HOME / EVENTS / PROFILE). */
  tabTarget?: string;
};

export interface NavigationState {
  aiAssistantIntent: AiAssistantNavIntent | null;
  exclusiveItineraryIntent: ExclusiveItineraryNavIntent | null;
  eventDetailBuddyPostIntent: EventDetailBuddyPostNavIntent | null;
  activeActivityLegacyId: number | null;
  routeTransition: RouteTransitionState;
  setAiAssistantIntent: (intent: AiAssistantNavIntent | null) => void;
  consumeAiAssistantIntent: () => AiAssistantNavIntent | null;
  setExclusiveItineraryIntent: (intent: ExclusiveItineraryNavIntent | null) => void;
  consumeExclusiveItineraryIntent: () => ExclusiveItineraryNavIntent | null;
  setEventDetailBuddyPostIntent: (intent: EventDetailBuddyPostNavIntent | null) => void;
  consumeEventDetailBuddyPostIntent: () => EventDetailBuddyPostNavIntent | null;
  setActiveActivityLegacyId: (legacyId: number | null) => void;
  beginRouteTransition: (options?: { eventId?: number; tabTarget?: string }) => void;
  endRouteTransition: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  aiAssistantIntent: null,
  exclusiveItineraryIntent: null,
  eventDetailBuddyPostIntent: null,
  activeActivityLegacyId: null,
  routeTransition: { active: false },

  setAiAssistantIntent: (intent) => set({ aiAssistantIntent: intent }),
  consumeAiAssistantIntent: () => {
    const intent = get().aiAssistantIntent;
    if (intent) set({ aiAssistantIntent: null });
    return intent;
  },

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
