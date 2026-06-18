import { beforeEach, describe, expect, it, vi } from 'vitest';
import Taro from '@tarojs/taro';
import { LEGAL_CONSENT_VERSION } from '@/legal';
import { UGC_PUBLISH_COMPLIANCE_STORAGE_KEY } from '@/constants/ugcPublishCompliance';
import {
  ackUgcPublishCompliance,
  clearUgcPublishComplianceAck,
  hasUgcPublishComplianceAck,
} from '@/utils/ugcPublishComplianceStorage';

vi.mock('@tarojs/taro', () => ({
  default: {
    getStorageSync: vi.fn(),
    setStorageSync: vi.fn(),
    removeStorageSync: vi.fn(),
  },
}));

describe('ugcPublishComplianceStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('tracks ack for current legal consent version', () => {
    vi.mocked(Taro.getStorageSync).mockReturnValue('1');
    expect(hasUgcPublishComplianceAck()).toBe(true);
    expect(Taro.getStorageSync).toHaveBeenCalledWith(
      UGC_PUBLISH_COMPLIANCE_STORAGE_KEY,
    );
    expect(UGC_PUBLISH_COMPLIANCE_STORAGE_KEY).toContain(LEGAL_CONSENT_VERSION);
  });

  it('persists ack', () => {
    ackUgcPublishCompliance();
    expect(Taro.setStorageSync).toHaveBeenCalledWith(
      UGC_PUBLISH_COMPLIANCE_STORAGE_KEY,
      '1',
    );
  });

  it('clears ack', () => {
    clearUgcPublishComplianceAck();
    expect(Taro.removeStorageSync).toHaveBeenCalledWith(
      UGC_PUBLISH_COMPLIANCE_STORAGE_KEY,
    );
  });
});
