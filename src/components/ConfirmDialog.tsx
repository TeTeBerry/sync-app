import React from 'react';
import { useOverlayLock } from '../hooks/useOverlayLock';
import { Button, cn } from './ui';
import { Text, View } from '@tarojs/components';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  /** Use primary confirm styling; set true only for legacy destructive styling */
  danger?: boolean;
  /** Pink / purple brand accent on the dialog panel */
  brand?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText,
  cancelText,
  danger = false,
  brand = false,
  onConfirm,
  onCancel,
}) => {
  useOverlayLock(open);

  return (
    <View
      className={cn(
        's-overlay s-confirm-dialog',
        brand && 's-confirm-dialog--brand',
        !open && 's-overlay--off',
      )}
      style={{ zIndex: 'var(--overlay-z-dialog)' }}
      role="presentation"
    >
      <View className="s-overlay__backdrop" onClick={onCancel} />
      <View
        className="s-overlay__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
      >
        <View className="s-overlay__body">
          <View className="s-overlay__title-wrap">
            <Text id="confirm-dialog-title" className="s-overlay__title">
              {title}
            </Text>
          </View>
          <View className="s-overlay__message-wrap">
            <Text id="confirm-dialog-message" className="s-overlay__message">
              {message}
            </Text>
          </View>
        </View>
        <View className="s-overlay__actions">
          <Button
            type="default"
            block="s-overlay"
            element="btn"
            modifiers={['cancel']}
            onClick={onCancel}
          >
            <Text className="s-overlay__btn-text">{cancelText}</Text>
          </Button>
          <Button
            type="default"
            block="s-overlay"
            element="btn"
            modifiers={['confirm', danger && 'danger']}
            onClick={onConfirm}
          >
            <Text className="s-overlay__btn-text">{confirmText}</Text>
          </Button>
        </View>
      </View>
    </View>
  );
};

export default ConfirmDialog;
