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

function resolvePreviewUrlSync(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isDataUrl(trimmed)) return null;
  return sanitizeRemoteImageUrl(trimmed) ?? trimmed;
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

  return resolvePreviewUrlSync(trimmed);
}

const PREVIEW_COOLDOWN_MS = 400;
let previewInFlight = false;
let previewReleaseTimer: ReturnType<typeof setTimeout> | undefined;

function releasePreviewLock(): void {
  if (previewReleaseTimer) {
    clearTimeout(previewReleaseTimer);
  }
  previewReleaseTimer = setTimeout(() => {
    previewInFlight = false;
    previewReleaseTimer = undefined;
  }, PREVIEW_COOLDOWN_MS);
}

/** Open native full-screen image preview (WeChat `previewImage` on weapp). */
export async function openImagePreview(urls: string[], currentIndex = 0): Promise<void> {
  if (!urls.length || previewInFlight) return;

  previewInFlight = true;

  try {
    const resolved: string[] = [];
    const resolvedFromOriginal: number[] = [];

    for (let i = 0; i < urls.length; i += 1) {
      const url = await resolvePreviewUrl(urls[i]).catch(() => null);
      if (!url) continue;
      resolvedFromOriginal[i] = resolved.length;
      resolved.push(url);
    }

    if (!resolved.length) return;

    const safeOriginalIndex = Math.min(Math.max(0, currentIndex), urls.length - 1);
    const mappedIndex = resolvedFromOriginal[safeOriginalIndex];
    const idx =
      mappedIndex != null ? mappedIndex : Math.min(Math.max(0, currentIndex), resolved.length - 1);

    await Taro.previewImage({
      urls: resolved,
      current: resolved[idx],
    });
  } catch {
    // Native preview already surfaces errors; avoid leaving UI stuck.
  } finally {
    void Taro.hideLoading();
    releasePreviewLock();
  }
}

export function openSingleImagePreview(src: string, allUrls?: string[]): void {
  const list = allUrls?.length ? allUrls : [src];
  const index = list.indexOf(src);
  void openImagePreview(list, index >= 0 ? index : 0);
}
