import Taro from '@tarojs/taro';
import {
  ensureWritePhotosAlbumPermission,
  promptOpenAlbumSettings,
  saveImageToPhotosAlbum,
} from './itineraryWallpaperAlbum';
import {
  buildWallpaperSectionsByDate,
  type ItineraryWallpaperDayInput,
} from './itineraryWallpaperParse';
import {
  getWallpaperCanvasSize,
  renderWallpaperToOffscreenTempFile,
  renderWallpaperToPageCanvasTempFile,
} from './itineraryWallpaperCanvas';

export type GenerateItineraryWallpaperInput = {
  days: ItineraryWallpaperDayInput[];
  eventMeta?: string;
};

export class ItineraryWallpaperError extends Error {
  constructor(
    message: string,
    readonly code: 'empty' | 'permission' | 'canvas' | 'save' | 'unsupported',
  ) {
    super(message);
    this.name = 'ItineraryWallpaperError';
  }
}

async function renderTempFile(input: GenerateItineraryWallpaperInput): Promise<string> {
  const sections = buildWallpaperSectionsByDate(input.days);
  if (sections.length === 0) {
    throw new ItineraryWallpaperError('暂无演出行程可生成屏保', 'empty');
  }

  const eventMeta = input.eventMeta?.trim();
  const { width, height, scaleFactor } = getWallpaperCanvasSize(sections, eventMeta);
  const drawParams = {
    width,
    height,
    sections,
    scaleFactor,
    eventMeta,
  };

  try {
    return await renderWallpaperToOffscreenTempFile(drawParams);
  } catch {
    return renderWallpaperToPageCanvasTempFile(drawParams);
  }
}

/**
 * Draw itinerary wallpaper and save to the user's photo album (WeChat mini program).
 */
export async function generateAndSaveItineraryWallpaper(
  input: GenerateItineraryWallpaperInput,
): Promise<void> {
  const hasPermission = await ensureWritePhotosAlbumPermission();
  if (!hasPermission) {
    await promptOpenAlbumSettings();
    throw new ItineraryWallpaperError('未获得相册权限', 'permission');
  }

  let tempFilePath: string;
  try {
    tempFilePath = await renderTempFile(input);
  } catch (error) {
    if (error instanceof ItineraryWallpaperError) {
      throw error;
    }
    throw new ItineraryWallpaperError('屏保生成失败，请稍后重试', 'canvas');
  }

  try {
    await saveImageToPhotosAlbum(tempFilePath);
  } catch {
    throw new ItineraryWallpaperError('保存到相册失败', 'save');
  }
}

export type RunSaveItineraryWallpaperOptions = {
  /** Server itinerary already persisted — show partial success if wallpaper skipped. */
  serverSaved?: boolean;
};

export async function runSaveItineraryWallpaperFlow(
  input: GenerateItineraryWallpaperInput,
  options?: RunSaveItineraryWallpaperOptions,
): Promise<void> {
  void Taro.showLoading({ title: '生成屏保中…', mask: true });
  try {
    await generateAndSaveItineraryWallpaper(input);
    void Taro.showToast({
      title: options?.serverSaved ? '行程已保存，屏保已存入相册' : '已保存到相册',
      icon: 'success',
    });
  } catch (error) {
    if (error instanceof ItineraryWallpaperError) {
      if (error.code === 'permission') {
        void Taro.showToast({
          title: options?.serverSaved
            ? '行程已保存，需相册权限才能保存屏保'
            : '需要相册权限才能保存',
          icon: 'none',
        });
        return;
      }
      if (error.code === 'empty' && options?.serverSaved) {
        void Taro.showToast({
          title: '行程已保存，当前时间轴无法生成屏保',
          icon: 'none',
        });
        return;
      }
      void Taro.showToast({ title: error.message, icon: 'none' });
      return;
    }
    void Taro.showToast({
      title: options?.serverSaved ? '行程已保存，屏保生成失败' : '保存失败，请稍后重试',
      icon: 'none',
    });
  } finally {
    void Taro.hideLoading();
  }
}

export { ITINERARY_WALLPAPER_CANVAS_ID } from './itineraryWallpaperCanvas';
