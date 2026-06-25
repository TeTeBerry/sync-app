import Taro from '@tarojs/taro';
import { showAppToast } from '@/utils/appToast';

const ALBUM_SCOPE = 'scope.writePhotosAlbum';

function isUserCancel(errMsg?: string): boolean {
  if (!errMsg) return false;
  return /cancel|取消/.test(errMsg);
}

async function ensureWritePhotosAlbumPermission(): Promise<boolean> {
  try {
    const { authSetting } = await Taro.getSetting();
    if (authSetting?.[ALBUM_SCOPE]) return true;
    await Taro.authorize({ scope: ALBUM_SCOPE });
    return true;
  } catch {
    return false;
  }
}

async function promptOpenAlbumSettings(): Promise<void> {
  const { confirm } = await Taro.showModal({
    title: '需要相册权限',
    content: '请在设置中允许保存图片到相册，便于分享给好友。',
    confirmText: '去设置',
    cancelText: '取消',
  });
  if (confirm) {
    await Taro.openSetting();
  }
}

async function saveImageFileToAlbum(filePath: string): Promise<void> {
  const allowed = await ensureWritePhotosAlbumPermission();
  if (!allowed) {
    await promptOpenAlbumSettings();
    throw new Error('未获得相册权限');
  }
  await Taro.saveImageToPhotosAlbum({ filePath });
}

function showWeappShareImageMenu(filePath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    void Taro.showShareImageMenu({
      path: filePath,
      success: () => resolve(),
      fail: (err) => reject(new Error(err.errMsg || '分享失败')),
    });
  });
}

async function offerShareFallback(filePath: string): Promise<void> {
  const { tapIndex } = await Taro.showActionSheet({
    itemList: ['保存到相册', '预览图片'],
  });

  if (tapIndex === 0) {
    await saveImageFileToAlbum(filePath);
    showAppToast('share.savedToAlbum', { icon: 'none', duration: 2800 });
    return;
  }

  if (tapIndex === 1) {
    await Taro.previewImage({ urls: [filePath], current: filePath });
  }
}

/** 小程序调起微信「发送给朋友」图片菜单；失败时提供保存/预览兜底。 */
export async function shareImageFile(path: string): Promise<void> {
  const filePath = path?.trim();
  if (!filePath) {
    throw new Error('图片不存在，请重新生成');
  }

  if (process.env.TARO_ENV === 'weapp') {
    try {
      await showWeappShareImageMenu(filePath);
      return;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (isUserCancel(message)) {
        return;
      }
      await offerShareFallback(filePath);
      return;
    }
  }

  await Taro.previewImage({ urls: [filePath], current: filePath });
}
