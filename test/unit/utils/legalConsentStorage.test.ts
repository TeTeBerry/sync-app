import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LEGAL_CONSENT_VERSION } from '@/legal';

const storage = new Map<string, string>();

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: (key: string) => storage.get(key) ?? '',
    setStorageSync: (key: string, value: string) => {
      storage.set(key, value);
    },
    removeStorageSync: (key: string) => {
      storage.delete(key);
    },
  },
}));

import {
  clearLegalConsent,
  hasLegalConsent,
  isLegalConsentStale,
  writeLegalConsent,
} from '@/utils/legalConsentStorage';

describe('legalConsentStorage', () => {
  beforeEach(() => {
    storage.clear();
  });

  it('returns false before consent', () => {
    expect(hasLegalConsent()).toBe(false);
  });

  it('returns true after writeLegalConsent', () => {
    writeLegalConsent();
    expect(hasLegalConsent()).toBe(true);
    expect(isLegalConsentStale()).toBe(false);
  });

  it('detects stale version when stored version differs', () => {
    storage.set('sync_legal_consent_version', '2020-01-01');
    expect(hasLegalConsent()).toBe(false);
    expect(isLegalConsentStale()).toBe(true);
    clearLegalConsent();
    expect(isLegalConsentStale()).toBe(false);
  });

  it('stores current LEGAL_CONSENT_VERSION', () => {
    writeLegalConsent();
    expect(storage.get('sync_legal_consent_version')).toBe(LEGAL_CONSENT_VERSION);
  });
});
