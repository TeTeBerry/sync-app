import Taro from '@tarojs/taro';
import { fetchPersonalityTestResult } from '@/api/sync/personalityTest';
import { getResolvedAuthUserId, isLoggedIn } from '@/utils/authStorage';
import type { PersonalityTestResult } from '../types';
import { ensurePersonalityResultIdentity } from './personalityResultIdentity.util';

const STORAGE_KEY = 'sync.personalityTest.result';
const ANONYMOUS_STORAGE_USER_ID = '__anonymous__';

const listeners = new Set<() => void>();

/** Subscribe to local personality test result writes (login restore, submit, logout). */
export function subscribePersonalityTestChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyPersonalityTestChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

type StoredPersonalityTestResult = {
  userId: string;
  result: PersonalityTestResult;
};

function resolveStorageUserId(): string | null {
  if (isLoggedIn()) {
    return getResolvedAuthUserId() || null;
  }
  return ANONYMOUS_STORAGE_USER_ID;
}

function readStoredRecord(): StoredPersonalityTestResult | null {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY) as
      | StoredPersonalityTestResult
      | PersonalityTestResult
      | undefined;
    if (!raw || typeof raw !== 'object') {
      return null;
    }
    if (
      'userId' in raw &&
      typeof raw.userId === 'string' &&
      'result' in raw &&
      raw.result &&
      typeof raw.result === 'object'
    ) {
      return raw as StoredPersonalityTestResult;
    }
    return null;
  } catch {
    return null;
  }
}

function readStoredResultForUser(userId: string): PersonalityTestResult | null {
  const stored = readStoredRecord();
  if (!stored || stored.userId !== userId) {
    return null;
  }
  return stored.result.version === 1 ? stored.result : null;
}

function backfillStoredIdentity(stored: PersonalityTestResult): PersonalityTestResult {
  const withIdentity = ensurePersonalityResultIdentity(stored);
  const identityChanged =
    withIdentity.raverNickname !== stored.raverNickname ||
    withIdentity.raverAvatarKey !== stored.raverAvatarKey ||
    withIdentity.raverIdentityVersion !== stored.raverIdentityVersion;
  if (identityChanged) {
    savePersonalityTestResult(withIdentity);
  }
  return withIdentity;
}

export function loadPersonalityTestResult(): PersonalityTestResult | null {
  const userId = resolveStorageUserId();
  if (!userId) {
    return null;
  }
  const stored = readStoredResultForUser(userId);
  if (!stored) {
    return null;
  }
  return backfillStoredIdentity(stored);
}

export function savePersonalityTestResult(result: PersonalityTestResult): void {
  const userId = resolveStorageUserId();
  if (!userId) {
    return;
  }

  try {
    Taro.setStorageSync(STORAGE_KEY, {
      userId,
      result,
    } satisfies StoredPersonalityTestResult);
    notifyPersonalityTestChange();
  } catch {
    // storage full or unavailable
  }
}

export function clearPersonalityTestResult(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEY);
    notifyPersonalityTestChange();
  } catch {
    // ignore
  }
}

export async function restorePersonalityTestResultFromServer(): Promise<PersonalityTestResult | null> {
  if (!isLoggedIn()) {
    return loadPersonalityTestResult();
  }

  try {
    const remote = await fetchPersonalityTestResult();
    if (remote?.version === 1) {
      const withIdentity = ensurePersonalityResultIdentity(remote);
      savePersonalityTestResult(withIdentity);
      return withIdentity;
    }
  } catch {
    // offline or no saved result yet
  }

  const migrated = readStoredResultForUser(ANONYMOUS_STORAGE_USER_ID);
  if (migrated) {
    const withIdentity = ensurePersonalityResultIdentity(migrated);
    savePersonalityTestResult(withIdentity);
    return withIdentity;
  }

  return loadPersonalityTestResult();
}

/** Prefer server-backed result when logged in; otherwise read local storage. */
export async function resolvePersonalityTestResult(): Promise<PersonalityTestResult | null> {
  return isLoggedIn()
    ? restorePersonalityTestResultFromServer()
    : loadPersonalityTestResult();
}

export const PERSONALITY_TEST_STORAGE_KEY = STORAGE_KEY;
