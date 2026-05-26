import { create } from "zustand";
import type { ProfileTab } from "./types";

interface ProfilePageState {
  activeTab: ProfileTab;
  notificationsEnabled: boolean;
  privacyLevel: string;
  setActiveTab: (tab: ProfileTab) => void;
  applyRoute: (params: { tab: ProfileTab | null }) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPrivacyLevel: (level: string) => void;
}

export const useProfilePageStore = create<ProfilePageState>((set) => ({
  activeTab: "participated",
  notificationsEnabled: true,
  privacyLevel: "public",

  setActiveTab: (tab) => set({ activeTab: tab }),
  applyRoute: ({ tab }) =>
    set((state) => ({
      activeTab: tab ?? state.activeTab,
    })),

  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setPrivacyLevel: (level) => set({ privacyLevel: level }),
}));
