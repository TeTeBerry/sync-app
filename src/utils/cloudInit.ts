import Taro from '@tarojs/taro';
import { CLOUDBASE_ENV_ID, isCloudStorageUploadEnabled } from '../constants/cloud';

let cloudInitialized = false;

/** Initialize wx.cloud once per mini program session. */
export function initCloudBase(): void {
  if (!isCloudStorageUploadEnabled() || cloudInitialized) {
    return;
  }

  if (!Taro.cloud) {
    console.warn(
      '[cloud] Taro.cloud unavailable — enable CloudBase in WeChat DevTools',
    );
    return;
  }

  Taro.cloud.init({
    env: CLOUDBASE_ENV_ID,
    traceUser: true,
  });
  cloudInitialized = true;
}

/** Test helper */
export function resetCloudInitForTests(): void {
  cloudInitialized = false;
}
