import { hideThemedLoading, showThemedLoading } from '@/utils/themedLoading';
import { t } from '@/i18n';
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
import { showAppToast } from '@/utils/appToast';

export type GenerateItineraryWallpaperInput = {
  days: ItineraryWallpaperDayInput[];
  eventMeta?: string;
  /** Wallpaper title; defaults to Chinese if omitted. */
  title?: string;
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
    title: input.title,
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
  /** When false, caller owns showThemedLoading/hideThemedLoading (e.g. save + wallpaper in one tap). */
  manageLoading?: boolean;
};

export async function runSaveItineraryWallpaperFlow(
  input: GenerateItineraryWallpaperInput,
  options?: RunSaveItineraryWallpaperOptions,
): Promise<void> {
  const manageLoading = options?.manageLoading !== false;
  if (manageLoading) {
    showThemedLoading({ title: t('itinerary.generatingWallpaper'), mask: true });
  }
  try {
    await generateAndSaveItineraryWallpaper(input);
    showAppToast(
      options?.serverSaved
        ? 'itinerary.wallpaperSavedWithItinerary'
        : 'itinerary.wallpaperSavedToAlbum',
      { icon: 'success' },
    );
  } catch (error) {
    if (error instanceof ItineraryWallpaperError) {
      if (error.code === 'permission') {
        showAppToast(
          options?.serverSaved
            ? 'itinerary.wallpaperPermissionWithItinerary'
            : 'itinerary.wallpaperPermission',
          { icon: 'none' },
        );
        return;
      }
      if (error.code === 'empty' && options?.serverSaved) {
        showAppToast('itinerary.wallpaperEmptyWithItinerary', { icon: 'none' });
        return;
      }
      showAppToast(error.message, { raw: true, icon: 'none' });
      return;
    }
    showAppToast(
      options?.serverSaved
        ? 'itinerary.wallpaperSaveFailedWithItinerary'
        : 'common.requestFailed',
      { icon: 'none' },
    );
  } finally {
    if (manageLoading) {
      hideThemedLoading();
    }
  }
}

export { ITINERARY_WALLPAPER_CANVAS_ID } from './itineraryWallpaperCanvas';
