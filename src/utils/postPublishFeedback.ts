import { t } from '@/i18n';
import type { EventDetailPost } from '../types/backend';
import { showAppToast } from './appToast';

export function assertPostPublishedVisible(post: EventDetailPost): void {
  if (post.status !== 'hidden') {
    return;
  }
  const message = post.moderationReason?.trim() || t('common.contentNotApproved');
  showAppToast(message);
  throw new Error(message);
}
