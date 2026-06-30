import { hideThemedLoading, showThemedLoading } from '@/utils/themedLoading';
import { t } from '@/i18n';
import {
  ensureWritePhotosAlbumPermission,
  promptOpenAlbumSettings,
  saveImageToPhotosAlbum,
} from '@/domains/performance-itinerary/utils/itineraryWallpaperAlbum';
import { renderCountdownPosterToTempFile } from './countdownPosterCanvas';
import { showAppToast } from '@/utils/appToast';

export type CountdownPosterInput = {
  activityLegacyId: number;
  activityName: string;
  activityDate?: string;
  activityLocation?: string;
  daysUntil: number;
};

export async function saveCountdownPoster(input: CountdownPosterInput): Promise<void> {
  const allowed = await ensureWritePhotosAlbumPermission();
  if (!allowed) {
    await promptOpenAlbumSettings();
    throw new Error(t('countdownPoster.albumPermissionDenied'));
  }

  showThemedLoading({ title: t('countdownPoster.generating'), mask: true });
  try {
    const path = await renderCountdownPosterToTempFile(input);
    await saveImageToPhotosAlbum(path);
    showAppToast('countdownPoster.saved', { icon: 'success' });
  } finally {
    hideThemedLoading();
  }
}
