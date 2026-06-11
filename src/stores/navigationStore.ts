import { create } from 'zustand';
import type { AiAssistantNavIntent } from './types';

export type RouteTransitionState = {
  active: boolean;
  eventId?: number;
  /** Bottom tab being switched to (HOME / EVENTS / PROFILE). */
  tabTarget?: string;
};

export interface NavigationState {
  aiAssistantIntent: AiAssistantNavIntent | null;
  activeActivityLegacyId: number | null;
  routeTransition: RouteTransitionState;
  setAiAssistantIntent: (intent: AiAssistantNavIntent | null) => void;
  consumeAiAssistantIntent: () => AiAssistantNavIntent | null;
  setActiveActivityLegacyId: (legacyId: number | null) => void;
  beginRouteTransition: (options?: { eventId?: number; tabTarget?: string }) => void;
  endRouteTransition: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  aiAssistantIntent: null,
  activeActivityLegacyId: null,
  routeTransition: { active: false },

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
