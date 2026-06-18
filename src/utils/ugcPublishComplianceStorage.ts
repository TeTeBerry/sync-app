import Taro from '@tarojs/taro';
import { UGC_PUBLISH_COMPLIANCE_STORAGE_KEY } from '../constants/ugcPublishCompliance';

export function hasUgcPublishComplianceAck(): boolean {
  try {
    return Taro.getStorageSync(UGC_PUBLISH_COMPLIANCE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function ackUgcPublishCompliance(): void {
  try {
    Taro.setStorageSync(UGC_PUBLISH_COMPLIANCE_STORAGE_KEY, '1');
  } catch {
    // Best-effort; user can confirm again next publish.
  }
}

export function clearUgcPublishComplianceAck(): void {
  try {
    Taro.removeStorageSync(UGC_PUBLISH_COMPLIANCE_STORAGE_KEY);
  } catch {
    // ignore
  }
}
