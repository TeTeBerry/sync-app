export const PLURR_RESPONSIBILITY_KEYS = [
  'hydration',
  'tell_someone',
  'earplugs_shoes',
  'exit_plan',
  'leave_no_trace',
  'look_out',
] as const;

export type PlurrResponsibilityKey = (typeof PLURR_RESPONSIBILITY_KEYS)[number];

export const PLURR_RESPONSIBILITY_ORDER: readonly PlurrResponsibilityKey[] =
  PLURR_RESPONSIBILITY_KEYS;

export const PLURR_RESPONSIBILITY_TOTAL = PLURR_RESPONSIBILITY_KEYS.length;

export type PlurrResponsibilityState = Record<PlurrResponsibilityKey, boolean>;

export function createEmptyPlurrResponsibilityState(): PlurrResponsibilityState {
  return {
    hydration: false,
    tell_someone: false,
    earplugs_shoes: false,
    exit_plan: false,
    leave_no_trace: false,
    look_out: false,
  };
}
