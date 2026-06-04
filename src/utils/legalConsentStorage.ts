import Taro from '@tarojs/taro';
import { LEGAL_CONSENT_VERSION } from '../legal';

const LEGAL_CONSENT_KEY = 'sync_legal_consent_version';
const LEGAL_CONSENT_AT_KEY = 'sync_legal_consent_at';

function read(key: string): string | null {
  try {
    const value = Taro.getStorageSync(key);
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  } catch {
    return null;
  }
}

/** Whether the user accepted the current bundled legal version. */
export function hasLegalConsent(): boolean {
  return read(LEGAL_CONSENT_KEY) === LEGAL_CONSENT_VERSION;
}

export function getLegalConsentAcceptedAt(): string | null {
  return read(LEGAL_CONSENT_AT_KEY);
}

export function writeLegalConsent(): void {
  try {
    Taro.setStorageSync(LEGAL_CONSENT_KEY, LEGAL_CONSENT_VERSION);
    Taro.setStorageSync(LEGAL_CONSENT_AT_KEY, new Date().toISOString());
  } catch {
    // storage unavailable
  }
}

export function clearLegalConsent(): void {
  try {
    Taro.removeStorageSync(LEGAL_CONSENT_KEY);
    Taro.removeStorageSync(LEGAL_CONSENT_AT_KEY);
  } catch {
    // ignore
  }
}

/** True when consent exists but predates a policy bump. */
export function isLegalConsentStale(): boolean {
  const stored = read(LEGAL_CONSENT_KEY);
  return Boolean(stored && stored !== LEGAL_CONSENT_VERSION);
}
