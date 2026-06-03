import './loginPromptShared.scss';
import Taro from '@tarojs/taro';
import React, { useCallback, useState } from 'react';
import { Bot, ChevronRight, Zap } from '../../components/icons';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import { isLiveApi } from '../../constants/api';
import { SyncBrandMark } from '../SyncBrandMark';
import { loginWithDev, loginWithWechat } from '../../utils/auth';
import { switchTabTo, ROUTES } from '../../utils/route';

export type LoginPromptHeroProps = {
  className?: string;
  onLoggedIn?: () => void;
  /** Called when user chooses to browse events without logging in. */
  onBrowseEvents?: () => void;
};

export function LoginPromptHero({
  className,
  onLoggedIn,
  onBrowseEvents,
}: LoginPromptHeroProps) {
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!isLiveApi()) {
      void Taro.showToast({ title: '请配置 API 地址', icon: 'none' });
      return;
    }

    setLoggingIn(true);
    try {
      if (process.env.TARO_ENV === 'weapp') {
        await loginWithWechat({ requireProfile: true });
      } else if (process.env.TARO_APP_AUTH_DEV === 'true') {
        await loginWithDev(process.env.TARO_APP_DEV_USER_NAME || '开发用户');
      } else {
        void Taro.showToast({
          title: '请在微信小程序中登录',
          icon: 'none',
        });
        return;
      }
      onLoggedIn?.();
      void Taro.showToast({ title: '登录成功', icon: 'success' });
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : '登录失败，请稍后重试';
      void Taro.showToast({ title: message, icon: 'none' });
    } finally {
      setLoggingIn(false);
    }
  }, [onLoggedIn]);

  const browseEvents = useCallback(() => {
    if (onBrowseEvents) {
      onBrowseEvents();
      return;
    }
    switchTabTo(ROUTES.EVENTS);
  }, [onBrowseEvents]);

  return (
    <View className={className ?? 's-login-prompt-hero'} aria-label="登录引导">
      <View className="s-login-prompt-hero__avatar" aria-hidden>
        <SyncBrandMark className="s-login-prompt-hero__brand-mark" />
      </View>
      <Text className="s-login-prompt-hero__title">登录后开启你的电音之旅</Text>
      <Text className="s-login-prompt-hero__subtitle">
        参加活动、发布组队帖、使用 AI 匹配，并管理专属权益
      </Text>

      <View className="s-login-prompt-hero__highlights" aria-hidden>
        <View className="s-login-prompt-hero__chip">
          <View className="s-login-prompt-hero__chip-icon s-login-prompt-hero__chip-icon--ai">
            <Bot size={14} color="#64d2ff" strokeWidth={2.25} />
          </View>
          <View className="s-login-prompt-hero__chip-label-wrap">
            <Text className="s-login-prompt-hero__chip-label">AI 智能匹配</Text>
          </View>
        </View>
        <View className="s-login-prompt-hero__chip">
          <View className="s-login-prompt-hero__chip-icon">
            <Zap size={14} color="#bf5af2" />
          </View>
          <View className="s-login-prompt-hero__chip-label-wrap">
            <Text className="s-login-prompt-hero__chip-label">活动组队</Text>
          </View>
        </View>
      </View>

      <Button
        className="s-login-prompt-hero__login-btn"
        loading={loggingIn}
        disabled={loggingIn}
        onClick={handleLogin}
      >
        <Text className="s-login-prompt-hero__login-btn-text">
          {process.env.TARO_ENV === 'weapp' ? '微信一键登录' : '登录'}
        </Text>
      </Button>

      <View
        className="s-login-prompt-hero__browse"
        hoverClass="s-login-prompt-hero__browse--pressed"
        onClick={browseEvents}
      >
        <Text className="s-login-prompt-hero__browse-text">先浏览活动</Text>
        <ChevronRight size={16} color="#8e8e93" />
      </View>
    </View>
  );
}
