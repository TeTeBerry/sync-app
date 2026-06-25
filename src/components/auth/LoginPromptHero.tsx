import './loginPromptShared.scss';
import Taro from '@tarojs/taro';
import React, { useCallback, useState } from 'react';
import { Bot, ChevronRight, Zap } from '../../components/icons';
import { Button } from '../ui';
import { Text, View } from '@tarojs/components';
import { isLiveApi } from '../../constants/api';
import { SyncBrandMark } from '../SyncBrandMark';
import { LegalConsentRow } from '../legal/LegalConsentRow';
import { loginWithWechat } from '../../utils/auth';
import { hasLegalConsent, writeLegalConsent } from '../../utils/legalConsentStorage';
import { switchTabTo, ROUTES } from '../../utils/route';
import { useT } from '@/hooks/useI18n';
import { showAppToast } from '@/utils/appToast';

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
  const t = useT();
  const [loggingIn, setLoggingIn] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(() => hasLegalConsent());

  const handleLogin = useCallback(async () => {
    if (!legalAccepted) {
      showAppToast('auth.acceptLegalToast', { icon: 'none' });
      return;
    }

    if (!isLiveApi()) {
      showAppToast('auth.configureApi', { icon: 'none' });
      return;
    }

    setLoggingIn(true);
    try {
      if (process.env.TARO_ENV === 'weapp') {
        await loginWithWechat();
      } else {
        showAppToast('auth.wechatOnly', { icon: 'none' });
        return;
      }
      writeLegalConsent();
      onLoggedIn?.();
      showAppToast('auth.loginSuccess', { icon: 'success' });
    } catch (error) {
      const message =
        error instanceof Error && error.message.trim()
          ? error.message
          : t('auth.loginFailed');
      showAppToast(message, { raw: true, icon: 'none' });
    } finally {
      setLoggingIn(false);
    }
  }, [legalAccepted, onLoggedIn, t]);

  const browseEvents = useCallback(() => {
    if (onBrowseEvents) {
      onBrowseEvents();
      return;
    }
    switchTabTo(ROUTES.EVENTS);
  }, [onBrowseEvents]);

  return (
    <View
      className={className ?? 's-login-prompt-hero'}
      aria-label={t('auth.loginHeroAria')}
    >
      <View className="s-login-prompt-hero__avatar" aria-hidden>
        <SyncBrandMark className="s-login-prompt-hero__brand-mark" />
      </View>
      <Text className="s-login-prompt-hero__title">{t('auth.loginHeroTitle')}</Text>
      <Text className="s-login-prompt-hero__subtitle">
        {t('auth.loginHeroSubtitle')}
      </Text>

      <View className="s-login-prompt-hero__highlights" aria-hidden>
        <View className="s-login-prompt-hero__chip">
          <View className="s-login-prompt-hero__chip-icon s-login-prompt-hero__chip-icon--ai">
            <Bot size={14} color="#64d2ff" strokeWidth={2.25} />
          </View>
          <View className="s-login-prompt-hero__chip-label-wrap">
            <Text className="s-login-prompt-hero__chip-label">{t('auth.chipAi')}</Text>
          </View>
        </View>
        <View className="s-login-prompt-hero__chip">
          <View className="s-login-prompt-hero__chip-icon">
            <Zap size={14} color="#bf5af2" />
          </View>
          <View className="s-login-prompt-hero__chip-label-wrap">
            <Text className="s-login-prompt-hero__chip-label">
              {t('auth.chipTeam')}
            </Text>
          </View>
        </View>
      </View>

      <LegalConsentRow checked={legalAccepted} onCheckedChange={setLegalAccepted} />

      <Button
        className="s-login-prompt-hero__login-btn"
        loading={loggingIn}
        disabled={loggingIn || !legalAccepted}
        onClick={handleLogin}
      >
        <Text className="s-login-prompt-hero__login-btn-text">
          {process.env.TARO_ENV === 'weapp' ? t('auth.wechatLogin') : t('auth.login')}
        </Text>
      </Button>

      <View
        className="s-login-prompt-hero__browse"
        hoverClass="s-login-prompt-hero__browse--pressed"
        onClick={browseEvents}
      >
        <Text className="s-login-prompt-hero__browse-text">
          {t('auth.browseFirst')}
        </Text>
        <ChevronRight size={16} color="#8e8e93" />
      </View>
    </View>
  );
}
