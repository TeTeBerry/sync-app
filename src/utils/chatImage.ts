import Taro from "@tarojs/taro";

/** 与后端一致：Base64 解码后不超过 10MB */
export const MAX_IMAGE_BASE64_BYTES = 10 * 1024 * 1024;

export class ChatImageTooLargeError extends Error {
  constructor() {
    super("IMAGE_TOO_LARGE");
    this.name = "ChatImageTooLargeError";
  }
}

function base64ByteSize(dataUrl: string): number {
  const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("LOAD_FAILED"));
    img.src = src;
  });
}

function canvasToJpegDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL("image/jpeg", quality);
}

async function compressPath(path: string): Promise<string> {
  const img = await loadImage(path);
  const canvas = document.createElement("canvas");
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;
  const maxDim = 1600;

  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_FAILED");
  ctx.drawImage(img, 0, 0, width, height);

  let quality = 0.85;
  let dataUrl = canvasToJpegDataUrl(canvas, quality);
  while (base64ByteSize(dataUrl) > MAX_IMAGE_BASE64_BYTES && quality > 0.35) {
    quality -= 0.1;
    dataUrl = canvasToJpegDataUrl(canvas, quality);
  }

  if (base64ByteSize(dataUrl) > MAX_IMAGE_BASE64_BYTES) {
    throw new ChatImageTooLargeError();
  }

  return dataUrl;
}

/** 选择并压缩聊天图片，返回 JPEG data URL */
export async function pickAndCompressChatImage(): Promise<string | null> {
  const images = await pickAndCompressChatImages(1);
  return images[0] ?? null;
}

/** 选择并压缩多张聊天图片，返回 JPEG data URL 数组 */
export async function pickAndCompressChatImages(maxCount = 6): Promise<string[]> {
  const result = await Taro.chooseImage({
    count: maxCount,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
  }).catch(() => null);

  const paths = result?.tempFilePaths ?? [];
  if (!paths.length) return [];

  const compressed: string[] = [];
  for (const path of paths) {
    try {
      const dataUrl = await compressPath(path);
      compressed.push(dataUrl);
    } catch {
      // skip failed images
    }
  }
  return compressed;
}

export function validateChatImageDataUrl(dataUrl: string): void {
  if (base64ByteSize(dataUrl) > MAX_IMAGE_BASE64_BYTES) {
    throw new ChatImageTooLargeError();
  }
}

/** 将 File / Blob 读取为 Data URL */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("FILE_READ_FAILED"));
    reader.readAsDataURL(file);
  });
}
