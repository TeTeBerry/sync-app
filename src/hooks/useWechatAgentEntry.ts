import { useCallback, useEffect, useState } from 'react';
import Taro from '@tarojs/taro';

type WechatAgentSupport = {
  supported: boolean;
  checking: boolean;
};

/**
 * Guards wx.openAgent for WeChat AI dev mode (P3 / Nightly).
 */
export function useWechatAgentEntry() {
  const [support, setSupport] = useState<WechatAgentSupport>({
    supported: false,
    checking: true,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (process.env.TARO_ENV !== 'weapp') {
        if (!cancelled) {
          setSupport({ supported: false, checking: false });
        }
        return;
      }
      if (!Taro.canIUse('openAgent')) {
        if (!cancelled) {
          setSupport({ supported: false, checking: false });
        }
        return;
      }
      try {
        const wxApi = Taro as unknown as {
          checkIsSupportAgent?: () => Promise<{ support: boolean }>;
        };
        const result = await wxApi.checkIsSupportAgent?.();
        if (!cancelled) {
          setSupport({
            supported: result?.support === true,
            checking: false,
          });
        }
      } catch {
        if (!cancelled) {
          setSupport({ supported: false, checking: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openRecruitDiscovery = useCallback(
    (eventName: string) => {
      if (!support.supported) return;
      const message = eventName.trim()
        ? `筛选「${eventName.trim()}」的公开招募帖`
        : '筛选这场活动的公开招募帖';
      void Taro.openAgent({ followUpMessage: message });
    },
    [support.supported],
  );

  return {
    wechatAgentSupported: support.supported,
    wechatAgentChecking: support.checking,
    openRecruitDiscovery,
  };
}
