import Taro from '@tarojs/taro';
import { isCloudStorageFileId } from './cloudImage';
import { uploadImageFile } from './uploadImage';
import { isTrustedUploadImageUrl } from './userUploadImageUrl';

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

/** 选择并压缩聊天图片，返回本地临时路径（用于预览与上传） */
export async function pickAndCompressChatImage(): Promise<string | null> {
  const images = await pickAndCompressChatImages(1);
  return images[0] ?? null;
}

/** 选择并压缩多张聊天图片，返回本地临时路径数组 */
export async function pickAndCompressChatImages(maxCount = 6): Promise<string[]> {
  const result = await Taro.chooseImage({
    count: maxCount,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
  }).catch(() => null);

  const paths = result?.tempFilePaths ?? [];
  if (!paths.length) return [];

  const compressed: string[] = [];
  for (const path of paths) {
    try {
      const jpegPath = await compressToJpegPath(path);
      compressed.push(jpegPath);
    } catch {
      // skip failed images
    }
  }
  return compressed;
}

function isRemoteImageRef(ref: string): boolean {
  return /^https?:\/\//i.test(ref.trim());
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

async function uploadOneImageRef(ref: string): Promise<string> {
  const trimmed = ref.trim();
  if (isCloudStorageFileId(trimmed)) {
    if (!isTrustedUploadImageUrl(trimmed)) {
      throw new Error('图片须先通过上传接口提交');
    }
    return trimmed;
  }
  if (isLocalImageFileRef(trimmed)) {
    return uploadImageFile(trimmed);
  }
  if (isRemoteImageRef(trimmed)) {
    if (!isTrustedUploadImageUrl(trimmed)) {
      throw new Error('图片须先通过上传接口提交');
    }
    return trimmed;
  }
  if (/^data:/i.test(trimmed)) {
    throw new Error('图片须先通过上传接口提交');
  }
  return uploadImageFile(trimmed);
}

/** Upload local temp paths to cloud storage; trust prior cloud fileIDs. */
export async function uploadChatImageRefs(refs: string[]): Promise<string[]> {
  return Promise.all(refs.map((ref) => uploadOneImageRef(ref)));
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
