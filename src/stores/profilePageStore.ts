import { create } from "zustand";
import type { ProfileTab } from "./types";

interface ProfilePageState {
  activeTab: ProfileTab;
  highlightPindanId: number | null;
  notificationsEnabled: boolean;
  privacyLevel: string;
  setActiveTab: (tab: ProfileTab) => void;
  setHighlightPindanId: (id: number | null) => void;
  clearHighlight: () => void;
  applyRoute: (params: { tab: ProfileTab | null; highlightId: number | null }) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPrivacyLevel: (level: string) => void;
}

export const useProfilePageStore = create<ProfilePageState>((set) => ({
  activeTab: "participated",
  highlightPindanId: null,
  notificationsEnabled: true,
  privacyLevel: "public",

  setActiveTab: (tab) => set({ activeTab: tab }),
  setHighlightPindanId: (id) => set({ highlightPindanId: id }),
  clearHighlight: () => set({ highlightPindanId: null }),

  applyRoute: ({ tab, highlightId }) =>
    set((state) => ({
      activeTab: tab ?? state.activeTab,
      highlightPindanId: highlightId,
    })),

  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setPrivacyLevel: (level) => set({ privacyLevel: level }),
}));
