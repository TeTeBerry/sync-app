import { create } from "zustand";
import type { AimatchNavIntent, PindanNavIntent, ProfileNavIntent } from "./types";

interface NavigationState {
  pindanIntent: PindanNavIntent | null;
  profileIntent: ProfileNavIntent | null;
  aimatchIntent: AimatchNavIntent | null;
  setPindanIntent: (intent: PindanNavIntent | null) => void;
  consumePindanIntent: () => PindanNavIntent | null;
  setProfileIntent: (intent: ProfileNavIntent | null) => void;
  consumeProfileIntent: () => ProfileNavIntent | null;
  setAimatchIntent: (intent: AimatchNavIntent | null) => void;
  consumeAimatchIntent: () => AimatchNavIntent | null;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  pindanIntent: null,
  profileIntent: null,
  aimatchIntent: null,

  setPindanIntent: (intent) => set({ pindanIntent: intent }),
  consumePindanIntent: () => {
    const intent = get().pindanIntent;
    if (intent) set({ pindanIntent: null });
    return intent;
  },

  setProfileIntent: (intent) => set({ profileIntent: intent }),
  consumeProfileIntent: () => {
    const intent = get().profileIntent;
    if (intent) set({ profileIntent: null });
    return intent;
  },

  setAimatchIntent: (intent) => set({ aimatchIntent: intent }),
  consumeAimatchIntent: () => {
    const intent = get().aimatchIntent;
    if (intent) set({ aimatchIntent: null });
    return intent;
  },
}));
