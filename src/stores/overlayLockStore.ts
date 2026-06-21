import { create } from 'zustand';

interface OverlayLockState {
  lockCount: number;
  acquire: () => void;
  release: () => void;
  reset: () => void;
}

export const useOverlayLockStore = create<OverlayLockState>((set) => ({
  lockCount: 0,
  acquire: () => set((state) => ({ lockCount: state.lockCount + 1 })),
  release: () => set((state) => ({ lockCount: Math.max(0, state.lockCount - 1) })),
  reset: () => set({ lockCount: 0 }),
}));

export const selectOverlayLockActive = (state: OverlayLockState) => state.lockCount > 0;
