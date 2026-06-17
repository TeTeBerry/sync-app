import Taro from '@tarojs/taro';

/** 与后端一致：Base64 解码后不超过 10MB */
export const MAX_IMAGE_BASE64_BYTES = 10 * 1024 * 1024;

export class ChatImageTooLargeError extends Error {
  constructor() {
    super('IMAGE_TOO_LARGE');
    this.name = 'ChatImageTooLargeError';
  }
}

function base64ByteSize(dataUrl: string): number {
  const base64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}

function readFileAsJpegDataUrl(filePath: string): Promise<string> {
  const fs = Taro.getFileSystemManager();
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath,
      encoding: 'base64',
      success: (res) => {
        const base64 = typeof res.data === 'string' ? res.data : '';
        resolve(`data:image/jpeg;base64,${base64}`);
      },
      fail: (err) => reject(new Error(err.errMsg || 'FILE_READ_FAILED')),
    });
  });
}

async function compressToJpegPath(filePath: string): Promise<string> {
  let path = filePath;
  let quality = 80;

  for (let attempt = 0; attempt < 6; attempt += 1) {
    const compressed = await Taro.compressImage({ src: path, quality }).catch(
      () => null,
    );
    if (compressed?.tempFilePath) {
      path = compressed.tempFilePath;
    }

    const dataUrl = await readFileAsJpegDataUrl(path);
    if (base64ByteSize(dataUrl) <= MAX_IMAGE_BASE64_BYTES) {
      return path;
    }

    quality = Math.max(35, quality - 10);
  }

  const finalDataUrl = await readFileAsJpegDataUrl(path);
  if (base64ByteSize(finalDataUrl) > MAX_IMAGE_BASE64_BYTES) {
    throw new ChatImageTooLargeError();
  }
  return path;
}

/** 选择并压缩图片，返回本地临时路径（行程记账票据等场景）。 */
export async function pickAndCompressChatImage(): Promise<string | null> {
  const result = await Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
  }).catch(() => null);

  const path = result?.tempFilePaths?.[0];
  if (!path) return null;

  try {
    return await compressToJpegPath(path);
  } catch {
    return null;
  }
}

/** WeChat sandbox paths: wxfile:// on device, http(s)://tmp|usr|store in devtools. */
export function isLocalImageFileRef(ref: string): boolean {
  const trimmed = ref.trim();
  if (!trimmed) return false;
  if (/^wxfile:\/\//i.test(trimmed) || /^blob:/i.test(trimmed)) return true;

  if (!/^https?:\/\//i.test(trimmed)) return false;

  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return host === 'tmp' || host === 'usr' || host === 'store';
  } catch {
    return false;
  }
}

export function validateChatImageDataUrl(dataUrl: string): void {
  if (base64ByteSize(dataUrl) > MAX_IMAGE_BASE64_BYTES) {
    throw new ChatImageTooLargeError();
  }
}

/** Compress local temp file and read as JPEG data URL (no cloud upload). */
export async function readLocalImageAsJpegDataUrl(filePath: string): Promise<string> {
  const jpegPath = await compressToJpegPath(filePath);
  const dataUrl = await readFileAsJpegDataUrl(jpegPath);
  validateChatImageDataUrl(dataUrl);
  return dataUrl;
}
