import { create } from 'zustand';
import type { CurrentUser } from '../types/backend';
import {
  toBuddyMatchProfile,
  type BuddyMatchProfile,
} from '../utils/buddyMatchProfile';

type BuddyMatchProfileState = {
  profile: BuddyMatchProfile | null;
  setFromCurrentUser: (user: CurrentUser | null | undefined) => void;
  clear: () => void;
};

export const useBuddyMatchProfileStore = create<BuddyMatchProfileState>((set) => ({
  profile: null,
  setFromCurrentUser: (user) => set({ profile: toBuddyMatchProfile(user) }),
  clear: () => set({ profile: null }),
}));

export function syncBuddyMatchProfileFromUser(
  user: CurrentUser | null | undefined,
): void {
  useBuddyMatchProfileStore.getState().setFromCurrentUser(user);
}

export function clearBuddyMatchProfileStore(): void {
  useBuddyMatchProfileStore.getState().clear();
}
