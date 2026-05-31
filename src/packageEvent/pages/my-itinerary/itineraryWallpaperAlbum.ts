import Taro from "@tarojs/taro";

const ALBUM_SCOPE = "scope.writePhotosAlbum";

export async function ensureWritePhotosAlbumPermission(): Promise<boolean> {
  try {
    const { authSetting } = await Taro.getSetting();
    if (authSetting?.[ALBUM_SCOPE]) {
      return true;
    }
    await Taro.authorize({ scope: ALBUM_SCOPE });
    return true;
  } catch {
    return false;
  }
}

export async function promptOpenAlbumSettings(): Promise<void> {
  const { confirm } = await Taro.showModal({
    title: "需要相册权限",
    content: "请在设置中允许保存图片到相册，以便保存行程屏保。",
    confirmText: "去设置",
    cancelText: "取消",
  });
  if (!confirm) {
    return;
  }
  await Taro.openSetting();
}

export async function saveImageToPhotosAlbum(filePath: string): Promise<void> {
  await Taro.saveImageToPhotosAlbum({ filePath });
}
