import Taro from '@tarojs/taro';
import { isCloudStorageUploadEnabled } from '../constants/cloud';
import { uploadImagesToCloud } from './cloudUpload';

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
 * `wx.cloud.uploadFile` → `cloud://` fileID（Nest 仅存 fileID；展示时 getTempFileURL）。
 */
export async function uploadImageFile(filePath: string): Promise<string> {
  const trimmed = filePath.trim();
  if (!trimmed) {
    throw new Error('图片路径为空');
  }

  if (!isCloudStorageUploadEnabled()) {
    throw new Error('请配置 TARO_APP_CLOUDBASE_ENV_ID 并启用小程序云开发');
  }

  const [fileId] = await uploadImagesToCloud([trimmed]);
  return fileId;
}
