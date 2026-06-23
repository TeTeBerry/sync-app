import Taro from '@tarojs/taro';

/** Persist performance bundles only on Wi‑Fi (US-ARCH-19). */
export async function isWifiPreferredForPrefetch(): Promise<boolean> {
  try {
    const result = await Taro.getNetworkType();
    return result.networkType === 'wifi';
  } catch {
    return false;
  }
}

export async function isNetworkConnected(): Promise<boolean> {
  try {
    const result = await Taro.getNetworkType();
    return result.networkType !== 'none';
  } catch {
    return true;
  }
}
