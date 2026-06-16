import Taro from '@tarojs/taro';
import type { PersonalityTestResult } from '../types';

const STORAGE_KEY = 'sync.personalityTest.result';

export function savePersonalityTestResult(result: PersonalityTestResult): void {
  Taro.setStorageSync(STORAGE_KEY, result);
}

export function loadPersonalityTestResult(): PersonalityTestResult | null {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY) as PersonalityTestResult | undefined;
    if (!raw || raw.version !== 1) {
      return null;
    }
    return raw;
  } catch {
    return null;
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
