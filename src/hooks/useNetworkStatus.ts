import { useEffect, useState } from 'react';
import Taro from '@tarojs/taro';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    void Taro.getNetworkType({
      success: (res) => {
        setIsConnected(res.networkType !== 'none');
      },
    });

    const handler = (res: Taro.onNetworkStatusChange.CallbackResult) => {
      setIsConnected(res.isConnected);
    };

    Taro.onNetworkStatusChange(handler);
    return () => {
      Taro.offNetworkStatusChange(handler);
    };
  }, []);

  return { isConnected };
}
