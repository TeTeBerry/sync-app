import Taro from '@tarojs/taro';
import { verifyCosUpload } from '../api/sync/uploads';
import { ApiError } from './apiClient';
import { uploadImagesToCos } from './cosUpload';

/** 选择手环图，返回临时文件路径（已尽量压缩）。 */
export async function pickWristbandImagePath(): Promise<string | null> {
  const result = await Taro.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
  }).catch(() => null);

  const path = result?.tempFilePaths?.[0];
  if (!path) return null;

  const compressed = await Taro.compressImage({ src: path, quality: 80 }).catch(
    () => null,
  );
  return compressed?.tempFilePath ?? path;
}

/**
 * STS direct upload to COS, then POST /api/uploads/verify (WeChat img_sec_check).
 * Returns canonical COS URL for post payload.
 */
export async function uploadImageFile(filePath: string): Promise<string> {
  const trimmed = filePath.trim();
  if (!trimmed) {
    throw new Error('图片路径为空');
  }

  const [cosUrl] = await uploadImagesToCos([trimmed]);

  try {
    const verified = await verifyCosUpload(cosUrl);
    if (verified.status !== 'approved') {
      throw new Error('图片未通过安全检测，请更换后重试');
    }
    return verified.url;
  } catch (error) {
    if (error instanceof ApiError) {
      throw new Error(error.message);
    }
    throw error;
  }
}
