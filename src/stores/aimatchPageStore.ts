import { create } from "zustand";
import type { PinDanCategory } from "../utils/apiMappers";
import type { AimatchTab } from "./types";

interface AimatchPageState {
  activeTab: AimatchTab;
  createCategory: PinDanCategory;
  filterActivityLegacyId: number | null;
  highlightTicketId: string | null;
  highlightPindanId: string | null;
  showCreateModal: boolean;
  goingIds: string[];
  setActiveTab: (tab: AimatchTab) => void;
  setCreateCategory: (category: PinDanCategory) => void;
  focusPindanCard: (legacyId: number, category: PinDanCategory) => void;
  focusActivityPindan: (
    activityLegacyId: number,
    category: PinDanCategory,
    highlightPindanId?: number,
  ) => void;
  focusTicket: (ticketId: string) => void;
  clearPindanHighlight: () => void;
  clearActivityFilter: () => void;
  clearTicketHighlight: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  toggleGoing: (eventId: string) => void;
}

export const useAimatchPageStore = create<AimatchPageState>((set) => ({
  activeTab: "ai",
  createCategory: "hotel",
  filterActivityLegacyId: null,
  highlightTicketId: null,
  highlightPindanId: null,
  showCreateModal: false,
  goingIds: [],

  setActiveTab: (tab) => set({ activeTab: tab }),
  setCreateCategory: (category) => set({ createCategory: category }),

  focusPindanCard: (legacyId, category) =>
    set({
      activeTab: "pindan",
      createCategory: category,
      filterActivityLegacyId: null,
      highlightPindanId: String(legacyId),
    }),

  focusActivityPindan: (activityLegacyId, category, highlightPindanId) =>
    set({
      activeTab: "pindan",
      createCategory: category,
      filterActivityLegacyId: activityLegacyId,
      highlightPindanId:
        highlightPindanId != null ? String(highlightPindanId) : null,
    }),

  focusTicket: (ticketId) =>
    set({
      activeTab: "ticket",
      highlightTicketId: ticketId,
    }),

  clearPindanHighlight: () => set({ highlightPindanId: null }),
  clearActivityFilter: () => set({ filterActivityLegacyId: null }),
  clearTicketHighlight: () => set({ highlightTicketId: null }),
  openCreateModal: () => set({ showCreateModal: true }),
  closeCreateModal: () => set({ showCreateModal: false }),

  toggleGoing: (eventId) =>
    set((state) => ({
      goingIds: state.goingIds.includes(eventId)
        ? state.goingIds.filter((id) => id !== eventId)
        : [...state.goingIds, eventId],
    })),
}));
