import type { NavigationState } from './navigationStore';

export const selectRouteTransitionActive = (state: NavigationState) =>
  state.routeTransition.active;

export const selectRouteTransitionTabTarget = (state: NavigationState) =>
  state.routeTransition.tabTarget;

export const selectActiveActivityLegacyId = (state: NavigationState) =>
  state.activeActivityLegacyId;

export const selectConsumeProfileIntent = (state: NavigationState) =>
  state.consumeProfileIntent;

export const selectConsumeAiAssistantIntent = (state: NavigationState) =>
  state.consumeAiAssistantIntent;

export const selectSetActiveActivityLegacyId = (state: NavigationState) =>
  state.setActiveActivityLegacyId;
