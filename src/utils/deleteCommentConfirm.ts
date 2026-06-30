import type { ConfirmDialogOptions } from '../hooks/useConfirmDialog';
import { t } from '@/i18n';

export function buildDeleteCommentConfirmOptions(): ConfirmDialogOptions {
  return {
    title: t('comments.deleteConfirmTitle'),
    message: t('comments.deleteConfirmMessage'),
    confirmText: t('comments.deleteConfirmText'),
    cancelText: t('common.cancel'),
    brand: true,
    danger: true,
  };
}

export function requestDeleteCommentConfirm(
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>,
): Promise<boolean> {
  return confirm(buildDeleteCommentConfirmOptions());
}
