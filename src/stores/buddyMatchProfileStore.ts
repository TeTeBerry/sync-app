import { create } from 'zustand';
import type { CurrentUser } from '../types/backend';
import {
  toBuddyMatchProfile,
  type BuddyMatchProfile,
} from '../utils/buddyMatchProfile';

type BuddyMatchProfileState = {
  profile: BuddyMatchProfile | null;
  /** True after `users/me` (or explicit patch) has been applied at least once this session. */
  hydrated: boolean;
  setFromCurrentUser: (user: CurrentUser | null | undefined) => void;
  clear: () => void;
};

export const useBuddyMatchProfileStore = create<BuddyMatchProfileState>((set) => ({
  profile: null,
  hydrated: false,
  setFromCurrentUser: (user) =>
    set({ profile: toBuddyMatchProfile(user), hydrated: true }),
  clear: () => set({ profile: null, hydrated: false }),
}));

export function syncBuddyMatchProfileFromUser(
  user: CurrentUser | null | undefined,
): void {
  useBuddyMatchProfileStore.getState().setFromCurrentUser(user);
}

export function clearBuddyMatchProfileStore(): void {
  useBuddyMatchProfileStore.getState().clear();
}
