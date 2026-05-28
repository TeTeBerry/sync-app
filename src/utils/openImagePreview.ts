import Taro from "@tarojs/taro";
import { sanitizeRemoteImageUrl } from "./imageUrl";

function isDataUrl(url: string): boolean {
  return /^data:image\//i.test(url);
}

function dataUrlToTempPath(dataUrl: string): Promise<string> {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const ext = /image\/png/i.test(dataUrl) ? "png" : "jpg";
  const filePath = `${Taro.env.USER_DATA_PATH}/preview_${Date.now()}.${ext}`;
  const fs = Taro.getFileSystemManager();

  return new Promise((resolve, reject) => {
    fs.writeFile({
      filePath,
      data: base64,
      encoding: "base64",
      success: () => resolve(filePath),
      fail: (err) => reject(new Error(err.errMsg || "WRITE_FAILED")),
    });
  });
}

async function resolvePreviewUrl(url: string): Promise<string | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (isDataUrl(trimmed)) {
    if (process.env.TARO_ENV === "weapp") {
      return dataUrlToTempPath(trimmed);
    }
    return trimmed;
  }

  return sanitizeRemoteImageUrl(trimmed) ?? trimmed;
}

/** Open native full-screen image preview (WeChat `previewImage` on weapp). */
export async function openImagePreview(
  urls: string[],
  currentIndex = 0,
): Promise<void> {
  if (!urls.length) return;

  const resolved = (
    await Promise.all(urls.map((url) => resolvePreviewUrl(url).catch(() => null)))
  ).filter((url): url is string => Boolean(url));

  if (!resolved.length) return;

  const idx = Math.min(Math.max(0, currentIndex), resolved.length - 1);

  await Taro.previewImage({
    urls: resolved,
    current: resolved[idx],
  });
}

export function openSingleImagePreview(src: string, allUrls?: string[]): void {
  const list = allUrls?.length ? allUrls : [src];
  const index = list.indexOf(src);
  void openImagePreview(list, index >= 0 ? index : 0);
}
