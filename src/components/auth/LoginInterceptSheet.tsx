import './LoginInterceptSheet.scss';
import React, { useCallback } from 'react';
import { X } from '../../components/icons';
import { Button, Sheet } from '../ui';
import { View } from '@tarojs/components';
import { useLoginInterceptStore } from '../../stores/loginInterceptStore';
import { invalidateProfileSummary } from '../../utils/queryInvalidation';
import { LoginPromptHero } from './LoginPromptHero';

export function LoginInterceptSheet() {
  const open = useLoginInterceptStore((state) => state.isOpen);
  const close = useLoginInterceptStore((state) => state.close);
  const completeAfterLogin = useLoginInterceptStore(
    (state) => state.completeAfterLogin,
  );

  const handleLoggedIn = useCallback(() => {
    void invalidateProfileSummary();
    completeAfterLogin();
  }, [completeAfterLogin]);

  return (
    <Sheet
      open={open}
      onClose={close}
      overlayClassName="s-login-intercept"
      panelClassName="s-login-intercept__panel"
      zIndex="var(--overlay-z-dialog)"
      panelRole="dialog"
      panelAriaModal={open}
    >
      <Button className="s-login-intercept__close" onClick={close}>
        <X size={20} color="#8e8e93" />
      </Button>
      <LoginPromptHero
        className="s-login-prompt-hero s-login-intercept__hero"
        onLoggedIn={handleLoggedIn}
        onBrowseEvents={close}
      />
    </Sheet>
  );
}
