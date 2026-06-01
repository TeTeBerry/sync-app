import { create } from 'zustand';
import type { PostSharePayload } from '../utils/postShare';

export interface PostShareState {
  pendingShare: PostSharePayload | null;
  setPendingShare: (payload: PostSharePayload) => void;
  clearPendingShare: () => void;
}

export const usePostShareStore = create<PostShareState>((set) => ({
  pendingShare: null,
  setPendingShare: (payload) => set({ pendingShare: payload }),
  clearPendingShare: () => set({ pendingShare: null }),
}));
