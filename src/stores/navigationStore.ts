import { create } from "zustand";
import type { AiAssistantNavIntent, ProfileNavIntent } from "./types";

interface NavigationState {
  profileIntent: ProfileNavIntent | null;
  aiAssistantIntent: AiAssistantNavIntent | null;
  activeActivityLegacyId: number | null;
  setProfileIntent: (intent: ProfileNavIntent | null) => void;
  consumeProfileIntent: () => ProfileNavIntent | null;
  setAiAssistantIntent: (intent: AiAssistantNavIntent | null) => void;
  consumeAiAssistantIntent: () => AiAssistantNavIntent | null;
  setActiveActivityLegacyId: (legacyId: number | null) => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  profileIntent: null,
  aiAssistantIntent: null,
  activeActivityLegacyId: null,

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
}));
