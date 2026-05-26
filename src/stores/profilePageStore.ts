import { create } from "zustand";

interface ProfilePageState {
  notificationsEnabled: boolean;
  privacyLevel: string;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPrivacyLevel: (level: string) => void;
}

export const useProfilePageStore = create<ProfilePageState>((set) => ({
  notificationsEnabled: true,
  privacyLevel: "public",

  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setPrivacyLevel: (level) => set({ privacyLevel: level }),
}));
