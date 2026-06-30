import Taro from '@tarojs/taro';
import { hideThemedLoading, showThemedLoading } from '@/utils/themedLoading';
import { t } from '@/i18n';
import { shareImageFile } from '@/utils/shareImageFile';
import {
  ensureWritePhotosAlbumPermission,
  promptOpenAlbumSettings,
  saveImageToPhotosAlbum,
} from '@/domains/performance-itinerary/utils/itineraryWallpaperAlbum';
import type { AiBuddyPostFormValues } from '@/types/buddyPost';
import { renderRecruitPostPosterToTempFile } from './recruitPostPosterCanvas';
import { showAppToast } from '@/utils/appToast';

export type RecruitPostPosterInput = {
  activityLegacyId: number;
  activityName: string;
  form: AiBuddyPostFormValues;
};

async function buildPosterPath(input: RecruitPostPosterInput): Promise<string> {
  return renderRecruitPostPosterToTempFile(input);
}

export async function saveRecruitPostPoster(
  input: RecruitPostPosterInput,
): Promise<void> {
  const allowed = await ensureWritePhotosAlbumPermission();
  if (!allowed) {
    await promptOpenAlbumSettings();
    throw new Error(t('recruitPoster.albumPermissionDenied'));
  }

  showThemedLoading({ title: t('recruitPoster.generating'), mask: true });
  try {
    const path = await buildPosterPath(input);
    await saveImageToPhotosAlbum(path);
    showAppToast('recruitPoster.saved', { icon: 'success' });
  } finally {
    hideThemedLoading();
  }
}

export async function shareRecruitPostPoster(
  input: RecruitPostPosterInput,
): Promise<void> {
  showThemedLoading({ title: t('recruitPoster.generating'), mask: true });
  try {
    const path = await buildPosterPath(input);
    await shareImageFile(path);
  } finally {
    hideThemedLoading();
  }
}

export async function promptRecruitPostPosterAfterPublish(
  input: RecruitPostPosterInput,
): Promise<void> {
  try {
    const result = await Taro.showActionSheet({
      itemList: [t('recruitPoster.save'), t('recruitPoster.share')],
    });
    if (result.tapIndex === 0) {
      await saveRecruitPostPoster(input);
      return;
    }
    if (result.tapIndex === 1) {
      await shareRecruitPostPoster(input);
    }
  } catch {
    // user cancelled action sheet
  }
}
