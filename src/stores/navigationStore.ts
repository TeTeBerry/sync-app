import { create } from 'zustand';
import type { AiAssistantNavIntent, ProfileNavIntent } from './types';

export type RouteTransitionState = {
  active: boolean;
  eventId?: number;
  /** Bottom tab being switched to (HOME / EVENTS / PROFILE). */
  tabTarget?: string;
};

export interface NavigationState {
  profileIntent: ProfileNavIntent | null;
  aiAssistantIntent: AiAssistantNavIntent | null;
  activeActivityLegacyId: number | null;
  routeTransition: RouteTransitionState;
  setProfileIntent: (intent: ProfileNavIntent | null) => void;
  consumeProfileIntent: () => ProfileNavIntent | null;
  setAiAssistantIntent: (intent: AiAssistantNavIntent | null) => void;
  consumeAiAssistantIntent: () => AiAssistantNavIntent | null;
  setActiveActivityLegacyId: (legacyId: number | null) => void;
  beginRouteTransition: (options?: { eventId?: number; tabTarget?: string }) => void;
  endRouteTransition: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  profileIntent: null,
  aiAssistantIntent: null,
  activeActivityLegacyId: null,
  routeTransition: { active: false },

  setProfileIntent: (intent) => set({ profileIntent: intent }),
  consumeProfileIntent: () => {
    const intent = get().profileIntent;
    if (intent) set({ profileIntent: null });
    return intent;
  },

  setAiAssistantIntent: (intent) => set({ aiAssistantIntent: intent }),
  consumeAiAssistantIntent: () => {
    const intent = get().aiAssistantIntent;
    if (intent) set({ aiAssistantIntent: null });
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
