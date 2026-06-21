import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { Button } from '../ui';
import { t } from '@/i18n/translate';
import { Text, View } from '@tarojs/components';

type Props = {
  children: ReactNode;
  onRetry?: () => void;
  /** Console label prefix (default Profile). */
  logTag?: string;
};

type State = {
  hasError: boolean;
};

/** Prevents uncaught render errors from leaving the profile tab as a blank black screen. */
export class ProfileTabErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    const tag = this.props.logTag ?? 'Profile';
    console.error(`[${tag}] render error`, error, info.componentStack);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="s-profile-error-fallback">
          <Text className="s-profile-error-fallback__title">
            {t('profile.errorTitle')}
          </Text>
          <Text className="s-profile-error-fallback__hint">
            {t('profile.errorHint')}
          </Text>
          <Button
            className="s-profile-error-fallback__btn"
            onClick={() => {
              this.handleRetry();
              void Taro.showToast({ title: t('profile.retried'), icon: 'none' });
            }}
          >
            <Text className="s-btn-label">{t('profile.retry')}</Text>
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
