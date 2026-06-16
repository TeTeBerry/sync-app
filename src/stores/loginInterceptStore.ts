import { create } from 'zustand';

export type LoginInterceptFeature =
  | 'general'
  | 'activity'
  | 'ai_assistant'
  | 'notification'
  | 'social';

type LoginInterceptState = {
  isOpen: boolean;
  feature: LoginInterceptFeature;
  pendingAction: (() => void) | null;
};

type LoginInterceptActions = {
  show: (feature: LoginInterceptFeature, pendingAction: () => void) => void;
  close: () => void;
  completeAfterLogin: () => void;
};

export const useLoginInterceptStore = create<
  LoginInterceptState & LoginInterceptActions
>((set, get) => ({
  isOpen: false,
  feature: 'general',
  pendingAction: null,

  show: (feature, pendingAction) => set({ isOpen: true, feature, pendingAction }),

  close: () => set({ isOpen: false, feature: 'general', pendingAction: null }),

  completeAfterLogin: () => {
    const { pendingAction } = get();
    set({ isOpen: false, feature: 'general', pendingAction: null });
    pendingAction?.();
  },
}));
