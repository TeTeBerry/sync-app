import Taro from '@tarojs/taro';
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
  void Taro.showLoading({ title: '生成海报中…', mask: true });
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
    throw new Error('未获得相册权限');
  }

  void Taro.showLoading({ title: '保存海报中…', mask: true });
  try {
    const path = await generatePersonalityPoster(result, false);
    await saveImageToPhotosAlbum(path);
    void Taro.showToast({ title: '已保存到相册', icon: 'success' });
  } finally {
    void Taro.hideLoading();
  }
}
