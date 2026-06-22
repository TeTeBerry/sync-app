import type { ConfirmDialogOptions } from '../hooks/useConfirmDialog';
import { t } from '@/i18n';

export function buildUnfollowActivityConfirmOptions(
  eventTitle?: string,
): ConfirmDialogOptions {
  const trimmedTitle = eventTitle?.trim();
  const titleKey = trimmedTitle
    ? 'eventCard.unfollowConfirmTitleNamed'
    : 'eventCard.unfollowConfirmTitle';
  return {
    title: trimmedTitle ? t(titleKey, { title: trimmedTitle }) : t(titleKey),
    message: trimmedTitle
      ? t('eventCard.unfollowConfirmMessageNamed', { title: trimmedTitle })
      : t('eventCard.unfollowConfirmMessage'),
    confirmText: t('eventCard.unfollowConfirmAction'),
    cancelText: t('common.cancel'),
    brand: true,
  };
}

export function requestUnfollowActivityConfirm(
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>,
  eventTitle?: string,
): Promise<boolean> {
  return confirm(buildUnfollowActivityConfirmOptions(eventTitle));
}
