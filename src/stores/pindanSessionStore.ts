import { create } from "zustand";

interface PindanSessionState {
  joinedIds: Set<number>;
  setJoinedIds: (ids: Iterable<number>) => void;
  addJoinedId: (id: number) => void;
  removeJoinedId: (id: number) => void;
}

export const usePindanSessionStore = create<PindanSessionState>((set) => ({
  joinedIds: new Set<number>(),

  setJoinedIds: (ids) => set({ joinedIds: new Set(ids) }),

  addJoinedId: (id) =>
    set((state) => {
      const joinedIds = new Set(state.joinedIds);
      joinedIds.add(id);
      return { joinedIds };
    }),

  removeJoinedId: (id) =>
    set((state) => {
      const joinedIds = new Set(state.joinedIds);
      joinedIds.delete(id);
      return { joinedIds };
    }),
}));

export function selectJoinedIds(state: PindanSessionState): Set<number> {
  return state.joinedIds;
}
