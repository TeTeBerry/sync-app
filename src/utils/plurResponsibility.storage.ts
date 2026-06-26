import Taro from '@tarojs/taro';
import {
  createEmptyPlurrResponsibilityState,
  PLURR_RESPONSIBILITY_KEYS,
  type PlurrResponsibilityKey,
  type PlurrResponsibilityState,
} from '@/domains/festival-plan/plurResponsibilityChecklist';

const STORAGE_PREFIX = 'sync:plurr-responsibility:';

function storageKey(activityLegacyId: number): string {
  return `${STORAGE_PREFIX}${activityLegacyId}`;
}

function isValidActivityLegacyId(activityLegacyId: number): boolean {
  return Number.isFinite(activityLegacyId) && activityLegacyId > 0;
}

function isPlurrResponsibilityKey(value: string): value is PlurrResponsibilityKey {
  return (PLURR_RESPONSIBILITY_KEYS as readonly string[]).includes(value);
}

function normalizePlurrResponsibilityState(
  raw: Partial<Record<string, boolean>> | null | undefined,
): PlurrResponsibilityState {
  const state = createEmptyPlurrResponsibilityState();
  if (!raw || typeof raw !== 'object') {
    return state;
  }

  for (const key of PLURR_RESPONSIBILITY_KEYS) {
    if (raw[key] === true) {
      state[key] = true;
    }
  }

  return state;
}

export function loadPlurrResponsibility(
  activityLegacyId: number,
): PlurrResponsibilityState {
  if (!isValidActivityLegacyId(activityLegacyId)) {
    return createEmptyPlurrResponsibilityState();
  }

  try {
    const raw = Taro.getStorageSync(storageKey(activityLegacyId)) as
      | Partial<Record<string, boolean>>
      | undefined;
    return normalizePlurrResponsibilityState(raw);
  } catch {
    return createEmptyPlurrResponsibilityState();
  }
}

export function savePlurrResponsibilityState(
  activityLegacyId: number,
  state: PlurrResponsibilityState,
): void {
  if (!isValidActivityLegacyId(activityLegacyId)) {
    return;
  }

  try {
    Taro.setStorageSync(storageKey(activityLegacyId), state);
  } catch {
    // ignore storage failures
  }
}

export function togglePlurrResponsibilityItem(
  activityLegacyId: number,
  key: PlurrResponsibilityKey,
): PlurrResponsibilityState {
  if (!isValidActivityLegacyId(activityLegacyId) || !isPlurrResponsibilityKey(key)) {
    return createEmptyPlurrResponsibilityState();
  }

  const state = loadPlurrResponsibility(activityLegacyId);
  const next: PlurrResponsibilityState = {
    ...state,
    [key]: !state[key],
  };
  savePlurrResponsibilityState(activityLegacyId, next);
  return next;
}

export function countPlurrResponsibilityChecked(
  state: PlurrResponsibilityState,
): number {
  return PLURR_RESPONSIBILITY_KEYS.reduce(
    (count, key) => count + (state[key] ? 1 : 0),
    0,
  );
}
