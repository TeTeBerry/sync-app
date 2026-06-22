import React, { useCallback, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';

export type ConfirmDialogOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  /** Brand pink / purple accent panel (default confirm CTA styling). */
  brand?: boolean;
};

type ActiveConfirm = ConfirmDialogOptions & {
  resolve: (confirmed: boolean) => void;
};

/**
 * Themed confirm dialog hook. Prefer this over `Taro.showModal` for user-facing
 * confirmations so copy and styling stay consistent with the app shell.
 */
export function useConfirmDialog(defaults?: {
  confirmText?: string;
  cancelText?: string;
}) {
  const [active, setActive] = useState<ActiveConfirm | null>(null);

  const confirm = useCallback(
    (options: ConfirmDialogOptions): Promise<boolean> =>
      new Promise((resolve) => {
        setActive({ ...options, resolve });
      }),
    [],
  );

  const close = useCallback((confirmed: boolean) => {
    setActive((current) => {
      current?.resolve(confirmed);
      return null;
    });
  }, []);

  const confirmDialog = (
    <ConfirmDialog
      open={active != null}
      title={active?.title ?? ''}
      message={active?.message ?? ''}
      confirmText={active?.confirmText ?? defaults?.confirmText ?? '确认'}
      cancelText={active?.cancelText ?? defaults?.cancelText ?? '取消'}
      danger={active?.danger}
      brand={active?.brand}
      onConfirm={() => close(true)}
      onCancel={() => close(false)}
    />
  );

  return { confirm, confirmDialog };
}
