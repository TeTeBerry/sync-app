import { create } from "zustand";
import type { ProfileTab } from "./types";

interface ProfilePageState {
  activeTab: ProfileTab;
  highlightPindanId: number | null;
  highlightTicketId: string | null;
  notificationsEnabled: boolean;
  privacyLevel: string;
  setActiveTab: (tab: ProfileTab) => void;
  setHighlightPindanId: (id: number | null) => void;
  setHighlightTicketId: (id: string | null) => void;
  clearHighlight: () => void;
  applyRoute: (params: {
    tab: ProfileTab | null;
    highlightId: number | null;
    highlightTicketId: string | null;
  }) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPrivacyLevel: (level: string) => void;
}

export const useProfilePageStore = create<ProfilePageState>((set) => ({
  activeTab: "participated",
  highlightPindanId: null,
  highlightTicketId: null,
  notificationsEnabled: true,
  privacyLevel: "public",

  setActiveTab: (tab) => set({ activeTab: tab }),
  setHighlightPindanId: (id) => set({ highlightPindanId: id }),
  setHighlightTicketId: (id) => set({ highlightTicketId: id }),
  clearHighlight: () => set({ highlightPindanId: null, highlightTicketId: null }),

  applyRoute: ({ tab, highlightId, highlightTicketId }) =>
    set((state) => ({
      activeTab: tab ?? state.activeTab,
      highlightPindanId: tab === "pindan" ? highlightId : null,
      highlightTicketId: tab === "tickets" ? highlightTicketId : null,
    })),

  setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
  setPrivacyLevel: (level) => set({ privacyLevel: level }),
}));
