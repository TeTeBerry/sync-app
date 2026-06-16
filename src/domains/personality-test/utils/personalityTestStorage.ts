import Taro from '@tarojs/taro';
import { getResolvedAuthUserId, isLoggedIn } from '@/utils/authStorage';
import type { PersonalityTestResult } from '../types';

const STORAGE_KEY = 'sync.personalityTest.result';

type StoredPersonalityTestResult = {
  userId: string;
  result: PersonalityTestResult;
};

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

export function loadPersonalityTestResult(): PersonalityTestResult | null {
  if (!isLoggedIn()) {
    return null;
  }

  const userId = getResolvedAuthUserId();
  if (!userId) {
    return null;
  }

  const stored = readStoredRecord();
  if (!stored || stored.userId !== userId) {
    return null;
  }

  return stored.result.version === 1 ? stored.result : null;
}

export function savePersonalityTestResult(result: PersonalityTestResult): void {
  const userId = getResolvedAuthUserId();
  if (!userId) {
    return;
  }

  try {
    Taro.setStorageSync(STORAGE_KEY, {
      userId,
      result,
    } satisfies StoredPersonalityTestResult);
  } catch {
    // storage full or unavailable
  }
}

export function clearPersonalityTestResult(): void {
  try {
    Taro.removeStorageSync(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export const PERSONALITY_TEST_STORAGE_KEY = STORAGE_KEY;
