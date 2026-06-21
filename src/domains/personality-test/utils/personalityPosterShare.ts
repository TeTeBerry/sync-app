import Taro from '@tarojs/taro';
import { t } from '@/i18n';
import { shareImageFile } from '@/utils/shareImageFile';
import {
  ensureWritePhotosAlbumPermission,
  promptOpenAlbumSettings,
  saveImageToPhotosAlbum,
} from '@/domains/performance-itinerary/utils/itineraryWallpaperAlbum';
import { loadPersonalityTestCatalog } from '../personalityTestCatalog';
import type { PersonalityTestResult } from '../types';
import { renderPersonalityPosterToTempFile } from './personalityPosterCanvas';

export async function generatePersonalityPoster(
  result: PersonalityTestResult,
  teaser: boolean,
): Promise<string> {
  const catalog = await loadPersonalityTestCatalog();
  return renderPersonalityPosterToTempFile({ result, teaser, catalog });
}

export async function sharePersonalityPoster(
  result: PersonalityTestResult,
): Promise<void> {
  void Taro.showLoading({ title: t('personality.generatingPoster'), mask: true });
  try {
    const path = await generatePersonalityPoster(result, true);
    await shareImageFile(path);
  } finally {
    void Taro.hideLoading();
  }
}

export async function savePersonalityPoster(
  result: PersonalityTestResult,
): Promise<void> {
  const allowed = await ensureWritePhotosAlbumPermission();
  if (!allowed) {
    await promptOpenAlbumSettings();
    throw new Error(t('personality.albumPermissionDenied'));
  }

  void Taro.showLoading({ title: t('personality.savingPoster'), mask: true });
  try {
    const path = await generatePersonalityPoster(result, false);
    await saveImageToPhotosAlbum(path);
    void Taro.showToast({ title: t('personality.posterSaved'), icon: 'success' });
  } finally {
    void Taro.hideLoading();
  }
}
