import './LoginInterceptSheet.scss';
import React, { useCallback } from 'react';
import { X } from 'lucide-react-taro';
import { Button } from '../ui';
import { View } from '@tarojs/components';
import { useOverlayLock } from '../../hooks/useOverlayLock';
import { useLoginInterceptStore } from '../../stores/loginInterceptStore';
import { invalidateProfilePackageState } from '../../utils/queryInvalidation';
import { cn } from '../ui';
import { LoginPromptHero } from './LoginPromptHero';

export function LoginInterceptSheet() {
  const open = useLoginInterceptStore((state) => state.isOpen);
  const close = useLoginInterceptStore((state) => state.close);
  const completeAfterLogin = useLoginInterceptStore(
    (state) => state.completeAfterLogin,
  );

  useOverlayLock(open);

  const handleLoggedIn = useCallback(() => {
    void invalidateProfilePackageState();
    completeAfterLogin();
  }, [completeAfterLogin]);

  return (
    <View
      className={cn(
        's-overlay s-overlay--sheet s-login-intercept',
        !open && 's-overlay--off',
      )}
      style={{ zIndex: 'var(--overlay-z-dialog)' }}
      role="presentation"
      aria-hidden={!open}
    >
      <View className="s-overlay__backdrop" onClick={close} />
      <View
        className="s-overlay__panel s-login-intercept__panel"
        role="dialog"
        aria-modal={open}
      >
        <Button className="s-login-intercept__close" onClick={close}>
          <X size={20} color="#8e8e93" />
        </Button>
        <LoginPromptHero
          className="s-login-prompt-hero s-login-intercept__hero"
          onLoggedIn={handleLoggedIn}
          onBrowseEvents={close}
        />
      </View>
    </View>
  );
}
