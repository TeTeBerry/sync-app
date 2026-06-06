import Taro from '@tarojs/taro';
import { useEffect, useState } from 'react';

export type WechatTheme = 'light' | 'dark';

function readWechatTheme(): WechatTheme {
  try {
    return Taro.getSystemInfoSync().theme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'dark';
  }
}

/** 读取系统深浅色（需 app.config darkmode: true） */
export function useWechatTheme(): WechatTheme {
  const [theme, setTheme] = useState<WechatTheme>(readWechatTheme);

  useEffect(() => {
    const onThemeChange = (res: { theme: WechatTheme }) => {
      setTheme(res.theme === 'dark' ? 'dark' : 'light');
    };
    Taro.onThemeChange(onThemeChange);
    return () => {
      Taro.offThemeChange(onThemeChange);
    };
  }, []);

  return theme;
}
