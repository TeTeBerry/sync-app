import { create } from "zustand";
import type { JoinToastState, PindanTabType } from "./types";

interface PindanPageState {
  activeTab: PindanTabType;
  routeActivityId: number | null;
  highlightItemId: number | null;
  showCreateModal: boolean;
  joinToast: JoinToastState;
  setActiveTab: (tab: PindanTabType) => void;
  applyRoute: (params: {
    activityId: number | null;
    highlightId: number | null;
    type: PindanTabType | null;
  }) => void;
  setHighlightItemId: (id: number | null) => void;
  clearHighlight: () => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  showJoinSuccess: (title: string, profileId: number) => void;
  dismissJoinToast: () => void;
  resetJoinToastProfileId: () => void;
}

const emptyJoinToast = (): JoinToastState => ({
  visible: false,
  title: "",
  profileId: null,
});

export const usePindanPageStore = create<PindanPageState>((set) => ({
  activeTab: "package",
  routeActivityId: null,
  highlightItemId: null,
  showCreateModal: false,
  joinToast: emptyJoinToast(),

  setActiveTab: (tab) => set({ activeTab: tab }),

  applyRoute: ({ activityId, highlightId, type }) =>
    set((state) => ({
      routeActivityId: activityId,
      highlightItemId: highlightId,
      activeTab: type ?? state.activeTab,
    })),

  setHighlightItemId: (id) => set({ highlightItemId: id }),
  clearHighlight: () => set({ highlightItemId: null }),
  openCreateModal: () => set({ showCreateModal: true }),
  closeCreateModal: () => set({ showCreateModal: false }),

  showJoinSuccess: (title, profileId) =>
    set({
      joinToast: { visible: true, title, profileId },
    }),

  dismissJoinToast: () =>
    set((state) => ({
      joinToast: { ...state.joinToast, visible: false },
    })),

  resetJoinToastProfileId: () =>
    set((state) => ({
      joinToast: emptyJoinToast(),
    })),
}));
